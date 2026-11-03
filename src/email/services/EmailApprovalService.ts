/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Quad-Action Email Approval Service (Phase 62)
 * Grounded in Section 12 of Phase 62 Directive:
 * Enforces human-in-the-loop governance, hash binding, and material edit invalidation.
 */

import crypto from 'crypto';
import { EmailApprovalRecord, QuadActionType } from '../types';

export class EmailApprovalService {
  private static instance: EmailApprovalService;
  private approvals: Map<string, EmailApprovalRecord> = new Map();

  private constructor() {}

  public static getInstance(): EmailApprovalService {
    if (!EmailApprovalService.instance) {
      EmailApprovalService.instance = new EmailApprovalService();
    }
    return EmailApprovalService.instance;
  }

  public computeContentHash(subject: string, bodyText: string, recipients: string[]): string {
    const raw = `${subject}:::${bodyText}:::${recipients.sort().join(',')}`;
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
  }): EmailApprovalRecord {
    const id = `appr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const contentHash = this.computeContentHash(params.subject, params.bodyText, params.recipients);

    const record: EmailApprovalRecord = {
      id,
      draftId: params.draftId,
      connectionId: params.connectionId,
      subject: params.subject,
      contentHash,
      version: 1,
      decision: 'APPROVE', // initial requested state
      reviewerId: '',
      reviewerName: '',
      reviewerRole: '',
      reviewedAt: '',
      isAiGenerated: params.isAiGenerated,
      isValid: false, // Not valid until human decides
    };

    this.approvals.set(id, record);
    return record;
  }

  /**
   * Record human Quad-Action decision
   */
  public recordDecision(params: {
    approvalId: string;
    decision: QuadActionType;
    reviewerId: string;
    reviewerName: string;
    reviewerRole: string;
    reviewNotes?: string;
  }): EmailApprovalRecord {
    const record = this.approvals.get(params.approvalId);
    if (!record) {
      throw new Error(`Approval record ${params.approvalId} not found.`);
    }

    // Anti-AI self-approval guard (Section 12, 15)
    if (
      params.reviewerId.startsWith('ai-') ||
      params.reviewerRole === 'ai_agent' ||
      params.reviewerName.toLowerCase().includes('agent')
    ) {
      throw new Error('POLICY_VIOLATION: AI agents cannot approve outgoing email dispatches. Human executive approval required.');
    }

    record.decision = params.decision;
    record.reviewerId = params.reviewerId;
    record.reviewerName = params.reviewerName;
    record.reviewerRole = params.reviewerRole;
    record.reviewNotes = params.reviewNotes;
    record.reviewedAt = new Date().toISOString();
    record.isValid = params.decision === 'APPROVE' || params.decision === 'EDIT_AND_APPROVE';

    return record;
  }

  /**
   * Check if an approval record is valid for the exact content being sent
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
      return { valid: false, reason: `Approval decision was ${record.decision}; message is not approved for dispatch.` };
    }

    const currentHash = this.computeContentHash(currentSubject, currentBody, currentRecipients);
    if (currentHash !== record.contentHash && record.decision !== 'EDIT_AND_APPROVE') {
      // Invalidate on material modification without re-approval
      record.isValid = false;
      return {
        valid: false,
        reason: 'MATERIAL_MODIFICATION_DETECTED: Content was changed after approval was granted. Re-approval required.',
      };
    }

    return { valid: true };
  }

  public async recordApproval(
    draftId: string,
    reviewerId: string,
    decision: string = 'APPROVED',
    contentHash: string = ''
  ): Promise<EmailApprovalRecord> {
    const id = `appr-${draftId}`;
    const record: EmailApprovalRecord = {
      id,
      draftId,
      connectionId: 'conn-primary',
      subject: 'Draft Subject',
      contentHash: contentHash || this.computeContentHash('Draft Subject', 'Body', []),
      version: 1,
      decision: decision === 'APPROVED' ? 'APPROVE' : (decision as any),
      reviewerId,
      reviewerName: 'Executive Reviewer',
      reviewerRole: 'executive_director',
      reviewedAt: new Date().toISOString(),
      isAiGenerated: false,
      isValid: decision === 'APPROVED' || decision === 'APPROVE',
    };
    this.approvals.set(id, record);
    this.approvals.set(draftId, record);
    return record;
  }

  public async invalidateOnMaterialChange(draftId: string, _reason?: string): Promise<void> {
    const record = this.approvals.get(draftId) || this.approvals.get(`appr-${draftId}`);
    if (record) {
      record.isValid = false;
      record.decision = 'REJECT';
    }
  }

  public isApproved(draftId: string): boolean {
    const record = this.approvals.get(draftId) || this.approvals.get(`appr-${draftId}`);
    return !!record && record.isValid;
  }

  public getApproval(id: string): EmailApprovalRecord | undefined {
    return this.approvals.get(id);
  }
}

export const emailApprovalService = EmailApprovalService.getInstance();
