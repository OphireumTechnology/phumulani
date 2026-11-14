/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Quad-Action Maker-Checker Email Approval Service (Phase 62 -> 68)
 * Enforces human-in-the-loop governance, strict maker-checker separation (authorId !== reviewerId),
 * anti-AI approval protection, SHA-256 content-hash binding, expiration, and material-edit invalidation.
 */

import crypto from 'crypto';
import { EmailApprovalRecord, QuadActionType } from '../types';
import { PostgresPersistenceAdapter } from '../../services/postgresPersistenceAdapter';

export class EmailApprovalService {
  private static instance: EmailApprovalService;
  private approvals: Map<string, EmailApprovalRecord> = new Map();
  private dbAdapter: PostgresPersistenceAdapter;
  private initialized = false;
  private readonly DEFAULT_EXPIRY_HOURS = 72;

  private constructor() {
    this.dbAdapter = PostgresPersistenceAdapter.getInstance();
  }

  public static getInstance(): EmailApprovalService {
    if (!EmailApprovalService.instance) {
      EmailApprovalService.instance = new EmailApprovalService();
    }
    return EmailApprovalService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const persisted = await this.dbAdapter.select<EmailApprovalRecord>('email_outbound_approvals');
      if (Array.isArray(persisted)) {
        for (const record of persisted) {
          this.approvals.set(record.id, record);
          if (record.draftId) {
            this.approvals.set(record.draftId, record);
          }
        }
      }
    } catch {
      // Non-fatal hydration fallback
    }
    this.initialized = true;
  }

  private persistRecord(record: EmailApprovalRecord): void {
    this.dbAdapter
      .insertDurableWithRetry('email_outbound_approvals', record, { context: 'EmailApprovalService:persist' })
      .catch(() => {});
  }

  private assertNotAiReviewer(reviewerId: string, reviewerName: string, reviewerRole: string): void {
    const idLower = String(reviewerId || '').toLowerCase();
    const roleLower = String(reviewerRole || '').toLowerCase();
    const nameLower = String(reviewerName || '').toLowerCase();
    if (
      idLower.startsWith('ai-') ||
      idLower.startsWith('agent-') ||
      idLower.startsWith('gemini') ||
      roleLower === 'ai_agent' ||
      roleLower === 'ai_copilot' ||
      nameLower.includes('agent') ||
      nameLower.includes('ai assistant')
    ) {
      throw new Error(
        'POLICY_VIOLATION: AI agents cannot approve outgoing email dispatches. Human executive approval required.'
      );
    }
  }

  private assertMakerCheckerSeparation(authorId: string | undefined, reviewerId: string): void {
    if (!authorId || !reviewerId) return;
    if (authorId.trim().toLowerCase() === reviewerId.trim().toLowerCase()) {
      throw new Error(
        `MAKER_CHECKER_VIOLATION: Author (${authorId}) cannot approve their own outbound communication. An independent human reviewer is required.`
      );
    }
  }

  public computeContentHash(subject: string, bodyText: string, recipients: string[]): string {
    const raw = `${subject}:::${bodyText}:::${[...recipients].sort().join(',')}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Submit an email draft for human approval review
   */
  public createApprovalRequest(params: {
    draftId: string;
    connectionId: string;
    subject: string;
    bodyText: string;
    recipients: string[];
    isAiGenerated: boolean;
    authorId?: string;
    expiresInHours?: number;
  }): EmailApprovalRecord {
    const id = `appr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const contentHash = this.computeContentHash(params.subject, params.bodyText, params.recipients);
    const expiresAt = new Date(
      Date.now() + (params.expiresInHours || this.DEFAULT_EXPIRY_HOURS) * 3600 * 1000
    ).toISOString();

    const record: EmailApprovalRecord = {
      id,
      draftId: params.draftId,
      connectionId: params.connectionId,
      subject: params.subject,
      contentHash,
      version: 1,
      decision: 'APPROVE',
      authorId: params.authorId,
      reviewerId: '',
      reviewerName: '',
      reviewerRole: '',
      reviewedAt: '',
      expiresAt,
      isAiGenerated: params.isAiGenerated,
      isValid: false, // Pending human maker-checker decision
    };

    this.approvals.set(id, record);
    this.approvals.set(params.draftId, record);
    this.persistRecord(record);
    return record;
  }

  /**
   * Record human Quad-Action decision with strict anti-AI and maker-checker enforcement
   */
  public recordDecision(params: {
    approvalId: string;
    decision: QuadActionType;
    reviewerId: string;
    reviewerName: string;
    reviewerRole: string;
    reviewNotes?: string;
    authorId?: string;
    updatedSubject?: string;
    updatedBodyText?: string;
    updatedRecipients?: string[];
  }): EmailApprovalRecord {
    const record = this.approvals.get(params.approvalId);
    if (!record) {
      throw new Error(`Approval record ${params.approvalId} not found.`);
    }

    this.assertNotAiReviewer(params.reviewerId, params.reviewerName, params.reviewerRole);

    const effectiveAuthor = params.authorId || record.authorId;
    if (params.decision === 'APPROVE' || params.decision === 'EDIT_AND_APPROVE') {
      this.assertMakerCheckerSeparation(effectiveAuthor, params.reviewerId);
    }

    if (params.decision === 'EDIT_AND_APPROVE' && params.updatedSubject !== undefined && params.updatedBodyText !== undefined) {
      record.subject = params.updatedSubject;
      record.contentHash = this.computeContentHash(
        params.updatedSubject,
        params.updatedBodyText,
        params.updatedRecipients || []
      );
      record.version += 1;
    }

    record.decision = params.decision;
    record.reviewerId = params.reviewerId;
    record.reviewerName = params.reviewerName;
    record.reviewerRole = params.reviewerRole;
    record.reviewNotes = params.reviewNotes;
    record.reviewedAt = new Date().toISOString();
    record.expiresAt = new Date(Date.now() + this.DEFAULT_EXPIRY_HOURS * 3600 * 1000).toISOString();
    record.isValid = params.decision === 'APPROVE' || params.decision === 'EDIT_AND_APPROVE';
    record.invalidatedReason = record.isValid ? undefined : `Decision set to ${params.decision}`;

    this.approvals.set(record.id, record);
    if (record.draftId) this.approvals.set(record.draftId, record);
    this.persistRecord(record);
    return record;
  }

  /**
   * Check if an approval record is valid, unexpired, and matches exact content hash
   */
  public verifyApprovalValidity(
    approvalId: string,
    currentSubject: string,
    currentBody: string,
    currentRecipients: string[]
  ): { valid: boolean; reason?: string } {
    const record = this.approvals.get(approvalId);
    if (!record) {
      return { valid: false, reason: 'Approval record not found.' };
    }

    if (!record.isValid) {
      return {
        valid: false,
        reason: record.invalidatedReason || `Approval decision was ${record.decision}; message is not approved for dispatch.`,
      };
    }

    if (record.expiresAt && new Date(record.expiresAt).getTime() <= Date.now()) {
      record.isValid = false;
      record.invalidatedReason = 'APPROVAL_EXPIRED: Executive approval expired before dispatch. Re-approval required.';
      this.persistRecord(record);
      return {
        valid: false,
        reason: record.invalidatedReason,
      };
    }

    if (record.authorId && record.reviewerId && record.authorId.toLowerCase() === record.reviewerId.toLowerCase()) {
      record.isValid = false;
      record.invalidatedReason = 'MAKER_CHECKER_VIOLATION: Self-approved record invalidated.';
      this.persistRecord(record);
      return { valid: false, reason: record.invalidatedReason };
    }

    const currentHash = this.computeContentHash(currentSubject, currentBody, currentRecipients);
    if (currentHash !== record.contentHash) {
      record.isValid = false;
      record.invalidatedReason = 'MATERIAL_MODIFICATION_DETECTED: Content was changed after approval was granted. Re-approval required.';
      this.persistRecord(record);
      return {
        valid: false,
        reason: record.invalidatedReason,
      };
    }

    return { valid: true };
  }

  public async recordApproval(
    draftId: string,
    reviewerId: string,
    decision: string = 'APPROVED',
    contentHash: string = '',
    authorId?: string
  ): Promise<EmailApprovalRecord> {
    await this.initialize();
    this.assertNotAiReviewer(reviewerId, reviewerId, reviewerId);
    if (decision === 'APPROVED' || decision === 'APPROVE' || decision === 'EDIT_AND_APPROVE') {
      this.assertMakerCheckerSeparation(authorId, reviewerId);
    }

    const id = `appr-${draftId}`;
    const existing = this.approvals.get(id) || this.approvals.get(draftId);
    const record: EmailApprovalRecord = {
      id,
      draftId,
      connectionId: existing?.connectionId || 'conn-primary',
      subject: existing?.subject || 'Draft Subject',
      contentHash: contentHash || existing?.contentHash || this.computeContentHash('Draft Subject', 'Body', []),
      version: (existing?.version || 0) + 1,
      decision: decision === 'APPROVED' ? 'APPROVE' : (decision as QuadActionType),
      authorId: authorId || existing?.authorId,
      reviewerId,
      reviewerName: 'Executive Reviewer',
      reviewerRole: 'executive_director',
      reviewedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.DEFAULT_EXPIRY_HOURS * 3600 * 1000).toISOString(),
      isAiGenerated: existing?.isAiGenerated ?? false,
      isValid: decision === 'APPROVED' || decision === 'APPROVE' || decision === 'EDIT_AND_APPROVE',
    };
    this.approvals.set(id, record);
    this.approvals.set(draftId, record);
    this.persistRecord(record);
    return record;
  }

  public async invalidateOnMaterialChange(draftId: string, reason?: string): Promise<void> {
    await this.initialize();
    const record = this.approvals.get(draftId) || this.approvals.get(`appr-${draftId}`);
    if (record) {
      record.isValid = false;
      record.decision = 'REJECT';
      record.invalidatedReason = reason || 'MATERIAL_MODIFICATION_DETECTED: Re-approval required after edit.';
      this.persistRecord(record);
    }
  }

  public isApproved(draftId: string): boolean {
    const record = this.approvals.get(draftId) || this.approvals.get(`appr-${draftId}`);
    if (!record || !record.isValid) return false;
    if (record.expiresAt && new Date(record.expiresAt).getTime() <= Date.now()) {
      return false;
    }
    return true;
  }

  public getApproval(id: string): EmailApprovalRecord | undefined {
    return this.approvals.get(id) || this.approvals.get(`appr-${id}`);
  }

  public async listApprovals(): Promise<EmailApprovalRecord[]> {
    await this.initialize();
    const deduped = new Map<string, EmailApprovalRecord>();
    for (const r of this.approvals.values()) {
      deduped.set(r.id, r);
    }
    return Array.from(deduped.values()).sort(
      (a, b) => new Date(b.reviewedAt || 0).getTime() - new Date(a.reviewedAt || 0).getTime()
    );
  }
}

export const emailApprovalService = EmailApprovalService.getInstance();
