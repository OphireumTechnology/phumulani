/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Universal Email Connector Framework Types
 * Grounded in Master Development Instruction Phase 60 (M60.01 - M60.15)
 */

export type EmailProviderType =
  | 'GOOGLE'
  | 'MICROSOFT'
  | 'YAHOO'
  | 'ZOHO'
  | 'ICLOUD'
  | 'IMAP_SMTP'
  | 'CUSTOM';

export type AuthMethodType =
  | 'OAUTH2'
  | 'APP_PASSWORD'
  | 'PASSWORD'
  | 'TOKEN';

export type ConnectorConnectionStatus =
  | 'CONFIGURED_UNVERIFIED'
  | 'OAUTH_PENDING'
  | 'OAUTH_AUTHORIZED'
  | 'CONNECTED'
  | 'AUTHENTICATION_FAILED'
  | 'REVOKED'
  | 'DISCONNECTED'
  | 'TOKEN_EXPIRED'
  | 'BLOCKED_EXTERNAL'
  | 'ERROR';

export type ConnectorHealthStatus =
  | 'HEALTHY'
  | 'DEGRADED'
  | 'DISCONNECTED'
  | 'REVOKED'
  | 'ERROR'
  | 'UNTESTED'
  | 'BLOCKED_EXTERNAL';

export type ConnectorSyncStatus =
  | 'SYNC_IDLE'
  | 'SYNCING'
  | 'SYNC_COMPLETE'
  | 'SYNC_FAILED'
  | 'FIXTURE_VERIFIED';

export type ConnectorSendingPermission =
  | 'DISARMED_STAGING'
  | 'AUTHORIZED_PILOT'
  | 'LIVE_AUTHORIZED'
  | 'DISABLED';

export interface ProviderCapabilities {
  supportsOAuth: boolean;
  supportsImap: boolean;
  supportsSmtp: boolean;
  supportsApiSending: boolean;
  supportsFolderSync: boolean;
  supportsThreading: boolean;
  supportsPushNotifications: boolean;
  supportsDeltaSync: boolean;
  supportsDraftStorage: boolean;
  supportsAttachments: boolean;
  supportsReadReceipts: boolean;
  supportsSentFolderAccess: boolean;
  supportsTokenRefresh: boolean;
  supportsDelegatedAccess: boolean;
  supportedAuthMethods: AuthMethodType[];
  maxAttachmentSizeBytes: number;
}

export interface EmailProviderDescriptor {
  id: EmailProviderType;
  name: string;
  description: string;
  category: 'CLOUD_SUITE' | 'CONSUMER_WEBMAIL' | 'STANDARDS_BASED';
  badgeColor: string;
  recommendedAuthMethod: AuthMethodType;
  supportedAuthMethods: AuthMethodType[];
  defaultImapHost?: string;
  defaultImapPort?: number;
  defaultSmtpHost?: string;
  defaultSmtpPort?: number;
  requiresAppPassword?: boolean;
  documentationUrl?: string;
  capabilities: ProviderCapabilities;
}

export interface ConnectionResult {
  success: boolean;
  connectionId: string;
  provider: EmailProviderType;
  mailboxEmail: string;
  status: ConnectorConnectionStatus;
  details?: string;
  authenticatedAt?: string;
  expiresAt?: string;
  error?: string;
}

export interface ConnectionHealth {
  connectionId: string;
  provider: EmailProviderType;
  mailboxEmail: string;
  healthy: boolean;
  status: ConnectorHealthStatus;
  roundTripLatencyMs: number;
  lastCheckedAt: string;
  tlsVersion?: string;
  cipherSuite?: string;
  dnsResolution: 'RESOLVED_OK' | 'DNS_ERROR' | 'MOCK_RESOLVED';
  quotaUnitsRemaining?: number;
  error?: string;
  diagnosticsDetail?: string;
}

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

export interface DraftMessage {
  connectionId: string;
  inReplyToMessageId?: string;
  threadId?: string;
  recipientEmails: string[];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  attachments?: Array<{ filename: string; sizeBytes: number; mimeType: string }>;
}

export interface DraftResult {
  success: boolean;
  draftId: string;
  providerDraftId?: string;
  version: number;
  createdAt: string;
  error?: string;
}

export interface ApprovedMessage {
  id: string;
  connectionId: string;
  senderAccount: string;
  recipientEmails: string[];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  idempotencyKey: string;
  approvedByUserId: string;
  approvedByName: string;
  approvedAt: string;
  approvalVersion: number;
  deliveryState: string;
}

export interface SendResult {
  success: boolean;
  dispatchId: string;
  providerMessageId?: string;
  deliveryState:
    | 'STAGED'
    | 'APPROVED'
    | 'QUEUED'
    | 'PROVIDER_ACCEPTED'
    | 'DELIVERY_CONFIRMED'
    | 'FAILED'
    | 'CANCELLED'
    | 'RECONCILIATION_REQUIRED';
  dispatchedAt: string;
  error?: string;
}

export interface EmailConnector {
  provider: EmailProviderType;
  connect(credentials?: Record<string, unknown>): Promise<ConnectionResult>;
  disconnect(): Promise<void>;
  verifyConnection(): Promise<ConnectionHealth>;
  listFolders(): Promise<NormalizedEmailFolder[]>;
  listMessages(options: SyncOptions): Promise<NormalizedEmailMessage[]>;
  getMessage(messageId: string): Promise<NormalizedEmailMessage>;
  synchronize(options: SyncOptions): Promise<SyncResult>;
  createDraft(message: DraftMessage): Promise<DraftResult>;
  sendApprovedMessage(message: ApprovedMessage): Promise<SendResult>;
  getCapabilities(): Promise<ProviderCapabilities>;
}

export interface EmailConnectionRecord {
  id: string;
  emailAddress: string;
  provider: EmailProviderType;
  displayName: string;
  accountOwner: string;
  department: string;
  authMethod: AuthMethodType;
  authStatus: ConnectorConnectionStatus;
  connectionHealth: ConnectorHealthStatus;
  lastSyncAt: string | null;
  lastError: string | null;
  incomingMessageCount: number;
  sendingPermission: ConnectorSendingPermission;
  syncStatus: ConnectorSyncStatus;
  folders: string[];
  isInstitutionalMailbox: boolean;
  safeguardingClassification: 'GENERAL' | 'RESTRICTED' | 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP';
  syncCursor?: string;
  cursorType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderDiscoveryResult {
  emailAddress: string;
  domain: string;
  detectedProvider: EmailProviderType;
  confidenceScore: number;
  detectionReason: string;
  suggestedAuthMethod: AuthMethodType;
  suggestedSettings?: {
    imapHost?: string;
    imapPort?: number;
    smtpHost?: string;
    smtpPort?: number;
    useSsl?: boolean;
    useStartTls?: boolean;
  };
}

export interface ConnectorWizardState {
  currentStep: number;
  emailAddress: string;
  selectedProvider: EmailProviderType;
  authMethod: AuthMethodType;
  credentials: Record<string, unknown>;
  syncPreferences: {
    selectedFolders: string[];
    historicalImportPeriod: 'ALL' | 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'LAST_1_YEAR';
    syncFrequencyMinutes: number;
    departmentAssignment: string;
    mailboxOwner: string;
    safeguardingClassification: 'GENERAL' | 'RESTRICTED' | 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP';
  };
  verificationResult?: ConnectionHealth;
  isComplete: boolean;
}

export interface EmailConnectionAuditEvent {
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
    | 'SAFEGUARDING_ACCESSED'
    | 'SETTINGS_UPDATED';
  actorName: string;
  actorRole: string;
  timestamp: string;
  details: string;
  status: 'success' | 'warning' | 'error';
}
