/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Centralized Universal Connector Registry
 * Grounded in Master Development Instruction Phase 60 (M60.01 - M60.15)
 */

import {
  EmailConnector,
  EmailConnectionRecord,
  EmailProviderType,
  ProviderDiscoveryResult,
  ConnectionHealth,
  SyncResult,
  ApprovedMessage,
  SendResult,
  EmailConnectionAuditEvent,
} from '../../types/emailConnectors';
import { PROVIDER_DESCRIPTORS } from './providerCapabilities';
import { GoogleConnector } from './googleConnector';
import { MicrosoftConnector } from './microsoftConnector';
import { ImapSmtpConnector } from './imapSmtpConnector';
import { universalSyncEngine } from './universalSyncEngine';

export class ConnectorRegistry {
  private static instance: ConnectorRegistry;
  private connections: Map<string, EmailConnectionRecord> = new Map();
  private connectors: Map<string, EmailConnector> = new Map();
  private credentialVault: Map<string, Record<string, unknown>> = new Map();
  private auditEvents: EmailConnectionAuditEvent[] = [];
  private idempotencyKeys: Map<string, { timestamp: number; result: SendResult }> = new Map();

  private constructor() {
    this.seedCanonicalConnections();
  }

  public static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  /**
   * Seed canonical mailboxes from Phase 55-59 so existing accounts are immediately
   * accessible in the universal connector framework.
   */
  private seedCanonicalConnections(): void {
    const canonicals: Array<{
      email: string;
      displayName: string;
      provider: EmailProviderType;
      owner: string;
      department: string;
      safeguarding: 'GENERAL' | 'RESTRICTED' | 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP';
    }> = [
      {
        email: 'info@phumulani.org',
        displayName: 'General Inquiries Mailbox',
        provider: 'GOOGLE',
        owner: 'Sipho Sithole (Operations Director)',
        department: 'Operations',
        safeguarding: 'GENERAL',
      },
      {
        email: 'director@phumulani.org',
        displayName: 'Executive Directorate Mailbox',
        provider: 'GOOGLE',
        owner: 'Dr. Zanele Khumalo (Executive Director)',
        department: 'Executive Governance',
        safeguarding: 'RESTRICTED',
      },
      {
        email: 'support@phumulani.org',
        displayName: 'Community Support Desk',
        provider: 'GOOGLE',
        owner: 'Lerato Dlamini (Senior Caseworker)',
        department: 'Social Welfare & Casework',
        safeguarding: 'RESTRICTED',
      },
      {
        email: 'safeguarding@phumulani.org',
        displayName: 'Confidential Safeguarding Air-Gapped Mailbox',
        provider: 'GOOGLE',
        owner: 'Nomsa Buthelezi (Designated Safeguarding Lead)',
        department: 'Child Protection & GBV Safeguarding',
        safeguarding: 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP',
      },
      {
        email: 'outreach@phumulani.org',
        displayName: 'Microsoft 365 Regional Outreach',
        provider: 'MICROSOFT',
        owner: 'Kagiso Molefe (Field Coordinator)',
        department: 'Field Outreach',
        safeguarding: 'GENERAL',
      },
      {
        email: 'relay@phumulani-community.org.za',
        displayName: 'Standards-Based Relay Dispatcher',
        provider: 'IMAP_SMTP',
        owner: 'IT Systems Relay Daemon',
        department: 'IT Infrastructure',
        safeguarding: 'GENERAL',
      },
    ];

    for (const c of canonicals) {
      const id = `conn-${c.provider.toLowerCase()}-${c.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const record: EmailConnectionRecord = {
        id,
        emailAddress: c.email,
        provider: c.provider,
        displayName: c.displayName,
        accountOwner: c.owner,
        department: c.department,
        authMethod: c.provider === 'GOOGLE' || c.provider === 'MICROSOFT' ? 'OAUTH2' : 'PASSWORD',
        authStatus: 'CONNECTED',
        connectionHealth: 'HEALTHY',
        lastSyncAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        lastError: null,
        incomingMessageCount: c.email.includes('safeguarding') ? 8 : 42,
        sendingPermission: 'DISARMED_STAGING',
        syncStatus: 'SYNC_COMPLETE',
        folders: ['INBOX', 'Sent', 'Drafts', 'Archive', 'Trash'],
        isInstitutionalMailbox: true,
        safeguardingClassification: c.safeguarding,
        syncCursor: c.provider === 'GOOGLE' ? '1004820' : c.provider === 'MICROSOFT' ? 'delta_91823' : 'UID:412',
        cursorType: c.provider === 'GOOGLE' ? 'GMAIL_HISTORY_ID' : c.provider === 'MICROSOFT' ? 'MS_GRAPH_DELTA_TOKEN' : 'IMAP_UID_SEQUENCE',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.connections.set(id, record);

      // Instantiate connector
      let connector: EmailConnector;
      if (c.provider === 'GOOGLE') {
        connector = new GoogleConnector(c.email);
      } else if (c.provider === 'MICROSOFT') {
        connector = new MicrosoftConnector(c.email);
      } else {
        connector = new ImapSmtpConnector(c.email, c.provider);
      }
      this.connectors.set(id, connector);
    }
  }

  /**
   * Automatic provider discovery engine based on domain and heuristics.
   */
  public discoverProvider(emailAddress: string): ProviderDiscoveryResult {
    const normalized = emailAddress.trim().toLowerCase();
    const domain = normalized.split('@')[1] || '';

    // 1. Google Gmail & Workspace
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      return {
        emailAddress: normalized,
        domain,
        detectedProvider: 'GOOGLE',
        confidenceScore: 0.99,
        detectionReason: 'Identified Google consumer webmail domain (gmail.com).',
        suggestedAuthMethod: 'OAUTH2',
      };
    }

    // 2. Microsoft Outlook, Hotmail, Live
    if (['outlook.com', 'hotmail.com', 'live.com', 'msn.com'].includes(domain)) {
      return {
        emailAddress: normalized,
        domain,
        detectedProvider: 'MICROSOFT',
        confidenceScore: 0.98,
        detectionReason: 'Identified Microsoft consumer webmail domain.',
        suggestedAuthMethod: 'OAUTH2',
      };
    }

    // 3. Yahoo Mail
    if (['yahoo.com', 'ymail.com', 'rocketmail.com'].includes(domain)) {
      return {
        emailAddress: normalized,
        domain,
        detectedProvider: 'YAHOO',
        confidenceScore: 0.97,
        detectionReason: 'Identified Yahoo Mail domain. Requires App-Specific Password.',
        suggestedAuthMethod: 'APP_PASSWORD',
        suggestedSettings: {
          imapHost: 'imap.mail.yahoo.com',
          imapPort: 993,
          smtpHost: 'smtp.mail.yahoo.com',
          smtpPort: 465,
          useSsl: true,
        },
      };
    }

    // 4. Zoho Mail
    if (['zoho.com', 'zohomail.com'].includes(domain)) {
      return {
        emailAddress: normalized,
        domain,
        detectedProvider: 'ZOHO',
        confidenceScore: 0.95,
        detectionReason: 'Identified Zoho Workplace/Mail domain.',
        suggestedAuthMethod: 'OAUTH2',
        suggestedSettings: {
          imapHost: 'imappro.zoho.com',
          imapPort: 993,
          smtpHost: 'smtppro.zoho.com',
          smtpPort: 465,
          useSsl: true,
        },
      };
    }

    // 5. Apple iCloud
    if (['icloud.com', 'me.com', 'mac.com'].includes(domain)) {
      return {
        emailAddress: normalized,
        domain,
        detectedProvider: 'ICLOUD',
        confidenceScore: 0.99,
        detectionReason: 'Identified Apple iCloud domain. Requires Apple App-Specific Password.',
        suggestedAuthMethod: 'APP_PASSWORD',
        suggestedSettings: {
          imapHost: 'imap.mail.me.com',
          imapPort: 993,
          smtpHost: 'smtp.mail.me.com',
          smtpPort: 587,
          useStartTls: true,
        },
      };
    }

    // 6. Phumulani Institutional Domain (Configured on Google Workspace)
    if (domain === 'phumulani.org') {
      return {
        emailAddress: normalized,
        domain,
        detectedProvider: 'GOOGLE',
        confidenceScore: 0.96,
        detectionReason: 'Primary institutional domain provisioned via Google Workspace enterprise tenant.',
        suggestedAuthMethod: 'OAUTH2',
      };
    }

    // 7. General Custom Domain fallback
    return {
      emailAddress: normalized,
      domain,
      detectedProvider: 'IMAP_SMTP',
      confidenceScore: 0.85,
      detectionReason: `Custom domain (${domain}). Using standards-based TLS IMAP/SMTP autodiscovery.`,
      suggestedAuthMethod: 'PASSWORD',
      suggestedSettings: {
        imapHost: `imap.${domain}`,
        imapPort: 993,
        smtpHost: `smtp.${domain}`,
        smtpPort: 587,
        useSsl: true,
        useStartTls: true,
      },
    };
  }

  /**
   * Register a new email connection.
   */
  public async registerConnection(
    record: Partial<EmailConnectionRecord> & { emailAddress: string; provider: EmailProviderType },
    credentials?: Record<string, unknown>
  ): Promise<EmailConnectionRecord> {
    const id = record.id || `conn-${record.provider.toLowerCase()}-${record.emailAddress.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now().toString(36)}`;
    const isSafeguarding =
      record.emailAddress.toLowerCase().includes('safeguarding') ||
      record.safeguardingClassification === 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP';

    const fullRecord: EmailConnectionRecord = {
      id,
      emailAddress: record.emailAddress,
      provider: record.provider,
      displayName: record.displayName || `${record.provider} Mailbox (${record.emailAddress})`,
      accountOwner: record.accountOwner || 'Designated Administrator',
      department: record.department || 'General Administration',
      authMethod: record.authMethod || PROVIDER_DESCRIPTORS[record.provider]?.recommendedAuthMethod || 'PASSWORD',
      authStatus: record.authStatus || 'CONFIGURED_UNVERIFIED',
      connectionHealth: 'HEALTHY',
      lastSyncAt: null,
      lastError: null,
      incomingMessageCount: 0,
      sendingPermission: 'DISARMED_STAGING',
      syncStatus: 'SYNC_IDLE',
      folders: ['INBOX', 'Sent', 'Drafts', 'Trash'],
      isInstitutionalMailbox: record.emailAddress.endsWith('@phumulani.org'),
      safeguardingClassification: isSafeguarding ? 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP' : (record.safeguardingClassification || 'GENERAL'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in credential vault
    if (credentials) {
      this.credentialVault.set(id, {
        ...credentials,
        storedAt: new Date().toISOString(),
      });
    }

    // Instantiate adapter
    let connector: EmailConnector;
    if (record.provider === 'GOOGLE') {
      connector = new GoogleConnector(record.emailAddress);
    } else if (record.provider === 'MICROSOFT') {
      connector = new MicrosoftConnector(record.emailAddress);
    } else {
      connector = new ImapSmtpConnector(record.emailAddress, record.provider);
    }

    // Connect adapter if credentials provided
    if (credentials) {
      const connRes = await connector.connect(credentials);
      fullRecord.authStatus = connRes.status;
    }

    this.connections.set(id, fullRecord);
    this.connectors.set(id, connector);

    this.logAuditEvent({
      id: `aud-${Date.now()}`,
      connectionId: id,
      mailboxEmail: record.emailAddress,
      provider: record.provider,
      action: 'ACCOUNT_CONNECTED',
      actorName: record.accountOwner || 'Administrator',
      actorRole: 'ADMINISTRATOR',
      timestamp: new Date().toISOString(),
      details: `Account registered: ${record.emailAddress} [Provider: ${record.provider}, Auth: ${fullRecord.authMethod}]`,
      status: 'success',
    });

    return fullRecord;
  }

  public getConnection(connectionId: string): EmailConnectionRecord | undefined {
    return this.connections.get(connectionId);
  }

  public listConnections(): EmailConnectionRecord[] {
    return Array.from(this.connections.values());
  }

  public updateConnection(
    connectionId: string,
    updates: Partial<EmailConnectionRecord>
  ): EmailConnectionRecord | undefined {
    const existing = this.connections.get(connectionId);
    if (!existing) return undefined;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.connections.set(connectionId, updated);
    return updated;
  }

  public async disconnectConnection(connectionId: string): Promise<boolean> {
    const existing = this.connections.get(connectionId);
    if (!existing) return false;

    const connector = this.connectors.get(connectionId);
    if (connector) {
      await connector.disconnect();
    }

    existing.authStatus = 'DISCONNECTED';
    existing.connectionHealth = 'DISCONNECTED';
    existing.updatedAt = new Date().toISOString();

    this.logAuditEvent({
      id: `aud-${Date.now()}`,
      connectionId,
      mailboxEmail: existing.emailAddress,
      provider: existing.provider,
      action: 'ACCOUNT_DISCONNECTED',
      actorName: 'Administrator',
      actorRole: 'ADMINISTRATOR',
      timestamp: new Date().toISOString(),
      details: `Account disconnected: ${existing.emailAddress}`,
      status: 'warning',
    });

    return true;
  }

  public async reconnectConnection(connectionId: string): Promise<boolean> {
    const existing = this.connections.get(connectionId);
    if (!existing) return false;

    const connector = this.connectors.get(connectionId);
    if (!connector) return false;

    const creds = this.credentialVault.get(connectionId);
    const connResult = await connector.connect(creds);

    existing.authStatus = connResult.status;
    existing.connectionHealth = connResult.success ? 'HEALTHY' : 'ERROR';
    existing.updatedAt = new Date().toISOString();

    this.logAuditEvent({
      id: `aud-${Date.now()}`,
      connectionId,
      mailboxEmail: existing.emailAddress,
      provider: existing.provider,
      action: 'ACCOUNT_RECONNECTED',
      actorName: 'Administrator',
      actorRole: 'ADMINISTRATOR',
      timestamp: new Date().toISOString(),
      details: `Account reconnected: ${existing.emailAddress} (Status: ${connResult.status})`,
      status: connResult.success ? 'success' : 'error',
    });

    return connResult.success;
  }

  public deleteConnection(connectionId: string): boolean {
    const existing = this.connections.get(connectionId);
    if (!existing) return false;

    this.connections.delete(connectionId);
    this.connectors.delete(connectionId);
    this.credentialVault.delete(connectionId);

    return true;
  }

  public getConnectorInstance(connectionId: string): EmailConnector | undefined {
    return this.connectors.get(connectionId);
  }

  public async verifyConnection(connectionId: string): Promise<ConnectionHealth> {
    const existing = this.connections.get(connectionId);
    const connector = this.connectors.get(connectionId);

    if (!existing || !connector) {
      return {
        connectionId,
        provider: 'CUSTOM',
        mailboxEmail: 'unknown',
        healthy: false,
        status: 'ERROR',
        roundTripLatencyMs: 0,
        lastCheckedAt: new Date().toISOString(),
        dnsResolution: 'DNS_ERROR',
        error: 'Connector instance not found for ID',
      };
    }

    const health = await connector.verifyConnection();
    existing.connectionHealth = health.status;
    existing.updatedAt = new Date().toISOString();

    this.logAuditEvent({
      id: `aud-${Date.now()}`,
      connectionId,
      mailboxEmail: existing.emailAddress,
      provider: existing.provider,
      action: 'CONNECTION_VERIFIED',
      actorName: 'HealthCheckDaemon',
      actorRole: 'SYSTEM_SCHEDULER',
      timestamp: new Date().toISOString(),
      details: `Health check: ${health.healthy ? 'HEALTHY' : 'DEGRADED'} (${health.roundTripLatencyMs}ms)`,
      status: health.healthy ? 'success' : 'error',
    });

    return health;
  }

  public async syncConnection(connectionId: string): Promise<SyncResult> {
    const existing = this.connections.get(connectionId);
    const connector = this.connectors.get(connectionId);

    if (!existing || !connector) {
      return {
        success: false,
        connectionId,
        provider: 'CUSTOM',
        mailboxEmail: 'unknown',
        messagesImported: 0,
        duplicatesSkipped: 0,
        threadsReconstructed: 0,
        newCursor: 'UNKNOWN',
        cursorType: 'GENERIC_TIMESTAMP',
        checkpointId: `chk-err-${Date.now()}`,
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error: 'Connector instance not found for sync',
      };
    }

    existing.syncStatus = 'SYNCING';
    const result = await universalSyncEngine.executeSync(connector, {
      connectionId,
      mailboxEmail: existing.emailAddress,
      cursor: existing.syncCursor,
    });

    if (result.success) {
      existing.syncStatus = 'SYNC_COMPLETE';
      existing.lastSyncAt = result.timestamp;
      existing.syncCursor = result.newCursor;
      existing.cursorType = result.cursorType;
      existing.incomingMessageCount += result.messagesImported;
    } else {
      existing.syncStatus = 'SYNC_FAILED';
      existing.lastError = result.error || 'Sync failed';
    }

    existing.updatedAt = new Date().toISOString();
    return result;
  }

  /**
   * Universal Outbound Delivery with Quad-Action approvals and idempotency protection.
   */
  public async dispatchApprovedMessage(message: ApprovedMessage): Promise<SendResult> {
    // 1. Idempotency Key Check (24-hour cache window)
    const cached = this.idempotencyKeys.get(message.idempotencyKey);
    if (cached && Date.now() - cached.timestamp < 24 * 3600 * 1000) {
      return cached.result;
    }

    // 2. Anti-AI Self-Approval Guard
    if (message.approvedByUserId.startsWith('ai-') || message.approvedByName.toLowerCase().includes('agent')) {
      return {
        success: false,
        dispatchId: `disp-err-${Date.now()}`,
        deliveryState: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        error: 'POLICY_VIOLATION: AI agents cannot approve outgoing email dispatches. Human executive approval required.',
      };
    }

    // 3. Safeguarding Air Gap Guard
    const connection = this.connections.get(message.connectionId);
    if (
      connection?.safeguardingClassification === 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP' ||
      message.senderAccount.toLowerCase().includes('safeguarding')
    ) {
      const approverLower = message.approvedByName.toLowerCase();
      if (!approverLower.includes('safeguarding') && !approverLower.includes('director')) {
        throw new Error('SAFEGUARDING_AIR_GAP_VIOLATION: Only designated safeguarding officers can approve safeguarding dispatches.');
      }
    }

    // 4. Delegate to connector
    const connector = this.connectors.get(message.connectionId);
    if (!connector) {
      return {
        success: false,
        dispatchId: `disp-err-${Date.now()}`,
        deliveryState: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        error: `Connector not found for connectionId: ${message.connectionId}`,
      };
    }

    const sendResult = await connector.sendApprovedMessage(message);

    // Cache idempotency result
    this.idempotencyKeys.set(message.idempotencyKey, {
      timestamp: Date.now(),
      result: sendResult,
    });

    this.logAuditEvent({
      id: `aud-${Date.now()}`,
      connectionId: message.connectionId,
      mailboxEmail: message.senderAccount,
      provider: connector.provider,
      action: 'DISPATCH_SENT',
      actorName: message.approvedByName,
      actorRole: 'EXECUTIVE_APPROVER',
      timestamp: new Date().toISOString(),
      details: `Dispatch completed. State: ${sendResult.deliveryState}, DispatchId: ${sendResult.dispatchId}`,
      status: sendResult.success ? 'success' : 'error',
    });

    return sendResult;
  }

  public getAuditEvents(connectionId?: string): EmailConnectionAuditEvent[] {
    if (!connectionId) return this.auditEvents;
    return this.auditEvents.filter((a) => a.connectionId === connectionId);
  }

  private logAuditEvent(event: EmailConnectionAuditEvent): void {
    this.auditEvents.unshift(event);
    if (this.auditEvents.length > 300) {
      this.auditEvents.length = 300;
    }
  }
}

export const connectorRegistry = ConnectorRegistry.getInstance();
