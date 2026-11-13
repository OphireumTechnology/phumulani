/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 62 Universal Email Provider Types
 */

export type EmailProviderType =
  | 'GOOGLE'
  | 'MICROSOFT'
  | 'YAHOO'
  | 'ZOHO'
  | 'ICLOUD'
  | 'IMAP_SMTP'
  | 'CUSTOM';

export const EmailProviderType = {
  GOOGLE_WORKSPACE: 'GOOGLE' as EmailProviderType,
  MICROSOFT_365: 'MICROSOFT' as EmailProviderType,
  YAHOO_MAIL: 'YAHOO' as EmailProviderType,
  ZOHO_MAIL: 'ZOHO' as EmailProviderType,
  APPLE_ICLOUD: 'ICLOUD' as EmailProviderType,
  STANDARDS_IMAP_SMTP: 'IMAP_SMTP' as EmailProviderType,
  GOOGLE: 'GOOGLE' as EmailProviderType,
  MICROSOFT: 'MICROSOFT' as EmailProviderType,
  YAHOO: 'YAHOO' as EmailProviderType,
  ZOHO: 'ZOHO' as EmailProviderType,
  ICLOUD: 'ICLOUD' as EmailProviderType,
  IMAP_SMTP: 'IMAP_SMTP' as EmailProviderType,
  CUSTOM: 'CUSTOM' as EmailProviderType,
} as const;

export type AuthMethodType =
  | 'OAUTH2'
  | 'APP_PASSWORD'
  | 'PROVIDER_SUPPORTED_PASSWORD'
  | 'PASSWORD'
  | 'TOKEN';

export type ConnectorConnectionStatus =
  | 'NOT_CONFIGURED'
  | 'CONFIGURATION_REQUIRED'
  | 'AUTHORIZATION_REQUIRED'
  | 'AUTHORIZED'
  | 'CONNECTED'
  | 'CONNECTING'
  | 'SYNCHRONIZING'
  | 'CONNECTED_WITH_ERRORS'
  | 'TOKEN_EXPIRED'
  | 'REVOKED'
  | 'CONFIGURED_UNVERIFIED'
  | 'OAUTH_PENDING'
  | 'OAUTH_AUTHORIZED'
  | 'AUTHENTICATION_FAILED'
  | 'DISCONNECTED'
  | 'BLOCKED_EXTERNAL'
  | 'CONNECTION_ERROR'
  | 'ERROR';

export type ConnectorHealthStatus =
  | 'HEALTHY'
  | 'DEGRADED'
  | 'DISCONNECTED'
  | 'REVOKED'
  | 'ERROR'
  | 'AUTHENTICATION_FAILED'
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
