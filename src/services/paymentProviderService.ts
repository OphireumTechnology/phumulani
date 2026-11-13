/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Enterprise Payment Provider & Gateway Integration Service
 * Grounded in Master Directive Phase 28 (M28.08): Real Payment Provider Architecture
 * 
 * Strict Invariants:
 * 1. Never stores raw PAN/CVV or sensitive credit card data.
 * 2. Never marks a donation as paid based solely on frontend success URLs or client requests.
 * 3. Never issues an official 501(c)(3) tax receipt without verified provider confirmation.
 * 4. Reports PAYMENT_GATEWAY=NOT_CONNECTED when merchant credentials are missing.
 * 5. Requires HMAC-SHA256 signature verification on all incoming webhooks.
 * 6. Enforces idempotent payment event processing with idempotency records.
 */

import crypto from 'crypto';
import { PostgresPersistenceAdapter } from './postgresPersistenceAdapter';
import { EnvironmentService } from './environmentService';

export interface PaymentGatewayConfig {
  provider: 'STRIPE' | 'AUTHORIZE_NET' | 'PLAID_ACH' | 'NOT_CONFIGURED';
  status: 'CONNECTED' | 'NOT_CONNECTED' | 'BLOCKED_BY_CREDENTIALS';
  liveCheckoutEnabled: boolean;
  webhookSecretConfigured: boolean;
  supportedCurrencies: string[];
  minimumAmountCents: number;
  maximumAmountCents: number;
}

export interface CheckoutSessionRequest {
  donorId?: string;
  donorName: string;
  donorEmail: string;
  amountDollars: number;
  programDesignation: string; // e.g. PROG-001, PROG-002, or GENERAL_UNRESTRICTED
  campaignId?: string;
  isRecurring: boolean;
  frequency?: 'ONE_TIME' | 'MONTHLY' | 'ANNUAL';
  clientIp?: string;
  idempotencyKey: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl?: string;
  status: 'PENDING_PAYMENT' | 'BLOCKED_GATEWAY_NOT_CONNECTED';
  amountCents: number;
  currency: string;
  idempotencyKey: string;
  clientSecret?: string;
  error?: string;
}

export interface WebhookEventPayload {
  id: string;
  type: 'payment_intent.succeeded' | 'payment_intent.payment_failed' | 'charge.refunded' | 'charge.dispute.created';
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      customer_email?: string;
      metadata?: {
        donorName?: string;
        donorEmail?: string;
        programDesignation?: string;
        campaignId?: string;
        donationId?: string;
        idempotencyKey?: string;
      };
      receipt_email?: string;
      refunded?: boolean;
      failure_message?: string;
    };
  };
  created: number;
}

export interface ProcessedWebhookResult {
  success: boolean;
  eventId: string;
  eventType: string;
  processedAt: string;
  donationId?: string;
  receiptNumber?: string;
  reconciliationStatus: 'RECONCILED' | 'EXCEPTION_FLAGGED' | 'DUPLICATE_IGNORED' | 'SIGNATURE_FAILED';
  details: string;
}

export class PaymentProviderService {
  private static instance: PaymentProviderService;
  private dbAdapter: PostgresPersistenceAdapter;
  private processedEvents: Set<string> = new Set();
  private idempotencyCache: Map<string, CheckoutSessionResult> = new Map();

  private constructor() {
    this.dbAdapter = PostgresPersistenceAdapter.getInstance();
  }

  public static getInstance(): PaymentProviderService {
    if (!PaymentProviderService.instance) {
      PaymentProviderService.instance = new PaymentProviderService();
    }
    return PaymentProviderService.instance;
  }

  /**
   * Evaluates payment gateway configuration truthfully from environment variables.
   */
  public getGatewayConfig(): PaymentGatewayConfig {
    const secretKey = process.env.PAYMENT_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '';
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '';
    const isConfigured = secretKey.trim().length > 0;

    return {
      provider: isConfigured ? 'STRIPE' : 'NOT_CONFIGURED',
      status: isConfigured ? 'CONNECTED' : 'NOT_CONNECTED',
      liveCheckoutEnabled: isConfigured,
      webhookSecretConfigured: webhookSecret.trim().length > 0,
      supportedCurrencies: ['usd'],
      minimumAmountCents: 100, // $1.00 min
      maximumAmountCents: 25000000, // $250,000 max single transaction
    };
  }

  /**
   * Initiates a secure donation checkout session.
   * If credentials are missing, returns status BLOCKED_GATEWAY_NOT_CONNECTED.
   * When Stripe secret key is configured, calls the live Stripe Checkout Sessions API.
   * Enforces persistent idempotency via idempotencyKey.
   */
  public async createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResult> {
    const config = this.getGatewayConfig();

    // Persistent + in-memory idempotency check
    if (this.idempotencyCache.has(request.idempotencyKey)) {
      return this.idempotencyCache.get(request.idempotencyKey)!;
    }
    const existingSessions = await this.dbAdapter.select<any>(
      'payment_sessions',
      (r) => r.idempotency_key === request.idempotencyKey
    );
    if (existingSessions.length > 0) {
      const existing = existingSessions[0];
      const cached: CheckoutSessionResult = {
        sessionId: existing.id,
        checkoutUrl: existing.checkout_url,
        status: existing.status || 'PENDING_PAYMENT',
        amountCents: existing.amount_cents,
        currency: existing.currency || 'usd',
        idempotencyKey: request.idempotencyKey,
      };
      this.idempotencyCache.set(request.idempotencyKey, cached);
      return cached;
    }

    // Input validation
    if (!request.amountDollars || request.amountDollars < 1) {
      throw new Error('Minimum donation amount is $1.00.');
    }
    if (request.amountDollars > 250000) {
      throw new Error('Donations exceeding $250,000 require manual wire transfer review by the Finance Committee.');
    }
    if (!request.donorEmail || !request.donorEmail.includes('@')) {
      throw new Error('A valid donor email address is required for 501(c)(3) tax substantiation.');
    }

    const amountCents = Math.round(request.amountDollars * 100);

    if (!config.liveCheckoutEnabled) {
      const sessionId = `cs_blocked_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
      const blockedResult: CheckoutSessionResult = {
        sessionId,
        status: 'BLOCKED_GATEWAY_NOT_CONNECTED',
        amountCents,
        currency: 'usd',
        idempotencyKey: request.idempotencyKey,
        error: 'PAYMENT_GATEWAY=NOT_CONNECTED. Live merchant processor credentials (PAYMENT_SECRET_KEY) are not configured in environment.',
      };
      this.idempotencyCache.set(request.idempotencyKey, blockedResult);
      return blockedResult;
    }

    const secretKey = (process.env.PAYMENT_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '').trim();
    const publicBaseUrl = (process.env.PUBLIC_APP_URL || 'https://phumulani.org').replace(/\/+$/, '');
    const formBody = new URLSearchParams({
      mode: request.isRecurring ? 'subscription' : 'payment',
      customer_email: request.donorEmail.trim(),
      success_url: `${publicBaseUrl}/?donation=pending_verification&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${publicBaseUrl}/?donation=cancelled`,
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][unit_amount]': String(amountCents),
      'line_items[0][price_data][product_data][name]': `Phumulani 501(c)(3) Support — ${request.programDesignation || 'General'}`,
      'metadata[donorName]': request.donorName || 'Community Supporter',
      'metadata[donorEmail]': request.donorEmail.trim(),
      'metadata[programDesignation]': request.programDesignation || 'GENERAL_UNRESTRICTED',
      'metadata[campaignId]': request.campaignId || 'unrestricted',
      'metadata[idempotencyKey]': request.idempotencyKey,
    });
    if (request.isRecurring) {
      formBody.set('line_items[0][price_data][recurring][interval]', request.frequency === 'ANNUAL' ? 'year' : 'month');
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': request.idempotencyKey,
      },
      body: formBody.toString(),
    });

    const stripeData: any = await stripeRes.json().catch(() => ({}));
    if (!stripeRes.ok || !stripeData?.id || !stripeData?.url) {
      const apiErr = stripeData?.error?.message || `Stripe Checkout API returned HTTP ${stripeRes.status}`;
      await this.dbAdapter.insertDurableWithRetry(
        'audit_logs',
        {
          id: `audit-pay-err-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
          timestamp: new Date().toISOString(),
          actor_role: 'payment_gateway_system',
          action: 'payment:checkout_session_failed',
          details: `Checkout creation failed (${request.idempotencyKey}): ${apiErr}`,
        },
        { context: 'paymentProviderService:createCheckoutSession' }
      );
      throw new Error(`STRIPE_CHECKOUT_FAILED: ${apiErr}`);
    }

    const activeResult: CheckoutSessionResult = {
      sessionId: stripeData.id,
      checkoutUrl: stripeData.url,
      status: 'PENDING_PAYMENT',
      amountCents,
      currency: stripeData.currency || 'usd',
      idempotencyKey: request.idempotencyKey,
      ...(stripeData.client_secret ? { clientSecret: stripeData.client_secret } : {}),
    };

    // Durably store pending checkout record in DB
    await this.dbAdapter.insertDurableWithRetry(
      'payment_sessions',
      {
        id: stripeData.id,
        donor_email: request.donorEmail.trim(),
        donor_name: request.donorName,
        amount_cents: amountCents,
        currency: stripeData.currency || 'usd',
        checkout_url: stripeData.url,
        program_designation: request.programDesignation,
        campaign_id: request.campaignId || 'unrestricted',
        status: 'PENDING_PAYMENT',
        idempotency_key: request.idempotencyKey,
        created_at: new Date().toISOString(),
      },
      { context: 'paymentProviderService:saveSession' }
    );

    this.idempotencyCache.set(request.idempotencyKey, activeResult);
    return activeResult;
  }

  /**
   * Validates HMAC-SHA256 signature for incoming webhooks across all v1= signatures.
   * Format: "t=1614555845,v1=5257a869e7ecebeda32affa62cd..."
   */
  public verifyWebhookSignature(payloadRaw: string, signatureHeader: string, secretOverride?: string): boolean {
    const webhookSecret = (secretOverride || process.env.PAYMENT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '').trim();
    if (!webhookSecret || !signatureHeader || !payloadRaw) {
      return false;
    }

    try {
      const parts = signatureHeader.split(',');
      let timestamp = '';
      const v1Signatures: string[] = [];

      for (const part of parts) {
        const eqIdx = part.indexOf('=');
        if (eqIdx === -1) continue;
        const k = part.slice(0, eqIdx).trim();
        const v = part.slice(eqIdx + 1).trim();
        if (k === 't') timestamp = v;
        if (k === 'v1' && v) v1Signatures.push(v);
      }

      if (!timestamp || v1Signatures.length === 0) {
        return false;
      }

      // Check replay attack window (must be within 5 minutes / 300 seconds)
      const currentTime = Math.floor(Date.now() / 1000);
      const eventTime = parseInt(timestamp, 10);
      if (isNaN(eventTime) || Math.abs(currentTime - eventTime) > 300) {
        return false;
      }

      // Compute HMAC-SHA256 of timestamp + '.' + payloadRaw
      const signedPayload = `${timestamp}.${payloadRaw}`;
      const expectedHex = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload, 'utf8')
        .digest('hex');
      const expectedBuf = Buffer.from(expectedHex, 'hex');

      return v1Signatures.some((sigHex) => {
        if (!/^[a-fA-F0-9]+$/.test(sigHex) || sigHex.length !== expectedHex.length) {
          return false;
        }
        const providedBuf = Buffer.from(sigHex, 'hex');
        return providedBuf.length === expectedBuf.length && crypto.timingSafeEqual(providedBuf, expectedBuf);
      });
    } catch {
      return false;
    }
  }

  /**
   * Processes a verified webhook event with strict durable deduplication & financial ledgering.
   */
  public async processWebhookEvent(
    event: WebhookEventPayload,
    isSignatureVerified: boolean
  ): Promise<ProcessedWebhookResult> {
    const eventId = event?.id || `evt-unknown-${Date.now()}`;
    const eventType = event?.type || 'unknown';

    if (!isSignatureVerified) {
      await this.dbAdapter.insertDurableWithRetry(
        'audit_logs',
        {
          id: `audit-pay-sigfail-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
          timestamp: new Date().toISOString(),
          actor_role: 'payment_webhook_system',
          action: 'payment:webhook_signature_failed',
          details: `Rejected webhook event ${eventId} (${eventType}) due to invalid HMAC signature.`,
        },
        { context: 'paymentProviderService:signatureFailed' }
      );
      return {
        success: false,
        eventId,
        eventType,
        processedAt: new Date().toISOString(),
        reconciliationStatus: 'SIGNATURE_FAILED',
        details: 'Cryptographic HMAC signature verification failed. Event discarded.',
      };
    }

    // Persistent + in-memory event deduplication check
    if (this.processedEvents.has(eventId)) {
      return {
        success: true,
        eventId,
        eventType,
        processedAt: new Date().toISOString(),
        reconciliationStatus: 'DUPLICATE_IGNORED',
        details: `Event ${eventId} has already been processed idempotently. Skipping mutation.`,
      };
    }
    const existingEvents = await this.dbAdapter.select<any>(
      'processed_webhook_events',
      (r) => r.id === eventId
    );
    if (existingEvents.length > 0) {
      this.processedEvents.add(eventId);
      return {
        success: true,
        eventId,
        eventType,
        processedAt: new Date().toISOString(),
        reconciliationStatus: 'DUPLICATE_IGNORED',
        details: `Event ${eventId} has already been processed durably. Skipping mutation.`,
      };
    }

    this.processedEvents.add(eventId);
    const nowIso = new Date().toISOString();

    if (event.type === 'payment_intent.succeeded') {
      const obj = event.data.object;

      // Secondary payment_intent_id deduplication across event IDs
      const existingIntent = await this.dbAdapter.select<any>(
        'donations_verified',
        (r) => r.payment_intent_id === obj.id
      );
      if (existingIntent.length > 0) {
        await this.dbAdapter.insertDurableWithRetry(
          'processed_webhook_events',
          { id: eventId, event_type: event.type, payment_intent_id: obj.id, status: 'DUPLICATE_INTENT_IGNORED', processed_at: nowIso },
          { context: 'paymentProviderService:dupIntentEvent' }
        );
        return {
          success: true,
          eventId,
          eventType: event.type,
          processedAt: nowIso,
          donationId: existingIntent[0].id,
          receiptNumber: existingIntent[0].receipt_number,
          reconciliationStatus: 'DUPLICATE_IGNORED',
          details: `Payment intent ${obj.id} was already reconciled under ${existingIntent[0].id}.`,
        };
      }

      const donationId = `don-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
      const receiptNumber = `PHUM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const amountDollars = (obj.amount || 0) / 100;

      await this.dbAdapter.withTransaction(async () => {
        await this.dbAdapter.insertDurableWithRetry(
          'donations_verified',
          {
            id: donationId,
            payment_intent_id: obj.id,
            donor_name: obj.metadata?.donorName || 'Generous Community Supporter',
            donor_email: obj.receipt_email || obj.metadata?.donorEmail || obj.customer_email || 'anonymous@phumulani.org',
            amount: amountDollars,
            currency: obj.currency || 'usd',
            program_designation: obj.metadata?.programDesignation || 'GENERAL_UNRESTRICTED',
            campaign_id: obj.metadata?.campaignId || 'general',
            receipt_number: receiptNumber,
            verified_at: nowIso,
            is_synthetic: false,
            payment_status: 'succeeded',
          },
          { context: 'paymentProviderService:donationVerified', failClosedInProd: true }
        );

        await this.dbAdapter.insertDurableWithRetry(
          'processed_webhook_events',
          { id: eventId, event_type: event.type, payment_intent_id: obj.id, donation_id: donationId, processed_at: nowIso },
          { context: 'paymentProviderService:processedEvent', failClosedInProd: true }
        );

        await this.dbAdapter.insertDurableWithRetry(
          'audit_logs',
          {
            id: `audit-pay-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
            timestamp: nowIso,
            actor_role: 'payment_webhook_system',
            action: 'donation:reconcile_verified',
            details: `Reconciled payment ${obj.id} for $${amountDollars}. Issued receipt ${receiptNumber}.`,
            signature: crypto.createHash('sha256').update(donationId + receiptNumber + amountDollars).digest('hex'),
          },
          { context: 'paymentProviderService:auditSucceeded', failClosedInProd: true }
        );
      });

      return {
        success: true,
        eventId,
        eventType: event.type,
        processedAt: nowIso,
        donationId,
        receiptNumber,
        reconciliationStatus: 'RECONCILED',
        details: `Successfully reconciled payment ${obj.id}. Generated official 501(c)(3) tax receipt ${receiptNumber}.`,
      };
    }

    if (event.type === 'payment_intent.payment_failed') {
      const obj = event.data.object;
      const failureReason = obj.failure_message || 'Decline';
      if (obj.metadata?.idempotencyKey) {
        const sessions = await this.dbAdapter.select<any>('payment_sessions', (r) => r.idempotency_key === obj.metadata?.idempotencyKey);
        if (sessions[0]?.id) {
          await this.dbAdapter.update('payment_sessions', sessions[0].id, {
            status: 'PAYMENT_FAILED',
            failure_message: failureReason,
            updated_at: nowIso,
          });
        }
      }
      await this.dbAdapter.insertDurableWithRetry(
        'processed_webhook_events',
        { id: eventId, event_type: event.type, payment_intent_id: obj.id, status: 'EXCEPTION_FLAGGED', failure_message: failureReason, processed_at: nowIso },
        { context: 'paymentProviderService:failedEvent' }
      );
      await this.dbAdapter.insertDurableWithRetry(
        'audit_logs',
        {
          id: `audit-pay-fail-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
          timestamp: nowIso,
          actor_role: 'payment_webhook_system',
          action: 'payment:intent_failed',
          details: `Payment failure logged for intent ${obj.id}: ${failureReason}.`,
        },
        { context: 'paymentProviderService:auditFailed' }
      );
      return {
        success: true,
        eventId,
        eventType: event.type,
        processedAt: nowIso,
        reconciliationStatus: 'EXCEPTION_FLAGGED',
        details: `Payment failure logged for intent ${obj.id}: ${failureReason}.`,
      };
    }

    if (event.type === 'charge.refunded') {
      const obj = event.data.object;
      const matchingDonations = await this.dbAdapter.select<any>(
        'donations_verified',
        (r) => r.payment_intent_id === obj.id || r.payment_intent_id === (obj as any).payment_intent
      );
      for (const don of matchingDonations) {
        await this.dbAdapter.update('donations_verified', don.id, {
          payment_status: 'refunded',
          refunded_at: nowIso,
          receipt_revoked: true,
        });
      }
      await this.dbAdapter.insertDurableWithRetry(
        'processed_webhook_events',
        { id: eventId, event_type: event.type, charge_id: obj.id, status: 'RECONCILED_REFUND', processed_at: nowIso },
        { context: 'paymentProviderService:refundEvent' }
      );
      await this.dbAdapter.insertDurableWithRetry(
        'audit_logs',
        {
          id: `audit-pay-ref-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
          timestamp: nowIso,
          actor_role: 'payment_webhook_system',
          action: 'payment:charge_refunded',
          details: `Refund registered for charge ${obj.id}. Updated ${matchingDonations.length} verified donation record(s).`,
        },
        { context: 'paymentProviderService:auditRefund' }
      );
      return {
        success: true,
        eventId,
        eventType: event.type,
        processedAt: nowIso,
        reconciliationStatus: 'RECONCILED',
        details: `Refund registered for charge ${obj.id}. Financial provenance updated.`,
      };
    }

    if (event.type === 'charge.dispute.created') {
      const obj = event.data.object;
      await this.dbAdapter.insertDurableWithRetry(
        'processed_webhook_events',
        { id: eventId, event_type: event.type, charge_id: obj.id, status: 'EXCEPTION_FLAGGED', processed_at: nowIso },
        { context: 'paymentProviderService:disputeEvent' }
      );
      await this.dbAdapter.insertDurableWithRetry(
        'audit_logs',
        {
          id: `audit-pay-disp-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
          timestamp: nowIso,
          actor_role: 'payment_webhook_system',
          action: 'payment:dispute_created',
          details: `Dispute opened for charge ${obj.id}. Flagged for Finance Committee reconciliation.`,
        },
        { context: 'paymentProviderService:auditDispute' }
      );
      return {
        success: true,
        eventId,
        eventType: event.type,
        processedAt: nowIso,
        reconciliationStatus: 'EXCEPTION_FLAGGED',
        details: `Dispute logged for charge ${obj.id}. Flagged for financial review.`,
      };
    }

    await this.dbAdapter.insertDurableWithRetry(
      'processed_webhook_events',
      { id: eventId, event_type: event.type, processed_at: nowIso },
      { context: 'paymentProviderService:otherEvent' }
    );
    return {
      success: true,
      eventId,
      eventType: event.type,
      processedAt: nowIso,
      reconciliationStatus: 'RECONCILED',
      details: `Event ${event.type} acknowledged and archived.`,
    };
  }
}

export const paymentProviderService = PaymentProviderService.getInstance();
