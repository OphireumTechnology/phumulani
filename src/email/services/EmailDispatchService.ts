/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Human-Approved Email Dispatch Service (Phase 62)
 * Grounded in Section 12, 13, 14 of Phase 62 Directive:
 * Enforces Quad-Action approval, anti-AI self-approval, safeguarding air-gap, and 24-hr idempotency.
 */

import crypto from 'crypto';
import { connectorRegistry } from '../connectors/ConnectorRegistry';
import { ApprovedOutboundMessage, SendResult, EmailIdempotencyRecord } from '../types';
import { PostgresPersistenceAdapter } from '../../services/postgresPersistenceAdapter';

export class EmailDispatchService {
  private static instance: EmailDispatchService;
  private idempotencyStore: Map<string, EmailIdempotencyRecord> = new Map();
  private emergencyShutdown: boolean = false;
  private dbAdapter: PostgresPersistenceAdapter;

  private constructor() {
    this.dbAdapter = PostgresPersistenceAdapter.getInstance();
  }

  public static getInstance(): EmailDispatchService {
    if (!EmailDispatchService.instance) {
      EmailDispatchService.instance = new EmailDispatchService();
    }
    return EmailDispatchService.instance;
  }

  private async getActiveIdempotencyRecord(key: string): Promise<EmailIdempotencyRecord | null> {
    const now = Date.now();
    const inMemory = this.idempotencyStore.get(key);
    if (inMemory) {
      if (new Date(inMemory.expiresAt).getTime() > now) {
        return inMemory;
      }
      this.idempotencyStore.delete(key);
    }
    try {
      const persisted = await this.dbAdapter.select<EmailIdempotencyRecord & { id: string }>(
        'email_idempotency_keys',
        (r) => r.id === key || r.idempotencyKey === key
      );
      const match = persisted[0];
      if (match && new Date(match.expiresAt).getTime() > now) {
        this.idempotencyStore.set(key, match);
        return match;
      }
    } catch {
      // Non-fatal read error falls through cleanly
    }
    return null;
  }

  private async saveIdempotencyRecord(record: EmailIdempotencyRecord): Promise<void> {
    this.idempotencyStore.set(record.idempotencyKey, record);
    await this.dbAdapter.insertDurableWithRetry(
      'email_idempotency_keys',
      { id: record.idempotencyKey, ...record },
      { context: 'EmailDispatchService:idempotency' }
    );
  }

  private drafts: Map<string, any> = new Map();

  /**
   * Set or test the emergency kill switch
   */
  public setEmergencyShutdown(active: boolean): void {
    this.emergencyShutdown = active;
  }

  public isEmergencyShutdownActive(): boolean {
    return this.emergencyShutdown;
  }

  public async activateEmergencyKillSwitch(_actor: string, _reason?: string): Promise<void> {
    this.emergencyShutdown = true;
  }

  public async deactivateEmergencyKillSwitch(_actor: string): Promise<void> {
    this.emergencyShutdown = false;
  }

  public isKillSwitchActive(): boolean {
    return this.emergencyShutdown;
  }

  public isStagedMode(): boolean {
    return (process.env.PHUMULANI_OPERATIONAL_MODE || 'STAGED_DEVELOPMENT') === 'STAGED_DEVELOPMENT';
  }

  public async createDraft(params: {
    mailboxId: string;
    to: string[];
    cc?: string[];
    subject: string;
    bodyHtml?: string;
    bodyText?: string;
    authorId: string;
    authorRole: string;
    isAiGenerated?: boolean;
    isSafeguarded?: boolean;
    safeguardingCategory?: string;
  }): Promise<any> {
    const id = `draft-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const draft = {
      id,
      mailboxId: params.mailboxId,
      to: params.to,
      cc: params.cc || [],
      subject: params.subject,
      bodyHtml: params.bodyHtml || params.bodyText || '',
      bodyText: params.bodyText || '',
      authorId: params.authorId,
      authorRole: params.authorRole,
      isAiGenerated: !!params.isAiGenerated,
      isSafeguarded: !!params.isSafeguarded,
      safeguardingCategory: params.safeguardingCategory,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.drafts.set(id, draft);
    return draft;
  }

  public async submitDraftForApproval(draftId: string, _authorId: string): Promise<any> {
    const draft = this.drafts.get(draftId);
    if (!draft) throw new Error(`Draft ${draftId} not found`);
    draft.status = 'SUBMITTED';
    draft.updatedAt = new Date().toISOString();
    return draft;
  }

  public async approveDraft(draftId: string, reviewerId: string, reviewerRole: string, notes?: string): Promise<any> {
    const draft = this.drafts.get(draftId);
    if (!draft) throw new Error(`Draft ${draftId} not found`);

    // Anti-AI Self-Approval Guard
    if (
      reviewerId.startsWith('ai-') ||
      reviewerId.startsWith('gemini') ||
      reviewerRole === 'ai_copilot' ||
      reviewerRole === 'ai_agent'
    ) {
      throw new Error('POLICY_VIOLATION: AI agents cannot approve outgoing email dispatches. Human executive approval required.');
    }

    // Safeguarding Air-Gap Guard
    if (draft.isSafeguarded && reviewerRole !== 'safeguarding_lead' && reviewerRole !== 'executive_director') {
      throw new Error('SAFEGUARDING_AIR_GAP_VIOLATION: Confidential survivor communication requires safeguarding lead authorization.');
    }

    draft.status = 'APPROVED';
    draft.approvedBy = reviewerId;
    draft.approvedRole = reviewerRole;
    draft.approvalNotes = notes;
    draft.approvedAt = new Date().toISOString();
    draft.updatedAt = new Date().toISOString();
    return draft;
  }

  public async sendApprovedEmail(draftId: string, senderId: string): Promise<any> {
    if (this.emergencyShutdown) {
      return {
        success: false,
        deliveryStatus: 'CANCELLED',
        dispatchId: '',
        error: 'EMERGENCY_SHUTDOWN: Outbound email dispatch is suspended by institutional administrator kill switch.',
      };
    }

    const draft = this.drafts.get(draftId);
    if (!draft) throw new Error(`Draft ${draftId} not found`);
    if (draft.status !== 'APPROVED') {
      throw new Error(`Cannot send draft in status ${draft.status}; must be APPROVED.`);
    }

    if (
      !senderId ||
      senderId.startsWith('ai-') ||
      senderId.startsWith('agent-') ||
      senderId.startsWith('gemini')
    ) {
      throw new Error('POLICY_VIOLATION: AI agents cannot execute outbound email dispatch.');
    }

    const conn = connectorRegistry.getConnection(draft.mailboxId) || connectorRegistry.listConnections()[0];
    const dispatchResult = await this.dispatchApprovedMessage({
      id: `msg-${draft.id}`,
      connectionId: conn?.id || draft.mailboxId,
      senderAccount: conn?.emailAddress || 'donations@phumulani.org',
      to: draft.to,
      cc: draft.cc,
      subject: draft.subject,
      bodyText: draft.bodyText || '',
      bodyHtml: draft.bodyHtml,
      idempotencyKey: `draft-send-${draft.id}`,
      approvalRecordId: `apr-${draft.id}`,
      approvedByUserId: draft.approvedBy || senderId,
      approvedByName: draft.approvedBy || senderId,
      approvedAt: draft.approvedAt || new Date().toISOString(),
      approvalVersion: 1,
      deliveryState: 'APPROVED',
    });

    if (!dispatchResult.success) {
      return {
        success: false,
        deliveryStatus: dispatchResult.deliveryState,
        dispatchId: dispatchResult.dispatchId,
        error: dispatchResult.error,
      };
    }

    const isProviderAccepted =
      dispatchResult.deliveryState === 'PROVIDER_ACCEPTED' ||
      dispatchResult.deliveryState === 'DELIVERY_CONFIRMED';
    draft.status = isProviderAccepted ? 'SENT' : 'STAGED';
    draft.sentAt = dispatchResult.dispatchedAt;

    return {
      success: true,
      deliveryStatus: isProviderAccepted ? dispatchResult.deliveryState : 'STAGED',
      dispatchId: dispatchResult.dispatchId,
      providerMessageId: dispatchResult.providerMessageId,
      sentAt: draft.sentAt,
    };
  }

  public async registerIdempotency(key: string, dispatchId: string): Promise<{ isNew: boolean; dispatchId: string }> {
    const existing = await this.getActiveIdempotencyRecord(key);
    if (existing) {
      return { isNew: false, dispatchId: existing.dispatchId };
    }

    const record: EmailIdempotencyRecord = {
      idempotencyKey: key,
      dispatchId,
      senderAccount: 'donations@phumulani.org',
      recipientEmails: [],
      subjectHash: 'hash',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    };
    await this.saveIdempotencyRecord(record);

    return { isNew: true, dispatchId };
  }

  /**
   * Dispatch an approved outbound message with full security and verification gates
   */
  public async dispatchApprovedMessage(message: ApprovedOutboundMessage): Promise<SendResult> {
    // Gate 0: Emergency Kill Switch
    if (this.emergencyShutdown) {
      return {
        success: false,
        dispatchId: '',
        deliveryState: 'CANCELLED',
        dispatchedAt: new Date().toISOString(),
        recipientCount: message.to.length,
        error: 'EMERGENCY_SHUTDOWN: Outbound email dispatch is suspended by institutional administrator kill switch.',
      };
    }

    // Gate 1: Human Approval Requirement
    if (!message.approvalRecordId || !message.approvedByUserId) {
      throw new Error('POLICY_VIOLATION: Message cannot be dispatched without human executive approval.');
    }

    // Gate 2: Anti-AI Self-Approval Guard (Section 12, Section 15)
    if (
      message.approvedByUserId.startsWith('ai-') ||
      message.approvedByUserId.startsWith('agent-') ||
      message.approvedByName.toLowerCase().includes('agent') ||
      message.approvedByName.toLowerCase().includes('ai assistant')
    ) {
      throw new Error('POLICY_VIOLATION: AI agents cannot approve outgoing email dispatches. Human executive approval required.');
    }

    // Gate 3: VAWA Section 1367 Safeguarding Air-Gap (Section 14)
    if (
      message.senderAccount.toLowerCase().includes('safeguarding') ||
      message.subject.toLowerCase().includes('safeguarding') ||
      message.bodyText.toLowerCase().includes('order for protection') ||
      message.bodyText.toLowerCase().includes('shelter location')
    ) {
      const conn = connectorRegistry.getConnection(message.connectionId);
      if (conn?.safeguardingClassification === 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP') {
        throw new Error('SAFEGUARDING_AIR_GAP_VIOLATION: Confidential survivor communication cannot be dispatched via automated gateway.');
      }
    }

    // Gate 4: 24-Hour Idempotency Deduplication (Section 12)
    const existingIdem = await this.getActiveIdempotencyRecord(message.idempotencyKey);
    if (existingIdem) {
      return {
        success: true,
        dispatchId: existingIdem.dispatchId,
        providerMessageId: existingIdem.providerMessageId,
        deliveryState: existingIdem.deliveryState || 'STAGED',
        dispatchedAt: existingIdem.createdAt,
        recipientCount: message.to.length,
      };
    }

    // Gate 5: Recipient Validation
    if (!message.to || message.to.length === 0) {
      throw new Error('INVALID_RECIPIENT: Outbound message must contain at least one recipient address.');
    }

    // Gate 6: Pilot Allowlist Check in Staged/Pilot Mode (Section 13)
    const operationalMode = process.env.PHUMULANI_OPERATIONAL_MODE || 'STAGED_DEVELOPMENT';
    if (operationalMode === 'CONTROLLED_LIVE_PILOT') {
      const allowedPilotDomains = ['phumulani.org', 'example.org', 'test.phumulani.org'];
      for (const recipient of message.to) {
        const domain = recipient.split('@')[1]?.toLowerCase();
        if (!domain || !allowedPilotDomains.includes(domain)) {
          throw new Error(`PILOT_RESTRICTION: Recipient domain @${domain} is not in authorized pilot allowlist.`);
        }
      }
    }

    // Transmit via connector
    const dispatchId = `disp-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const result = await connectorRegistry.transmitApprovedMessage(message.connectionId, {
      id: message.id,
      connectionId: message.connectionId,
      senderAccount: message.senderAccount,
      recipientEmails: message.to,
      subject: message.subject,
      bodyText: message.bodyText,
      bodyHtml: message.bodyHtml,
      idempotencyKey: message.idempotencyKey,
      approvedByUserId: message.approvedByUserId,
      approvedByName: message.approvedByName,
      approvedAt: message.approvedAt,
      approvalVersion: message.approvalVersion,
      deliveryState: operationalMode === 'CONTROLLED_LIVE_PILOT' ? 'PROVIDER_ACCEPTED' : 'STAGED',
    });

    if (
      !result.success ||
      result.deliveryState === 'FAILED' ||
      result.deliveryState === 'CANCELLED' ||
      result.deliveryState === 'RECONCILIATION_REQUIRED'
    ) {
      return {
        success: false,
        dispatchId: result.dispatchId || dispatchId,
        deliveryState: result.deliveryState || 'FAILED',
        dispatchedAt: result.dispatchedAt || new Date().toISOString(),
        recipientCount: message.to.length,
        error: result.error || `Outbound transmission ended in state ${result.deliveryState || 'FAILED'}.`,
      };
    }

    const finalDispatchId = result.dispatchId || dispatchId;

    // Record idempotency durably ONLY for successful non-failed dispatches
    await this.saveIdempotencyRecord({
      idempotencyKey: message.idempotencyKey,
      dispatchId: finalDispatchId,
      senderAccount: message.senderAccount,
      recipientEmails: message.to,
      subjectHash: crypto.createHash('sha256').update(message.subject + message.bodyText).digest('hex'),
      deliveryState: result.deliveryState,
      providerMessageId: result.providerMessageId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });

    return {
      success: true,
      dispatchId: finalDispatchId,
      providerMessageId: result.providerMessageId,
      deliveryState: result.deliveryState,
      dispatchedAt: result.dispatchedAt || new Date().toISOString(),
      recipientCount: message.to.length,
    };
  }
}

export const emailDispatchService = EmailDispatchService.getInstance();
