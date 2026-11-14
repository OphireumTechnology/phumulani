/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 79 Master Production Repair Verification Suite
 *
 * Verifies every critical repair across Blocks 79.1 – 79.7:
 *  - 79.1: DATABASE_URL validation, TLS enforcement on remote PG, fail-closed PRODUCTION_ONLY policy, schema integrity
 *  - 79.2: OAuth invalid_grant / revoked token detection + vault purge, redirect URI validation
 *  - 79.3: Failed inbound sync preserves lastSyncAt / lastSuccessfulSyncAt / syncCursor without silent catch
 *  - 79.4: Cross-mailbox dispatch fallback elimination, sender mismatch rejection, crash-safe idempotency claim, timeout reconciliation
 *  - 79.5: Stripe sk_test_ vs sk_live_ gating + LIVE_PAYMENTS_ENABLED gate, deferred webhook idempotency, transactional partial/full refunds & disputes
 *  - 79.6: Multi-process worker concurrency (child_process spawn), zero double-claims, strict FIFO ordering, stale lease recovery & DLQ
 *  - 79.7: Safeguarding role parity (safeguarding_officer === safeguarding_lead) & strict VAWA boundary exclusion
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

interface CheckResult {
  id: string;
  block: string;
  name: string;
  passed: boolean;
  details: string;
}

const results: CheckResult[] = [];

function record(id: string, block: string, name: string, passed: boolean, details: string): void {
  results.push({ id, block, name, passed, details });
  console.log(`[${passed ? '✓ PASS' : '✗ FAIL'}] ${id} (${block}): ${name} — ${details}`);
}

async function run(): Promise<void> {
  const tmpRuntimeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phumulani-p79-verify-'));
  const prevRuntimeDir = process.env.PHUMULANI_RUNTIME_DATA_DIR;
  const prevOpMode = process.env.PHUMULANI_OPERATIONAL_MODE;
  const prevDbUrl = process.env.DATABASE_URL;
  const prevVaultKey = process.env.SAFEGUARDING_MASTER_KEY;
  const prevStripeKey = process.env.STRIPE_SECRET_KEY;
  const prevPaySecret = process.env.PAYMENT_SECRET_KEY;
  const prevWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const prevPayWebhook = process.env.PAYMENT_WEBHOOK_SECRET;
  const prevLivePayments = process.env.LIVE_PAYMENTS_ENABLED;
  const prevGoogleClientId = process.env.GOOGLE_WORKSPACE_CLIENT_ID;
  const prevGoogleClientSecret = process.env.GOOGLE_WORKSPACE_CLIENT_SECRET;

  process.env.PHUMULANI_RUNTIME_DATA_DIR = tmpRuntimeDir;
  process.env.SAFEGUARDING_MASTER_KEY = 'p79-test-master-vault-key-32bytes-ok';

  try {
    const { PostgresPersistenceAdapter } = await import('../src/services/postgresPersistenceAdapter');
    const { DatabaseMigrationService } = await import('../src/services/databaseMigrationService');
    const { oAuthService } = await import('../src/email/services/OAuthService');
    const { connectorRegistry } = await import('../src/services/connectors/connectorRegistry');
    const { emailSyncService } = await import('../src/email/services/EmailSyncService');
    const { emailDispatchService } = await import('../src/email/services/EmailDispatchService');
    const { PaymentProviderService } = await import('../src/services/paymentProviderService');
    const { BackgroundWorkerService } = await import('../src/services/backgroundWorkerService');
    const { AuthSecurityService } = await import('../src/services/authSecurityService');
    const { EmailGovernanceService } = await import('../src/email/services/EmailGovernanceService');

    const adapter = PostgresPersistenceAdapter.getInstance();
    await adapter.initialize();
    const migrations = DatabaseMigrationService.getInstance();
    await migrations.runMigrations();

    // =========================================================================
    // BLOCK 79.1 — POSTGRESQL VALIDATION, TLS & FAIL-CLOSED PRODUCTION POLICY
    // =========================================================================
    console.log('\n--- BLOCK 79.1: Production PostgreSQL & Readiness ---');

    const badProtocol = PostgresPersistenceAdapter.validateDatabaseUrl('mysql://user:pass@db.example.com:3306/app');
    const badMissingDb = PostgresPersistenceAdapter.validateDatabaseUrl('postgresql://user:pass@db.example.com:5432/');
    const badWhitespace = PostgresPersistenceAdapter.validateDatabaseUrl('postgresql://user:pass@db.example.com:5432/phumulani db');
    const validPgUrl = PostgresPersistenceAdapter.validateDatabaseUrl('postgresql://phumulani:secret@pg.example.com:5432/phumulani?sslmode=require');
    record(
      'P79-01',
      'Block 79.1',
      'validateDatabaseUrl rejects invalid protocols, missing DB names, and whitespace',
      !badProtocol.valid && !badMissingDb.valid && !badWhitespace.valid && validPgUrl.valid,
      `badProto=${badProtocol.valid}, missingDb=${badMissingDb.valid}, space=${badWhitespace.valid}, valid=${validPgUrl.valid}`
    );

    const { EnvironmentService } = await import('../src/services/environmentService');

    process.env.PHUMULANI_OPERATIONAL_MODE = 'PRODUCTION_ONLY';
    delete process.env.DATABASE_URL;
    const prodPolicy = EnvironmentService.getDatabasePolicy();

    let remoteNoTlsError = '';
    try {
      PostgresPersistenceAdapter.buildPostgresSslConfig(
        'postgresql://phumulani:pass@remote-pg.prod.internal:5432/phumulani?sslmode=disable'
      );
    } catch (e: any) {
      remoteNoTlsError = e?.message || '';
    }
    const remoteTlsConfig = PostgresPersistenceAdapter.buildPostgresSslConfig(
      'postgresql://phumulani:pass@remote-pg.prod.internal:5432/phumulani?sslmode=require'
    );

    // Restore staged operational mode before local adapter checks
    process.env.PHUMULANI_OPERATIONAL_MODE = prevOpMode || 'STAGED_DEVELOPMENT';

    record(
      'P79-02',
      'Block 79.1',
      'PRODUCTION_ONLY enforces live DB without fallback and rejects sslmode=disable on remote hosts',
      prodPolicy.requireLiveDatabase === true &&
        prodPolicy.allowEmbeddedFallback === false &&
        prodPolicy.policyCode === 'PRODUCTION_ONLY' &&
        remoteNoTlsError.includes('TLS_REQUIRED') &&
        remoteTlsConfig?.rejectUnauthorized === true,
      `policyCode=${prodPolicy.policyCode}, noTlsErr=${remoteNoTlsError.includes('TLS_REQUIRED')}, tlsRejectUnauth=${remoteTlsConfig?.rejectUnauthorized}`
    );

    const schemaIntegrity = await migrations.validateSchemaIntegrity();
    record(
      'P79-03',
      'Block 79.1',
      'DatabaseMigrationService validates required production schema tables cleanly',
      schemaIntegrity.valid === true && schemaIntegrity.missingTables.length === 0,
      `valid=${schemaIntegrity.valid}, verifiedTables=${schemaIntegrity.verifiedTables.length}, missing=${schemaIntegrity.missingTables.length}`
    );

    // Seed isolated test connections inside tmpRuntimeDir for Blocks 79.2–79.4 OAuth/dispatch verification
    connectorRegistry.seedCanonicalConnectionsForTesting();

    // =========================================================================
    // BLOCK 79.2 — OAUTH REVOKED GRANT DETECTION & VAULT PURGE
    // =========================================================================
    console.log('\n--- BLOCK 79.2: OAuth Revocation Detection & Refresh Security ---');

    const testRevokeEmail = 'donations@phumulani.org';
    const testRevokeConnId = 'conn-google-donations_phumulani_org';
    process.env.GOOGLE_WORKSPACE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
    process.env.GOOGLE_WORKSPACE_CLIENT_SECRET = 'test-client-secret-value';

    oAuthService.storeEncryptedTokens(testRevokeConnId, {
      accessToken: 'ya29.expired-access-token',
      refreshToken: '1//revoked-refresh-token-value',
      tokenType: 'Bearer',
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      expiresAt: Date.now() - 60_000,
      verifiedEmail: testRevokeEmail,
      provider: 'GOOGLE',
      updatedAt: new Date().toISOString(),
    });
    oAuthService.storeEncryptedTokens(testRevokeEmail, {
      accessToken: 'ya29.expired-access-token',
      refreshToken: '1//revoked-refresh-token-value',
      tokenType: 'Bearer',
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      expiresAt: Date.now() - 60_000,
      verifiedEmail: testRevokeEmail,
      provider: 'GOOGLE',
      updatedAt: new Date().toISOString(),
    });

    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = (async () =>
        new Response(
          JSON.stringify({ error: 'invalid_grant', error_description: 'Token has been expired or revoked.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )) as any;

      const refreshOutcome = await oAuthService.refreshAccessToken(testRevokeConnId);
      const tokenStillInVault = oAuthService.hasStoredTokens(testRevokeConnId);

      // Re-seed once for ConnectorRegistry.refreshToken test so it exercises full REVOKED transition
      oAuthService.storeEncryptedTokens(testRevokeConnId, {
        accessToken: 'ya29.expired-access-token',
        refreshToken: '1//revoked-refresh-token-value',
        tokenType: 'Bearer',
        expiresAt: Date.now() - 60_000,
        verifiedEmail: testRevokeEmail,
        provider: 'GOOGLE',
        updatedAt: new Date().toISOString(),
      });
      const regRefreshOk = await connectorRegistry.refreshToken(testRevokeConnId);
      const postRefreshConn = connectorRegistry.getConnection(testRevokeConnId);

      record(
        'P79-04',
        'Block 79.2',
        'invalid_grant refresh purges vaulted tokens and transitions mailbox to REVOKED',
        refreshOutcome.success === false &&
          refreshOutcome.revoked === true &&
          refreshOutcome.errorCode === 'OAUTH_GRANT_REVOKED' &&
          !tokenStillInVault &&
          regRefreshOk === false &&
          postRefreshConn?.authStatus === 'REVOKED' &&
          !oAuthService.hasStoredTokens(testRevokeConnId),
        `errorCode=${refreshOutcome.errorCode}, vaultCleared=${!tokenStillInVault}, connStatus=${postRefreshConn?.authStatus}`
      );
    } finally {
      globalThis.fetch = originalFetch;
    }

    // =========================================================================
    // BLOCK 79.3 — INBOUND SYNC TRUTHFULNESS & TWO-WAY ERROR PROPAGATION
    // =========================================================================
    console.log('\n--- BLOCK 79.3: Inbound Sync Truthfulness & Error Propagation ---');

    const grantsConn = connectorRegistry.getConnection('conn-google-grants_phumulani_org');
    const priorSyncAt = grantsConn?.lastSyncAt ?? null;
    const priorSuccessAt = grantsConn?.lastSuccessfulSyncAt ?? null;
    const failedSync = await connectorRegistry.syncConnection('conn-google-grants_phumulani_org');
    const postFailedConn = connectorRegistry.getConnection('conn-google-grants_phumulani_org');

    record(
      'P79-05',
      'Block 79.3',
      'Failed inbound sync leaves lastSyncAt and lastSuccessfulSyncAt untouched',
      failedSync.success === false &&
        postFailedConn?.lastSyncAt === priorSyncAt &&
        postFailedConn?.lastSuccessfulSyncAt === priorSuccessAt,
      `syncSuccess=${failedSync.success}, lastSyncAt=${String(postFailedConn?.lastSyncAt)}, lastSuccessfulSyncAt=${String(postFailedConn?.lastSuccessfulSyncAt)}`
    );

    // Ensure non-connected sync error on two-way markMessageReadUnread propagates cleanly or rejects missing thread cleanly
    let markReadError = '';
    try {
      await emailSyncService.markMessageReadUnread('missing-thread-id', true, 'staff-p79');
    } catch (e: any) {
      markReadError = e?.message || '';
    }
    record(
      'P79-06',
      'Block 79.3',
      'Two-way markMessageReadUnread fails loudly on missing thread instead of silent success',
      markReadError.includes('not found'),
      `error="${markReadError}"`
    );

    // =========================================================================
    // BLOCK 79.4 — OUTBOUND DISPATCH SAFETY, NO FALLBACK & IDEMPOTENCY
    // =========================================================================
    console.log('\n--- BLOCK 79.4: Outbound Dispatch Safety & Idempotency ---');

    // Reset donations connection to CONNECTED in staged mode for dispatch tests (live sending disabled)
    connectorRegistry.updateConnection(testRevokeConnId, {
      authStatus: 'CONNECTED',
      connectionHealth: 'HEALTHY',
    });

    // 4a. Nonexistent mailboxId must throw MAILBOX_CONNECTION_NOT_FOUND (no fallback to connections[0])
    const orphanDraft = await emailDispatchService.createDraft({
      mailboxId: 'conn-does-not-exist-999',
      to: ['donor@example.org'],
      subject: 'Orphan Mailbox Safety Check',
      bodyText: 'Must never fall back to another mailbox.',
      authorId: 'staff-01',
      authorRole: 'staff',
    });
    await emailDispatchService.submitDraftForApproval(orphanDraft.id, 'staff-01');
    await emailDispatchService.approveDraft(orphanDraft.id, 'exec-01', 'executive_director');

    let missingMailboxRejected = false;
    try {
      await emailDispatchService.sendApprovedEmail(orphanDraft.id, 'exec-01');
    } catch (err: any) {
      missingMailboxRejected = String(err?.message || '').includes('MAILBOX_CONNECTION_NOT_FOUND');
    }

    // 4b. Cross-mailbox sender mismatch rejection
    let senderMismatchRejected = false;
    try {
      await emailDispatchService.dispatchApprovedMessage({
        id: 'msg-mismatch-79',
        connectionId: testRevokeConnId,
        senderAccount: 'grants@phumulani.org', // mismatch vs donations@phumulani.org
        to: ['donor@example.org'],
        subject: 'Sender Spoof Attempt',
        bodyText: 'Blocked senderAccount mismatch.',
        idempotencyKey: `idem-mismatch-${Date.now()}`,
        approvalRecordId: 'appr-p79-mismatch',
        approvedByUserId: 'exec-01',
        approvedByName: 'Comfort Dondo',
        approvedAt: new Date().toISOString(),
        approvalVersion: 1,
        deliveryState: 'APPROVED',
      });
    } catch (err: any) {
      senderMismatchRejected = String(err?.message || '').includes('CROSS_MAILBOX_DISPATCH_REJECTED');
    }

    // 4c. Durable idempotency + crash recovery (clear in-memory cache via direct adapter check)
    const idemKey = `idem-p79-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const firstSend = await emailDispatchService.dispatchApprovedMessage({
      id: `msg-ok-1-${Date.now()}`,
      connectionId: testRevokeConnId,
      senderAccount: 'donations@phumulani.org',
      to: ['supporter@example.org'],
      subject: 'Stewardship Receipt',
      bodyText: 'Thank you for supporting Phumulani.',
      idempotencyKey: idemKey,
      approvalRecordId: 'appr-p79-ok-1',
      approvedByUserId: 'exec-01',
      approvedByName: 'Comfort Dondo',
      approvedAt: new Date().toISOString(),
      approvalVersion: 1,
      deliveryState: 'APPROVED',
    });
    // Force cache eviction so second send must consult durable SQLite/PG email_idempotency_keys table
    (emailDispatchService as any).idempotencyStore.clear();
    const duplicateSend = await emailDispatchService.dispatchApprovedMessage({
      id: `msg-ok-2-${Date.now()}`,
      connectionId: testRevokeConnId,
      senderAccount: 'donations@phumulani.org',
      to: ['supporter@example.org'],
      subject: 'Stewardship Receipt',
      bodyText: 'Thank you for supporting Phumulani.',
      idempotencyKey: idemKey,
      approvalRecordId: 'appr-p79-ok-1',
      approvedByUserId: 'exec-01',
      approvedByName: 'Comfort Dondo',
      approvedAt: new Date().toISOString(),
      approvalVersion: 1,
      deliveryState: 'APPROVED',
    });

    // 4d. Pre-set RECONCILIATION_REQUIRED key blocks blind re-transmission
    const reconKey = `idem-recon-${Date.now()}`;
    await adapter.insertIfAbsent(
      'email_idempotency_keys',
      {
        id: reconKey,
        idempotencyKey: reconKey,
        dispatchId: 'disp-ambiguous-timeout',
        senderAccount: 'donations@phumulani.org',
        recipientEmails: ['supporter@example.org'],
        subjectHash: 'abc',
        deliveryState: 'RECONCILIATION_REQUIRED',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600_000).toISOString(),
      },
      ['idempotencyKey']
    );
    const reconRetry = await emailDispatchService.dispatchApprovedMessage({
      id: `msg-recon-${Date.now()}`,
      connectionId: testRevokeConnId,
      senderAccount: 'donations@phumulani.org',
      to: ['supporter@example.org'],
      subject: 'Retry after timeout',
      bodyText: 'Should block blindly.',
      idempotencyKey: reconKey,
      approvalRecordId: 'appr-p79-recon',
      approvedByUserId: 'exec-01',
      approvedByName: 'Comfort Dondo',
      approvedAt: new Date().toISOString(),
      approvalVersion: 1,
      deliveryState: 'APPROVED',
    });

    record(
      'P79-07',
      'Block 79.4',
      'Dispatch enforces target mailbox lookup, rejects sender mismatch, preserves durable idempotency & blocks RECONCILIATION_REQUIRED retries',
      missingMailboxRejected &&
        senderMismatchRejected &&
        firstSend.success &&
        duplicateSend.success &&
        duplicateSend.dispatchId === firstSend.dispatchId &&
        reconRetry.success === false &&
        reconRetry.deliveryState === 'RECONCILIATION_REQUIRED',
      `missingRejected=${missingMailboxRejected}, mismatchRejected=${senderMismatchRejected}, idemMatch=${duplicateSend.dispatchId === firstSend.dispatchId}, reconBlocked=${reconRetry.deliveryState}`
    );

    // =========================================================================
    // BLOCK 79.5 — STRIPE LIVE GATE & TRANSACTIONAL WEBHOOKS
    // =========================================================================
    console.log('\n--- BLOCK 79.5: Stripe Live Gate & Transactional Webhooks ---');

    const payments = PaymentProviderService.getInstance();

    process.env.STRIPE_SECRET_KEY = 'sk_test_phumulani_sample_key';
    delete process.env.PAYMENT_SECRET_KEY;
    delete process.env.LIVE_PAYMENTS_ENABLED;
    const testKeyCfg = payments.getGatewayConfig();

    process.env.STRIPE_SECRET_KEY = 'sk_live_phumulani_sample_key';
    process.env.LIVE_PAYMENTS_ENABLED = 'false';
    const liveBlockedCfg = payments.getGatewayConfig();
    const blockedCheckout = await payments.createCheckoutSession({
      amountDollars: 50,
      donorName: 'Test Blocked Donor',
      donorEmail: 'donor@example.org',
      programDesignation: 'general_fund',
      isRecurring: false,
      idempotencyKey: `pay-gate-${Date.now()}`,
    });

    process.env.LIVE_PAYMENTS_ENABLED = 'true';
    const liveEnabledCfg = payments.getGatewayConfig();

    record(
      'P79-08',
      'Block 79.5',
      'Stripe separates sk_test_ from sk_live_ and enforces LIVE_PAYMENTS_ENABLED=true',
      testKeyCfg.environmentMode === 'TEST' &&
        testKeyCfg.liveCheckoutEnabled === true &&
        liveBlockedCfg.environmentMode === 'LIVE' &&
        liveBlockedCfg.status === 'BLOCKED_BY_CREDENTIALS' &&
        liveBlockedCfg.liveCheckoutEnabled === false &&
        blockedCheckout.status === 'BLOCKED_GATEWAY_NOT_CONNECTED' &&
        (blockedCheckout.error || '').includes('BLOCKED_LIVE_APPROVAL_REQUIRED') &&
        liveEnabledCfg.liveCheckoutEnabled === true,
      `test=${testKeyCfg.environmentMode}/${testKeyCfg.liveCheckoutEnabled}, liveUnapproved=${liveBlockedCfg.status}, liveApproved=${liveEnabledCfg.liveCheckoutEnabled}`
    );

    const whSecret = 'whsec_test_p79_signing_secret';
    process.env.STRIPE_WEBHOOK_SECRET = whSecret;
    process.env.PAYMENT_WEBHOOK_SECRET = whSecret;

    const signPayload = (payloadStr: string): string => {
      const ts = Math.floor(Date.now() / 1000);
      const sig = crypto.createHmac('sha256', whSecret).update(`${ts}.${payloadStr}`).digest('hex');
      return `t=${ts},v1=${sig}`;
    };

    const piId = `pi_p79_${Date.now()}`;
    const evtSuccessObj = {
      id: `evt_succ_${Date.now()}`,
      type: 'payment_intent.succeeded' as const,
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: piId,
          amount: 10000, // $100.00
          currency: 'usd',
          status: 'succeeded',
          metadata: { donorEmail: 'generous@example.org', donorName: 'Amina Supporter' },
        },
      },
    };
    const evtSuccessRaw = JSON.stringify(evtSuccessObj);
    const sigInvalidOk = payments.verifyWebhookSignature(evtSuccessRaw, 't=123,v1=deadbeef');
    const rBadSig = await payments.processWebhookEvent(evtSuccessObj, sigInvalidOk);
    const rSucc = await payments.processWebhookEvent(
      evtSuccessObj,
      payments.verifyWebhookSignature(evtSuccessRaw, signPayload(evtSuccessRaw))
    );
    const rDup = await payments.processWebhookEvent(
      evtSuccessObj,
      payments.verifyWebhookSignature(evtSuccessRaw, signPayload(evtSuccessRaw))
    );

    const evtPartialRefundObj = {
      id: `evt_partref_${Date.now()}`,
      type: 'charge.refunded' as const,
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: `ch_p79_${Date.now()}`,
          payment_intent: piId,
          amount: 10000,
          currency: 'usd',
          status: 'refunded',
          amount_refunded: 2500, // partial $25 refund
        },
      },
    };
    const evtPartialRefundRaw = JSON.stringify(evtPartialRefundObj);
    const rPartRef = await payments.processWebhookEvent(
      evtPartialRefundObj,
      payments.verifyWebhookSignature(evtPartialRefundRaw, signPayload(evtPartialRefundRaw))
    );

    const evtDisputeObj = {
      id: `evt_disp_${Date.now()}`,
      type: 'charge.dispute.created' as const,
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: `dp_p79_${Date.now()}`,
          payment_intent: piId,
          amount: 10000,
          currency: 'usd',
          status: 'disputed',
        },
      },
    };
    const evtDisputeRaw = JSON.stringify(evtDisputeObj);
    const rDisp = await payments.processWebhookEvent(
      evtDisputeObj,
      payments.verifyWebhookSignature(evtDisputeRaw, signPayload(evtDisputeRaw))
    );
    const donatedRows = await adapter.select<any>('donations_verified', (d) => d.payment_intent_id === piId);

    record(
      'P79-09',
      'Block 79.5',
      'Webhooks verify HMAC, deduplicate replays, support partial refunds and revoke receipt on disputes atomically',
      rBadSig.reconciliationStatus === 'SIGNATURE_FAILED' &&
        rSucc.reconciliationStatus === 'RECONCILED' &&
        rDup.reconciliationStatus === 'DUPLICATE_IGNORED' &&
        rPartRef.reconciliationStatus === 'RECONCILED' &&
        rDisp.reconciliationStatus === 'EXCEPTION_FLAGGED' &&
        donatedRows.length === 1 &&
        donatedRows[0].payment_status === 'disputed' &&
        donatedRows[0].amount_refunded === 25 &&
        donatedRows[0].receipt_revoked === true,
      `badSig=${rBadSig.reconciliationStatus}, succ=${rSucc.reconciliationStatus}, dup=${rDup.reconciliationStatus}, disp=${rDisp.reconciliationStatus}, finalStatus=${donatedRows[0]?.payment_status}, refunded=${donatedRows[0]?.amount_refunded}, revoked=${donatedRows[0]?.receipt_revoked}`
    );

    // =========================================================================
    // BLOCK 79.6 — MULTI-PROCESS WORKER CONCURRENCY, FIFO & LEASE RECOVERY
    // =========================================================================
    console.log('\n--- BLOCK 79.6: Multi-Process Worker Concurrency, FIFO & Recovery ---');

    const worker = BackgroundWorkerService.getInstance();
    const jobIdsEnqueued: string[] = [];
    for (let i = 0; i < 6; i++) {
      const baseTs = new Date(Date.now() - (10 - i) * 1000).toISOString();
      const j = await worker.enqueueJob(
        'GRANT_DEADLINE_MONITOR',
        { seq: i },
        { idempotencyKey: `p79-fifo-${i}-${Date.now()}` }
      );
      // Enforce deterministic sequential createdAt ordering for FIFO verification
      j.createdAt = baseTs;
      await adapter.insert('background_jobs', j);
      jobIdsEnqueued.push(j.id);
    }

    // Verify single-process strict FIFO claim on first 2 jobs, then release them back to PENDING for multi-process test
    const firstFifo = await worker.acquireNextJob();
    const secondFifo = await worker.acquireNextJob();
    const fifoOrderValid =
      firstFifo?.id === jobIdsEnqueued[0] &&
      secondFifo?.id === jobIdsEnqueued[1];

    if (firstFifo) {
      await adapter.insert('background_jobs', { ...firstFifo, status: 'PENDING', leaseOwner: undefined, leaseExpiresAt: undefined });
    }
    if (secondFifo) {
      await adapter.insert('background_jobs', { ...secondFifo, status: 'PENDING', leaseOwner: undefined, leaseExpiresAt: undefined });
    }

    // Spawn 3 concurrent child processes racing to acquire all 6 pending jobs
    const childScript = `
      const { PostgresPersistenceAdapter } = require('./src/services/postgresPersistenceAdapter.ts');
      const { BackgroundWorkerService } = require('./src/services/backgroundWorkerService.ts');
      (async () => {
        const adapter = PostgresPersistenceAdapter.getInstance();
        await adapter.initialize();
        const worker = BackgroundWorkerService.getInstance();
        const claimed = [];
        for (let i = 0; i < 8; i++) {
          const job = await worker.acquireNextJob();
          if (!job) break;
          claimed.push(job.id);
        }
        console.log(JSON.stringify({ claimed }));
      })().catch((e) => { console.error(e); process.exit(1); });
    `;
    const childProcs = [0, 1, 2].map(() =>
      execFileAsync('npx', ['tsx', '-e', childScript], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PHUMULANI_RUNTIME_DATA_DIR: tmpRuntimeDir,
          SAFEGUARDING_MASTER_KEY: process.env.SAFEGUARDING_MASTER_KEY,
        },
        timeout: 30000,
      })
    );
    const childOutputs = await Promise.all(childProcs);
    const allClaimed: string[] = [];
    for (const out of childOutputs) {
      const lastLine = out.stdout.trim().split('\n').pop() || '{}';
      const parsed = JSON.parse(lastLine);
      if (Array.isArray(parsed.claimed)) {
        allClaimed.push(...parsed.claimed);
      }
    }
    const uniqueClaimed = new Set(allClaimed);

    record(
      'P79-10',
      'Block 79.6',
      '3 concurrent worker processes claim 6 FIFO jobs with zero double-claims and zero dropped jobs',
      fifoOrderValid &&
        allClaimed.length === 6 &&
        uniqueClaimed.size === 6 &&
        jobIdsEnqueued.every((id) => uniqueClaimed.has(id)),
      `fifoValid=${fifoOrderValid} (expected=[${jobIdsEnqueued[0]},${jobIdsEnqueued[1]}], got=[${firstFifo?.id},${secondFifo?.id}]), totalClaims=${allClaimed.length}, uniqueClaims=${uniqueClaimed.size}, childRaw=${JSON.stringify(childOutputs.map((o) => o.stdout.trim()))}`
    );

    // Verify stale lease recovery + DLQ
    const staleJob = await worker.enqueueJob(
      'GRANT_DEADLINE_MONITOR',
      { test: 'stale' },
      { idempotencyKey: `p79-stale-${Date.now()}`, maxRetries: 1 }
    );
    await adapter.insert('background_jobs', {
      ...staleJob,
      status: 'IN_PROGRESS',
      leaseOwner: 'dead-worker-999',
      leaseExpiresAt: new Date(Date.now() - 60_000).toISOString(),
    });
    const recoveredCount = await worker.recoverStaleLeases();
    const afterRecover = await adapter.select<any>('background_jobs', (r) => r.id === staleJob.id);

    // Exhaust retries into DEAD_LETTER
    worker.registerHandler('GRANT_DEADLINE_MONITOR', async () => {
      throw new Error('SIMULATED_PERMANENT_FAILURE');
    });
    // Process via runWorkerCycle after clearing backoff
    await adapter.insert('background_jobs', {
      ...afterRecover[0],
      status: 'RETRYING',
      retryCount: 1,
      maxRetries: 1,
      nextAttemptAfter: new Date(Date.now() - 1000).toISOString(),
    });
    await worker.runWorkerCycle(10);
    await worker.waitForIdle();
    const finalStaleRow = await adapter.select<any>('background_jobs', (r) => r.id === staleJob.id);

    record(
      'P79-11',
      'Block 79.6',
      'Worker recovers expired leases cleanly and transitions retry-exhausted jobs to DEAD_LETTER',
      recoveredCount >= 1 &&
        afterRecover[0]?.status === 'RETRYING' &&
        finalStaleRow[0]?.status === 'DEAD_LETTER',
      `recovered=${recoveredCount}, postRecoverStatus=${afterRecover[0]?.status}, finalStatus=${finalStaleRow[0]?.status}`
    );

    // =========================================================================
    // BLOCK 79.7 — SAFEGUARDING ROLE PARITY & RBAC BOUNDARY
    // =========================================================================
    console.log('\n--- BLOCK 79.7: Safeguarding Role Parity & VAWA Isolation ---');

    const authSec = AuthSecurityService.getInstance();
    const govService = EmailGovernanceService.getInstance();
    await govService.initialize();

    const officerDomainOk = authSec.authorizeDomain('safeguarding_officer' as any, 'restricted_safeguarding');
    const leadDomainOk = authSec.authorizeDomain('safeguarding_lead' as any, 'restricted_safeguarding');
    const staffDomainDenied = !authSec.authorizeDomain('staff' as any, 'restricted_safeguarding');
    const devDomainDenied = !authSec.authorizeDomain('development_director' as any, 'restricted_safeguarding');
    const masterAdminDomainDenied = !authSec.authorizeDomain('master_admin' as any, 'restricted_safeguarding');

    const officerAclOk = (await govService.checkMailboxAccess({ mailboxEmail: 'safeguarding@phumulani.org', userRole: 'safeguarding_officer', userEmail: 'officer@phumulani.org' })).allowed;
    const leadAclOk = (await govService.checkMailboxAccess({ mailboxEmail: 'safeguarding@phumulani.org', userRole: 'safeguarding_lead', userEmail: 'lead@phumulani.org' })).allowed;
    const devDirAclDenied = !(await govService.checkMailboxAccess({ mailboxEmail: 'safeguarding@phumulani.org', userRole: 'development_director', userEmail: 'dev@phumulani.org' })).allowed;

    const sgDraft = await emailDispatchService.createDraft({
      mailboxId: testRevokeConnId,
      to: ['victim-advocate@example.org'],
      subject: 'VAWA Protected Safety Plan',
      bodyText: 'Confidential safety transport details.',
      authorId: 'caseworker-01',
      authorRole: 'staff',
      isSafeguarded: true,
    });
    await emailDispatchService.submitDraftForApproval(sgDraft.id, 'caseworker-01');
    const officerApproved = await emailDispatchService.approveDraft(sgDraft.id, 'sg-officer-1', 'safeguarding_officer');

    const sgDraft2 = await emailDispatchService.createDraft({
      mailboxId: testRevokeConnId,
      to: ['victim-advocate@example.org'],
      subject: 'VAWA Protected Safety Plan 2',
      bodyText: 'Confidential shelter coordination.',
      authorId: 'caseworker-02',
      authorRole: 'staff',
      isSafeguarded: true,
    });
    await emailDispatchService.submitDraftForApproval(sgDraft2.id, 'caseworker-02');
    let devDeniedSgApprove = false;
    try {
      await emailDispatchService.approveDraft(sgDraft2.id, 'dev-dir-1', 'development_director');
    } catch (e: any) {
      devDeniedSgApprove = String(e?.message || '').includes('SAFEGUARDING_AIR_GAP_VIOLATION');
    }

    record(
      'P79-12',
      'Block 79.7',
      'safeguarding_officer and safeguarding_lead hold identical VAWA safeguarding permissions while non-safeguarding roles remain denied',
      officerDomainOk &&
        leadDomainOk &&
        staffDomainDenied &&
        devDomainDenied &&
        masterAdminDomainDenied &&
        officerAclOk &&
        leadAclOk &&
        devDirAclDenied &&
        officerApproved.status === 'APPROVED' &&
        devDeniedSgApprove,
      `domainParity=${officerDomainOk && leadDomainOk}, aclParity=${officerAclOk && leadAclOk}, nonSgDenied=${staffDomainDenied && devDomainDenied && masterAdminDomainDenied && devDirAclDenied && devDeniedSgApprove}`
    );

    // =========================================================================
    // LIVE SERVER PROBE (when running server reachable at LIVE_SERVER_URL / :3000)
    // =========================================================================
    const serverUrl = process.env.LIVE_SERVER_URL || 'http://127.0.0.1:3000';
    let serverReachable = false;
    try {
      const hz = await fetch(`${serverUrl}/healthz`, { signal: AbortSignal.timeout(2000) });
      if (hz.ok) {
        serverReachable = true;
        const hzJson: any = await hz.json();
        const rz = await fetch(`${serverUrl}/readyz`, { signal: AbortSignal.timeout(2000) });
        const rzJson: any = await rz.json();
        record(
          'P79-13',
          'Live HTTP Probes',
          '/healthz reports alive and /readyz reports schema & security subsystem readiness',
          hz.status === 200 &&
            (hzJson.status === 'ok' || hzJson.status === 'alive') &&
            rz.status === 200 &&
            rzJson.status === 'ready' &&
            typeof rzJson.schemaValid === 'boolean' &&
            typeof rzJson.vaultReady === 'boolean',
          `/healthz=${hz.status} (${hzJson.status}), /readyz=${rz.status} (${rzJson.status}, schemaValid=${rzJson.schemaValid}, vaultReady=${rzJson.vaultReady})`
        );
      }
    } catch {
      // Server not running in offline CI Stage 4 context — skipped gracefully
    }
    if (!serverReachable) {
      console.log(`[SKIP] P79-13 (Live HTTP Probes): ${serverUrl} not running in standalone script context.`);
    }
  } finally {
    // Restore env vars and clean temp dir
    if (prevRuntimeDir !== undefined) process.env.PHUMULANI_RUNTIME_DATA_DIR = prevRuntimeDir;
    else delete process.env.PHUMULANI_RUNTIME_DATA_DIR;
    if (prevOpMode !== undefined) process.env.PHUMULANI_OPERATIONAL_MODE = prevOpMode;
    else delete process.env.PHUMULANI_OPERATIONAL_MODE;
    if (prevDbUrl !== undefined) process.env.DATABASE_URL = prevDbUrl;
    else delete process.env.DATABASE_URL;
    if (prevVaultKey !== undefined) process.env.SAFEGUARDING_MASTER_KEY = prevVaultKey;
    else delete process.env.SAFEGUARDING_MASTER_KEY;
    if (prevStripeKey !== undefined) process.env.STRIPE_SECRET_KEY = prevStripeKey;
    else delete process.env.STRIPE_SECRET_KEY;
    if (prevPaySecret !== undefined) process.env.PAYMENT_SECRET_KEY = prevPaySecret;
    else delete process.env.PAYMENT_SECRET_KEY;
    if (prevWebhookSecret !== undefined) process.env.STRIPE_WEBHOOK_SECRET = prevWebhookSecret;
    else delete process.env.STRIPE_WEBHOOK_SECRET;
    if (prevPayWebhook !== undefined) process.env.PAYMENT_WEBHOOK_SECRET = prevPayWebhook;
    else delete process.env.PAYMENT_WEBHOOK_SECRET;
    if (prevLivePayments !== undefined) process.env.LIVE_PAYMENTS_ENABLED = prevLivePayments;
    else delete process.env.LIVE_PAYMENTS_ENABLED;
    if (prevGoogleClientId !== undefined) process.env.GOOGLE_WORKSPACE_CLIENT_ID = prevGoogleClientId;
    else delete process.env.GOOGLE_WORKSPACE_CLIENT_ID;
    if (prevGoogleClientSecret !== undefined) process.env.GOOGLE_WORKSPACE_CLIENT_SECRET = prevGoogleClientSecret;
    else delete process.env.GOOGLE_WORKSPACE_CLIENT_SECRET;

    fs.rmSync(tmpRuntimeDir, { recursive: true, force: true });
  }

  console.log('\n======================================================================');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`PHASE 79 VERIFICATION SUMMARY: ${passed}/${results.length} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');
  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal error in Phase 79 verification suite:', err);
  process.exit(1);
});
