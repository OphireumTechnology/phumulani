/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 62 Email Connection Types
 */

import {
  EmailProviderType,
  AuthMethodType,
  ConnectorConnectionStatus,
  ConnectorHealthStatus,
  ConnectorSyncStatus,
  ConnectorSendingPermission,
} from './EmailProvider';
import { NormalizedEmailFolder } from './EmailMessage';

export interface ImapSmtpConfiguration {
  emailAddress: string;
  displayName: string;
  imapHost: string;
  imapPort: number;
  imapSecurity: 'TLS' | 'STARTTLS';
  smtpHost: string;
  smtpPort: number;
  smtpSecurity: 'TLS' | 'STARTTLS';
  authentication: 'OAUTH2' | 'APP_PASSWORD' | 'PROVIDER_SUPPORTED_PASSWORD' | 'PASSWORD';
  enabled: boolean;
}

export interface RegisteredMailbox {
  id: string;
  emailAddress: string;
  displayName: string;
  providerType: EmailProviderType;
  departmentId: string;
  ownerUserId: string;
  accessClassification: 'GENERAL' | 'RESTRICTED' | 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP';
  connectionStatus: ConnectorConnectionStatus;
  inboundStatus: 'ACTIVE' | 'PAUSED' | 'AUTHORIZATION_REQUIRED' | 'DISCONNECTED';
  outboundStatus: 'DISARMED_STAGING' | 'AUTHORIZED_PILOT' | 'LIVE_AUTHORIZED' | 'DISABLED';
  lastSuccessfulSyncAt?: string;
  lastConnectionCheckAt?: string;
  createdAt: string;
  updatedAt: string;
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

export interface ProviderEvidenceRecord {
  state: ConnectorConnectionStatus;
  timestamp: string;
  roundTripLatencyMs: number;
  tlsVersion: string;
  cipherSuite: string;
  dnsResolution: 'RESOLVED_OK' | 'DNS_ERROR' | 'MOCK_RESOLVED';
  tokenExpiryIso?: string;
  diagnosticsDetail: string;
  rawVerificationEvidence?: Record<string, unknown>;
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
  lastSuccessfulSyncAt?: string | null;
  lastError: string | null;
  incomingMessageCount: number;
  outgoingMessageCount?: number;
  syncFailureCount?: number;
  credentialExpiresAt?: string | null;
  credentialWarning?: boolean;
  sendingPermission: ConnectorSendingPermission;
  syncStatus: ConnectorSyncStatus;
  folders: string[];
  folderInspection?: NormalizedEmailFolder[];
  isInstitutionalMailbox: boolean;
  safeguardingClassification: 'GENERAL' | 'RESTRICTED' | 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP';
  syncCursor?: string;
  cursorType?: string;
  evidenceHistory?: ProviderEvidenceRecord[];
  currentEvidence?: ProviderEvidenceRecord;
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
