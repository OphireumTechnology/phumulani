/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 62 Email Delivery and Approval Types
 */

import { EmailProviderType } from './EmailProvider';

export type QuadActionType = 'APPROVE' | 'EDIT_AND_APPROVE' | 'REJECT' | 'ESCALATE_RETURN';

export const OutboundApprovalStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SENT: 'SENT',
} as const;
export type OutboundApprovalStatus = typeof OutboundApprovalStatus[keyof typeof OutboundApprovalStatus];

export const EmailDeliveryStatus = {
  STAGED: 'STAGED',
  APPROVED: 'APPROVED',
  QUEUED: 'QUEUED',
  SUBMITTED_TO_PROVIDER: 'SUBMITTED_TO_PROVIDER',
  PROVIDER_ACCEPTED: 'PROVIDER_ACCEPTED',
  DELIVERY_CONFIRMED: 'DELIVERY_CONFIRMED',
  SENT: 'SENT',
  FAILED: 'FAILED',
  BOUNCED: 'BOUNCED',
  CANCELLED: 'CANCELLED',
  RECONCILIATION_REQUIRED: 'RECONCILIATION_REQUIRED',
} as const;
export type EmailDeliveryStatus = typeof EmailDeliveryStatus[keyof typeof EmailDeliveryStatus];

export interface EmailApprovalRecord {
  id: string;
  draftId: string;
  connectionId: string;
  subject: string;
  contentHash: string;
  version: number;
  decision: QuadActionType;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  reviewNotes?: string;
  reviewedAt: string;
  isAiGenerated: boolean;
  isValid: boolean;
}

export interface ApprovedOutboundMessage {
  id: string;
  connectionId: string;
  senderAccount: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  attachments?: Array<{ filename: string; sizeBytes: number; mimeType: string; contentBase64?: string }>;
  idempotencyKey: string;
  approvalRecordId: string;
  approvedByUserId: string;
  approvedByName: string;
  approvedAt: string;
  approvalVersion: number;
  deliveryState:
    | 'STAGED'
    | 'APPROVED'
    | 'QUEUED'
    | 'SUBMITTED_TO_PROVIDER'
    | 'PROVIDER_ACCEPTED'
    | 'DELIVERY_CONFIRMED'
    | 'FAILED'
    | 'BOUNCED'
    | 'CANCELLED'
    | 'RECONCILIATION_REQUIRED';
}

export interface SendResult {
  success: boolean;
  dispatchId: string;
  providerMessageId?: string;
  deliveryState:
    | 'STAGED'
    | 'APPROVED'
    | 'QUEUED'
    | 'SUBMITTED_TO_PROVIDER'
    | 'PROVIDER_ACCEPTED'
    | 'DELIVERY_CONFIRMED'
    | 'FAILED'
    | 'BOUNCED'
    | 'CANCELLED'
    | 'RECONCILIATION_REQUIRED';
  dispatchedAt: string;
  recipientCount: number;
  error?: string;
}

export interface EmailDeliveryEvent {
  id: string;
  dispatchId: string;
  connectionId: string;
  eventType: 'QUEUED' | 'SUBMITTED' | 'ACCEPTED' | 'DELIVERED' | 'BOUNCED' | 'REJECTED' | 'FAILED';
  provider: EmailProviderType;
  recipientEmail: string;
  timestamp: string;
  rawDetails?: string;
}

export interface EmailIdempotencyRecord {
  idempotencyKey: string;
  dispatchId: string;
  senderAccount: string;
  recipientEmails: string[];
  subjectHash: string;
  deliveryState?: SendResult['deliveryState'];
  providerMessageId?: string;
  createdAt: string;
  expiresAt: string;
}

export interface EmailAuditEvent {
  id: string;
  connectionId: string;
  mailboxEmail: string;
  provider: EmailProviderType;
  action:
    | 'ACCOUNT_CONNECTED'
    | 'ACCOUNT_DISCONNECTED'
    | 'ACCOUNT_RECONNECTED'
    | 'TOKEN_REFRESHED'
    | 'TOKEN_REVOKED'
    | 'CONNECTION_VERIFIED'
    | 'SYNC_CHECKPOINT_CREATED'
    | 'CURSOR_RECOVERED'
    | 'DISPATCH_SENT'
    | 'APPROVAL_RECORDED'
    | 'SAFEGUARDING_ACCESSED'
    | 'SETTINGS_UPDATED';
  actorName: string;
  actorRole: string;
  timestamp: string;
  details: string;
  status: 'success' | 'warning' | 'error';
}
