/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 62 Normalized Email Message Types
 */

import { EmailProviderType } from './EmailProvider';

export interface NormalizedEmailFolder {
  id: string;
  name: string;
  type: 'INBOX' | 'SENT' | 'DRAFTS' | 'ARCHIVE' | 'TRASH' | 'SPAM' | 'CUSTOM';
  totalMessageCount: number;
  unreadMessageCount: number;
  parentFolderId?: string;
  providerFolderId?: string;
}

export interface NormalizedEmailAttachment {
  id: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  isQuarantined?: boolean;
  quarantineReason?: string;
  contentBase64?: string;
}

export interface NormalizedEmailMessage {
  id: string;
  providerMessageId: string;
  connectionId: string;
  provider: EmailProviderType;
  sourceAccount: string;
  threadId: string;
  senderName: string;
  senderEmail: string;
  recipientEmails: string[];
  ccEmails?: string[];
  bccEmails?: string[];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  receivedAt: string;
  folder: string;
  isRead: boolean;
  isFlagged?: boolean;
  attachments?: NormalizedEmailAttachment[];
  headers?: Record<string, string>;
  rawSnippet?: string;
  classificationCategory?: string;
  priorityLevel?: string;
  assignedStaffId?: string;
  isLiveImportVerified?: boolean;
}

export interface MessageQueryOptions {
  connectionId?: string;
  mailboxEmail?: string;
  folder?: string;
  page?: number;
  limit?: number;
  searchQuery?: string;
  isRead?: boolean;
  assignedTo?: string;
  department?: string;
  sinceTimestamp?: string;
}

export interface EmailMessagePage {
  messages: NormalizedEmailMessage[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  nextCursor?: string;
}

export interface SyncOptions {
  connectionId: string;
  mailboxEmail: string;
  folders?: string[];
  maxMessages?: number;
  sinceTimestamp?: string;
  cursor?: string;
  forceFullResync?: boolean;
}

export interface SyncResult {
  success: boolean;
  connectionId: string;
  provider: EmailProviderType;
  mailboxEmail: string;
  messagesImported: number;
  duplicatesSkipped: number;
  threadsReconstructed: number;
  oldCursor?: string;
  newCursor: string;
  cursorType: 'GMAIL_HISTORY_ID' | 'MS_GRAPH_DELTA_TOKEN' | 'IMAP_UID_SEQUENCE' | 'GENERIC_TIMESTAMP';
  checkpointId: string;
  status: 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'RECONCILIATION_REQUIRED';
  timestamp: string;
  error?: string;
}

export interface EmailDraft {
  id?: string;
  connectionId: string;
  inReplyToMessageId?: string;
  threadId?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  attachments?: Array<{ filename: string; sizeBytes: number; mimeType: string; contentBase64?: string }>;
  toneStyle?: string;
  aiSuggested?: boolean;
  status?: 'DRAFT' | 'AWAITING_APPROVAL' | 'APPROVED' | 'REJECTED';
}

export interface DraftResult {
  success: boolean;
  draftId: string;
  providerDraftId?: string;
  version: number;
  createdAt: string;
  error?: string;
}
