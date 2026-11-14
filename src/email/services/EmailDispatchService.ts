/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Human-Approved Email Dispatch Service (Phase 62 -> 68)
 * Enforces:
 * - 10-stage outbound lifecycle tracking
 * - Durable persistence for drafts, dispatches, idempotency, delivery events, and kill switch
 * - Maker-checker separation (authorId !== reviewerId) and anti-AI self-approval
 * - VAWA Section 1367 safeguarding air-gap
 * - Scheduled delivery queue & bulk campaign batch pause/cancel/rate limits
 * - Honest distinction between STAGED, PROVIDER_ACCEPTED, and DELIVERY_CONFIRMED
 */

import crypto from 'crypto';
import { connectorRegistry } from '../connectors/ConnectorRegistry';
import {
  ApprovedOutboundMessage,
  SendResult,
  EmailIdempotencyRecord,
  OutboundLifecycleStage,
  mapToOutboundLifecycleStage,
} from '../types';
import { PostgresPersistenceAdapter } from '../../services/postgresPersistenceAdapter';
import { emailApprovalService } from './EmailApprovalService';
import { EmailAuditService } from './EmailAuditService';

export interface PersistentDraftRecord {
  id: string;
  mailboxId: string;
  to: string[];
  cc: string[];
  subject: string;
  bodyHtml: string;
  bodyText: string;
  authorId: string;
  authorRole: string;
  isAiGenerated: boolean;
  isSafeguarded: boolean;
  safeguardingCategory?: string;
  status: string;
  lifecycleStage: OutboundLifecycleStage;
  approvalId?: string;
  approvedBy?: string;
  approvedRole?: string;
  approvalNotes?: string;
  approvedAt?: string;
  scheduledFor?: string;
  batchId?: string;
  dispatchId?: string;
  providerMessageId?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignBatchRecord {
  id: string;
  title: string;
  draftIds: string[];
  perMinuteLimit: number;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'COMPLETED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export class EmailDispatchService {
  private static instance: EmailDispatchService;
  private idempotencyStore: Map<string, EmailIdempotencyRecord> = new Map();
  private drafts: Map<string, PersistentDraftRecord> = new Map();
  private batches: Map<string, CampaignBatchRecord> = new Map();
  private emergencyShutdown: boolean = false;
  private dbAdapter: PostgresPersistenceAdapter;
  private initialized = false;

  private constructor() {
    this.dbAdapter = PostgresPersistenceAdapter.getInstance();
  }

  public static getInstance(): EmailDispatchService {
    if (!EmailDispatchService.instance) {
      EmailDispatchService.instance = new EmailDispatchService();
    }
    return EmailDispatchService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const persistedDrafts = await this.dbAdapter.select<PersistentDraftRecord>('email_drafts');
      for (const d of persistedDrafts) {
        this.drafts.set(d.id, d);
      }
      const killSwitches = await this.dbAdapter.select<{ id: string; active: boolean }>(
        'email_operational_killswitches',
        (r) => r.id === 'GLOBAL_OUTBOUND_EMAIL'
      );
      if (killSwitches[0]) {
        this.emergencyShutdown = Boolean(killSwitches[0].active);
      }
      const persistedBatches = await this.dbAdapter.select<CampaignBatchRecord>('email_campaign_batches');
      for (const b of persistedBatches) {
        this.batches.set(b.id, b);
      }
    } catch {
      // Non-fatal hydration fallback
    }
    this.initialized = true;
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

  public setEmergencyShutdown(active: boolean): void {
    this.emergencyShutdown = active;
    this.dbAdapter
      .insertDurableWithRetry(
        'email_operational_killswitches',
        { id: 'GLOBAL_OUTBOUND_EMAIL', active, updatedAt: new Date().toISOString() },
        { context: 'EmailDispatchService:killswitch' }
      )
      .catch(() => {});
  }

  public isEmergencyShutdownActive(): boolean {
    return this.emergencyShutdown;
  }

  public async activateEmergencyKillSwitch(actor: string, reason?: string): Promise<void> {
    this.emergencyShutdown = true;
    await this.dbAdapter.insertDurableWithRetry(
      'email_operational_killswitches',
      {
        id: 'GLOBAL_OUTBOUND_EMAIL',
        active: true,
        actor,
        reason: reason || 'Administrator triggered kill switch',
        updatedAt: new Date().toISOString(),
      },
      { context: 'EmailDispatchService:activateKillswitch' }
    );
    await EmailAuditService.getInstance().logEvent({
      action: 'EMERGENCY_KILL_SWITCH_ACTIVATED',
      actor,
      details: { reason },
    });
  }

  public async deactivateEmergencyKillSwitch(actor: string): Promise<void> {
    this.emergencyShutdown = false;
    await this.dbAdapter.insertDurableWithRetry(
      'email_operational_killswitches',
      {
        id: 'GLOBAL_OUTBOUND_EMAIL',
        active: false,
        actor,
        updatedAt: new Date().toISOString(),
      },
      { context: 'EmailDispatchService:deactivateKillswitch' }
    );
    await EmailAuditService.getInstance().logEvent({
      action: 'EMERGENCY_KILL_SWITCH_DEACTIVATED',
      actor,
      details: {},
    });
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
    batchId?: string;
  }): Promise<PersistentDraftRecord> {
    await this.initialize();
    const id = `draft-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const initialStage: OutboundLifecycleStage = params.isAiGenerated ? 'AI_REVIEWED' : 'DRAFT';
    const now = new Date().toISOString();

    const draft: PersistentDraftRecord = {
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
      batchId: params.batchId,
      status: 'DRAFT',
      lifecycleStage: initialStage,
      createdAt: now,
      updatedAt: now,
    };
    this.drafts.set(id, draft);
    await this.dbAdapter.insertDurableWithRetry('email_drafts', draft, { context: 'EmailDispatchService:createDraft' });
    return draft;
  }

  public async updateDraftContent(
    draftId: string,
    updates: { subject?: string; bodyText?: string; bodyHtml?: string; to?: string[] }
  ): Promise<PersistentDraftRecord> {
    await this.initialize();
    const draft = this.drafts.get(draftId);
    if (!draft) throw new Error(`Draft ${draftId} not found`);

    const materialChange =
      (updates.subject !== undefined && updates.subject !== draft.subject) ||
      (updates.bodyText !== undefined && updates.bodyText !== draft.bodyText) ||
      (updates.to !== undefined && JSON.stringify(updates.to) !== JSON.stringify(draft.to));

    if (updates.subject !== undefined) draft.subject = updates.subject;
    if (updates.bodyText !== undefined) draft.bodyText = updates.bodyText;
    if (updates.bodyHtml !== undefined) draft.bodyHtml = updates.bodyHtml;
    if (updates.to !== undefined) draft.to = updates.to;

    if (materialChange && draft.status === 'APPROVED') {
      draft.status = 'SUBMITTED';
      draft.lifecycleStage = 'PENDING_HUMAN_APPROVAL';
      await emailApprovalService.invalidateOnMaterialChange(draft.id, 'Material edit made after approval');
    }

    draft.updatedAt = new Date().toISOString();
    await this.dbAdapter.insertDurableWithRetry('email_drafts', draft, { context: 'EmailDispatchService:updateDraft' });
    return draft;
  }

  public async submitDraftForApproval(draftId: string, _authorId: string): Promise<PersistentDraftRecord> {
    await this.initialize();
    const draft = this.drafts.get(draftId);
    if (!draft) throw new Error(`Draft ${draftId} not found`);
    draft.status = 'SUBMITTED';
    draft.lifecycleStage = 'PENDING_HUMAN_APPROVAL';
    draft.updatedAt = new Date().toISOString();

    const appr = emailApprovalService.createApprovalRequest({
      draftId: draft.id,
      connectionId: draft.mailboxId,
      subject: draft.subject,
      bodyText: draft.bodyText || draft.bodyHtml || '',
      recipients: draft.to,
      isAiGenerated: draft.isAiGenerated,
      authorId: draft.authorId,
    });
    draft.approvalId = appr.id;

    await this.dbAdapter.insertDurableWithRetry('email_drafts', draft, { context: 'EmailDispatchService:submitDraft' });
    return draft;
  }

  public async approveDraft(
    draftId: string,
    reviewerId: string,
    reviewerRole: string,
    notes?: string
  ): Promise<PersistentDraftRecord> {
    await this.initialize();
    const draft = this.drafts.get(draftId);
    if (!draft) throw new Error(`Draft ${draftId} not found`);

    // Anti-AI Self-Approval Guard
    if (
      reviewerId.startsWith('ai-') ||
      reviewerId.startsWith('agent-') ||
      reviewerId.startsWith('gemini') ||
      reviewerRole === 'ai_copilot' ||
      reviewerRole === 'ai_agent'
    ) {
      throw new Error('POLICY_VIOLATION: AI agents cannot approve outgoing email dispatches. Human executive approval required.');
    }

    // Maker-checker separation: author cannot approve their own communication
    if (draft.authorId && draft.authorId.trim().toLowerCase() === reviewerId.trim().toLowerCase()) {
      throw new Error(
        `MAKER_CHECKER_VIOLATION: Author (${draft.authorId}) cannot approve their own outbound communication.`
      );
    }

    // Safeguarding Air-Gap Guard
    if (draft.isSafeguarded && reviewerRole !== 'safeguarding_lead' && reviewerRole !== 'executive_director') {
      throw new Error('SAFEGUARDING_AIR_GAP_VIOLATION: Confidential survivor communication requires safeguarding lead authorization.');
    }

    const contentHash = emailApprovalService.computeContentHash(
      draft.subject,
      draft.bodyText || draft.bodyHtml || '',
      draft.to
    );

    const existingApproval = draft.approvalId ? emailApprovalService.getApproval(draft.approvalId) : undefined;
    if (draft.approvalId && existingApproval) {
      const contentChanged = existingApproval.contentHash !== contentHash;
      emailApprovalService.recordDecision({
        approvalId: draft.approvalId,
        decision: contentChanged ? 'EDIT_AND_APPROVE' : 'APPROVE',
        reviewerId,
        reviewerName: reviewerId,
        reviewerRole,
        reviewNotes: notes,
        authorId: draft.authorId,
        ...(contentChanged
          ? {
              updatedSubject: draft.subject,
              updatedBodyText: draft.bodyText || draft.bodyHtml || '',
              updatedRecipients: draft.to,
            }
          : {}),
      });
    } else {
      const appr = await emailApprovalService.recordApproval(
        draft.id,
        reviewerId,
        'APPROVED',
        contentHash,
        draft.authorId
      );
      draft.approvalId = appr.id;
    }

    draft.status = 'APPROVED';
    draft.lifecycleStage = 'APPROVED';
    draft.approvedBy = reviewerId;
    draft.approvedRole = reviewerRole;
    draft.approvalNotes = notes;
    draft.approvedAt = new Date().toISOString();
    draft.updatedAt = draft.approvedAt;

    await this.dbAdapter.insertDurableWithRetry('email_drafts', draft, { context: 'EmailDispatchService:approveDraft' });
    await EmailAuditService.getInstance().logEvent({
      action: 'APPROVAL_RECORDED',
      actor: reviewerId,
      actorRole: reviewerRole,
      connectionId: draft.mailboxId,
      details: { draftId: draft.id, approvalId: draft.approvalId, contentHash },
    });
    return draft;
  }

  public async scheduleDraft(draftId: string, scheduledForIso: string, actorId: string): Promise<PersistentDraftRecord> {
    await this.initialize();
    const draft = this.drafts.get(draftId);
    if (!draft) throw new Error(`Draft ${draftId} not found`);
    if (draft.status !== 'APPROVED') {
      throw new Error(`POLICY_VIOLATION: Draft must be APPROVED before scheduling (current: ${draft.status}).`);
    }
    const when = new Date(scheduledForIso);
    if (isNaN(when.getTime())) {
      throw new Error('INVALID_SCHEDULE_TIME: Provide a valid ISO-8601 timestamp.');
    }
    draft.scheduledFor = when.toISOString();
    draft.status = 'SCHEDULED';
    draft.lifecycleStage = 'SCHEDULED';
    draft.updatedAt = new Date().toISOString();
    await this.dbAdapter.insertDurableWithRetry('email_drafts', draft, { context: 'EmailDispatchService:scheduleDraft' });
    await EmailAuditService.getInstance().logEvent({
      action: 'OUTBOUND_EMAIL_SCHEDULED',
      actor: actorId,
      details: { draftId, scheduledFor: draft.scheduledFor },
    });
    return draft;
  }

  public async processDueScheduledDispatches(): Promise<{ processed: number; sent: number; failed: number }> {
    await this.initialize();
    if (this.emergencyShutdown) {
      return { processed: 0, sent: 0, failed: 0 };
    }

    const now = Date.now();
    const due = Array.from(this.drafts.values()).filter(
      (d) =>
        (d.status === 'SCHEDULED' || d.lifecycleStage === 'SCHEDULED') &&
        d.scheduledFor &&
        new Date(d.scheduledFor).getTime() <= now
    );

    let sent = 0;
    let failed = 0;
    for (const draft of due) {
      if (draft.batchId) {
        const batch = this.batches.get(draft.batchId);
        if (batch && (batch.status === 'PAUSED' || batch.status === 'CANCELLED')) {
          continue;
        }
      }

      // Restore status to APPROVED for sendApprovedEmail verification
      draft.status = 'APPROVED';
      try {
        const res = await this.sendApprovedEmail(draft.id, draft.approvedBy || 'scheduler-worker');
        if (res.success) sent++;
        else failed++;
      } catch {
        failed++;
      }
    }

    return { processed: due.length, sent, failed };
  }

  public createCampaignBatch(params: {
    title: string;
    draftIds: string[];
    perMinuteLimit?: number;
    createdBy: string;
  }): CampaignBatchRecord {
    const id = `batch-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const rec: CampaignBatchRecord = {
      id,
      title: params.title,
      draftIds: params.draftIds,
      perMinuteLimit: Math.max(1, Math.min(120, params.perMinuteLimit || 20)),
      status: 'ACTIVE',
      createdBy: params.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.batches.set(id, rec);
    this.dbAdapter
      .insertDurableWithRetry('email_campaign_batches', rec, { context: 'EmailDispatchService:createBatch' })
      .catch(() => {});
    return rec;
  }

  public updateCampaignBatchStatus(batchId: string, status: 'ACTIVE' | 'PAUSED' | 'CANCELLED'): CampaignBatchRecord {
    const batch = this.batches.get(batchId);
    if (!batch) throw new Error(`Campaign batch ${batchId} not found`);
    batch.status = status;
    batch.updatedAt = new Date().toISOString();
    this.dbAdapter
      .insertDurableWithRetry('email_campaign_batches', batch, { context: 'EmailDispatchService:updateBatch' })
      .catch(() => {});
    if (status === 'CANCELLED') {
      for (const did of batch.draftIds) {
        const draft = this.drafts.get(did);
        if (draft && !['SENT', 'DELIVERY_CONFIRMED'].includes(draft.status)) {
          draft.status = 'CANCELLED';
          draft.lifecycleStage = 'CANCELLED';
          draft.updatedAt = new Date().toISOString();
          this.dbAdapter.insertDurableWithRetry('email_drafts', draft, { context: 'EmailDispatchService:cancelBatch' }).catch(() => {});
        }
      }
    }
    return batch;
  }

  public listCampaignBatches(): CampaignBatchRecord[] {
    return Array.from(this.batches.values());
  }

  public async sendApprovedEmail(draftId: string, senderId: string): Promise<any> {
    await this.initialize();
    if (this.emergencyShutdown) {
      return {
        success: false,
        deliveryStatus: 'CANCELLED',
        lifecycleStage: 'CANCELLED',
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

    if (draft.approvalId && emailApprovalService.getApproval(draft.approvalId)) {
      const validCheck = emailApprovalService.verifyApprovalValidity(
        draft.approvalId,
        draft.subject,
        draft.bodyText || draft.bodyHtml || '',
        draft.to
      );
      if (!validCheck.valid) {
        draft.status = 'SUBMITTED';
        draft.lifecycleStage = 'PENDING_HUMAN_APPROVAL';
        await this.dbAdapter.insertDurableWithRetry('email_drafts', draft, { context: 'EmailDispatchService:reapprovalRequired' });
        throw new Error(validCheck.reason || 'Approval hash or expiration check failed.');
      }
    }

    draft.lifecycleStage = 'SENDING';
    const normalizedMbx = (draft.mailboxId || '').toLowerCase();
    const conn =
      connectorRegistry.getConnection(draft.mailboxId) ||
      connectorRegistry.listConnections().find((c) => c.emailAddress.toLowerCase() === normalizedMbx) ||
      connectorRegistry.listConnections()[0];
    const dispatchResult = await this.dispatchApprovedMessage({
      id: `msg-${draft.id}`,
      connectionId: conn?.id || draft.mailboxId,
      senderAccount: conn?.emailAddress || (normalizedMbx.includes('@') ? draft.mailboxId : 'donations@phumulani.org'),
      to: draft.to,
      cc: draft.cc,
      subject: draft.subject,
      bodyText: draft.bodyText || '',
      bodyHtml: draft.bodyHtml,
      idempotencyKey: `draft-send-${draft.id}`,
      approvalRecordId: draft.approvalId || `apr-${draft.id}`,
      approvedByUserId: draft.approvedBy || senderId,
      approvedByName: draft.approvedBy || senderId,
      approvedAt: draft.approvedAt || new Date().toISOString(),
      approvalVersion: 1,
      deliveryState: 'APPROVED',
    });

    if (!dispatchResult.success) {
      draft.lifecycleStage = 'DELIVERY_FAILED';
      await this.dbAdapter.insertDurableWithRetry('email_drafts', draft, { context: 'EmailDispatchService:sendFail' });
      return {
        success: false,
        deliveryStatus: dispatchResult.deliveryState,
        lifecycleStage: 'DELIVERY_FAILED',
        dispatchId: dispatchResult.dispatchId,
        error: dispatchResult.error,
      };
    }

    const isProviderAccepted =
      dispatchResult.deliveryState === 'PROVIDER_ACCEPTED' ||
      dispatchResult.deliveryState === 'DELIVERY_CONFIRMED';
    draft.status = isProviderAccepted ? 'SENT' : 'STAGED';
    draft.lifecycleStage = mapToOutboundLifecycleStage(dispatchResult.deliveryState);
    draft.dispatchId = dispatchResult.dispatchId;
    draft.providerMessageId = dispatchResult.providerMessageId;
    draft.sentAt = dispatchResult.dispatchedAt;
    draft.updatedAt = new Date().toISOString();

    await this.dbAdapter.insertDurableWithRetry('email_drafts', draft, { context: 'EmailDispatchService:sent' });

    return {
      success: true,
      deliveryStatus: isProviderAccepted ? dispatchResult.deliveryState : 'STAGED',
      lifecycleStage: draft.lifecycleStage,
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
   * Dispatch an approved outbound message with full security, persistence, and verification gates
   */
  public async dispatchApprovedMessage(message: ApprovedOutboundMessage): Promise<SendResult> {
    await this.initialize();

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

    if (!message.approvalRecordId || !message.approvedByUserId) {
      throw new Error('POLICY_VIOLATION: Message cannot be dispatched without human executive approval.');
    }

    if (
      message.approvedByUserId.startsWith('ai-') ||
      message.approvedByUserId.startsWith('agent-') ||
      message.approvedByUserId.startsWith('gemini') ||
      message.approvedByName.toLowerCase().includes('agent') ||
      message.approvedByName.toLowerCase().includes('ai assistant')
    ) {
      throw new Error('POLICY_VIOLATION: AI agents cannot approve outgoing email dispatches. Human executive approval required.');
    }

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

    if (!message.to || message.to.length === 0) {
      throw new Error('INVALID_RECIPIENT: Outbound message must contain at least one recipient address.');
    }

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

    const finalDispatchId = result.dispatchId || dispatchId;
    const timestamp = result.dispatchedAt || new Date().toISOString();

    await this.dbAdapter
      .insertDurableWithRetry(
        'email_outbound_dispatch',
        {
          id: finalDispatchId,
          connectionId: message.connectionId,
          senderAccount: message.senderAccount,
          recipientEmails: message.to,
          subject: message.subject,
          deliveryState: result.deliveryState || 'FAILED',
          lifecycleStage: mapToOutboundLifecycleStage(result.deliveryState || 'FAILED'),
          providerMessageId: result.providerMessageId,
          approvedByUserId: message.approvedByUserId,
          error: result.error,
          dispatchedAt: timestamp,
        },
        { context: 'EmailDispatchService:dispatchRecord' }
      )
      .catch(() => {});

    if (
      !result.success ||
      result.deliveryState === 'FAILED' ||
      result.deliveryState === 'CANCELLED' ||
      result.deliveryState === 'RECONCILIATION_REQUIRED'
    ) {
      return {
        success: false,
        dispatchId: finalDispatchId,
        deliveryState: result.deliveryState || 'FAILED',
        dispatchedAt: timestamp,
        recipientCount: message.to.length,
        error: result.error || `Outbound transmission ended in state ${result.deliveryState || 'FAILED'}.`,
      };
    }

    await this.saveIdempotencyRecord({
      idempotencyKey: message.idempotencyKey,
      dispatchId: finalDispatchId,
      senderAccount: message.senderAccount,
      recipientEmails: message.to,
      subjectHash: crypto.createHash('sha256').update(message.subject + message.bodyText).digest('hex'),
      deliveryState: result.deliveryState,
      providerMessageId: result.providerMessageId,
      createdAt: timestamp,
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });

    return {
      success: true,
      dispatchId: finalDispatchId,
      providerMessageId: result.providerMessageId,
      deliveryState: result.deliveryState,
      dispatchedAt: timestamp,
      recipientCount: message.to.length,
    };
  }

  public async listDrafts(): Promise<PersistentDraftRecord[]> {
    await this.initialize();
    return Array.from(this.drafts.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public async listDispatches(): Promise<any[]> {
    return this.dbAdapter.select<any>('email_outbound_dispatch');
  }
}

export const emailDispatchService = EmailDispatchService.getInstance();
