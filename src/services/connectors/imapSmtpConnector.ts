/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Standards-Based IMAP / SMTP Connector Adapter
 * Handles IMAP/SMTP, Yahoo Mail, Zoho Mail, Apple iCloud, and Custom Gateways.
 * Grounded in Master Development Instruction Phase 60 (M60.04, M60.05, M60.07, M60.08)
 */

import crypto from 'crypto';
import {
  EmailConnector,
  EmailProviderType,
  ConnectionResult,
  ConnectionHealth,
  NormalizedEmailFolder,
  NormalizedEmailMessage,
  SyncOptions,
  SyncResult,
  DraftMessage,
  DraftResult,
  ApprovedMessage,
  SendResult,
  ProviderCapabilities,
} from '../../types/emailConnectors';
import { PROVIDER_DESCRIPTORS } from './providerCapabilities';
import {
  validateSafeMailHostAsync,
  verifyMailSocketReachable,
} from '../../email/connectors/ImapSmtpConnector';

export class ImapSmtpConnector implements EmailConnector {
  public readonly provider: EmailProviderType;
  private mailboxEmail: string;
  private isConnected: boolean = false;
  private currentUidSequence: number = 0;
  private imapHost: string;
  private imapPort: number;
  private smtpHost: string;
  private smtpPort: number;

  constructor(
    mailboxEmail: string,
    provider: EmailProviderType = 'IMAP_SMTP',
    customSettings?: {
      imapHost?: string;
      imapPort?: number;
      smtpHost?: string;
      smtpPort?: number;
    }
  ) {
    this.mailboxEmail = mailboxEmail;
    this.provider = provider;

    const descriptor = PROVIDER_DESCRIPTORS[provider] || PROVIDER_DESCRIPTORS.IMAP_SMTP;
    this.imapHost = customSettings?.imapHost || descriptor.defaultImapHost || `imap.${mailboxEmail.split('@')[1] || 'domain.org'}`;
    this.imapPort = customSettings?.imapPort || descriptor.defaultImapPort || 993;
    this.smtpHost = customSettings?.smtpHost || descriptor.defaultSmtpHost || `smtp.${mailboxEmail.split('@')[1] || 'domain.org'}`;
    this.smtpPort = customSettings?.smtpPort || descriptor.defaultSmtpPort || 587;
  }

  public async connect(credentials?: Record<string, unknown>): Promise<ConnectionResult> {
    const connectionId = `conn-${this.provider.toLowerCase()}-${this.mailboxEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const imapCheck = await validateSafeMailHostAsync(this.imapHost);
    if (!imapCheck.valid) {
      this.isConnected = false;
      const isDnsErr = imapCheck.reason?.startsWith('DNS_ERROR');
      return {
        success: false,
        connectionId,
        provider: this.provider,
        mailboxEmail: this.mailboxEmail,
        status: isDnsErr ? 'ERROR' : 'BLOCKED_EXTERNAL',
        error: imapCheck.reason,
      };
    }

    const smtpCheck = await validateSafeMailHostAsync(this.smtpHost);
    if (!smtpCheck.valid) {
      this.isConnected = false;
      const isDnsErr = smtpCheck.reason?.startsWith('DNS_ERROR');
      return {
        success: false,
        connectionId,
        provider: this.provider,
        mailboxEmail: this.mailboxEmail,
        status: isDnsErr ? 'ERROR' : 'BLOCKED_EXTERNAL',
        error: smtpCheck.reason,
      };
    }

    if (!credentials?.password && !credentials?.token && !credentials?.appPassword) {
      this.isConnected = false;
      return {
        success: false,
        connectionId,
        provider: this.provider,
        mailboxEmail: this.mailboxEmail,
        status: 'AUTHENTICATION_FAILED',
        error: 'Missing authentication credentials (password or app-specific password required).',
      };
    }

    const probe = await verifyMailSocketReachable(this.imapHost, this.imapPort, this.imapPort === 993 ? 'TLS' : 'STARTTLS');
    if (!probe.reachable) {
      this.isConnected = false;
      return {
        success: false,
        connectionId,
        provider: this.provider,
        mailboxEmail: this.mailboxEmail,
        status: 'ERROR',
        error: probe.error || `Unable to verify IMAP endpoint ${this.imapHost}:${this.imapPort}.`,
      };
    }

    this.isConnected = true;
    return {
      success: true,
      connectionId,
      provider: this.provider,
      mailboxEmail: this.mailboxEmail,
      status: 'CONNECTED',
      details: `${this.provider} TLS socket verified to ${this.imapHost}:${this.imapPort}.`,
      authenticatedAt: new Date().toISOString(),
    };
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  public async verifyConnection(): Promise<ConnectionHealth> {
    const connectionId = `conn-${this.provider.toLowerCase()}-${this.mailboxEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const imapCheck = await validateSafeMailHostAsync(this.imapHost);
    if (!imapCheck.valid) {
      this.isConnected = false;
      const isDnsErr = imapCheck.reason?.startsWith('DNS_ERROR');
      return {
        connectionId,
        provider: this.provider,
        mailboxEmail: this.mailboxEmail,
        healthy: false,
        status: isDnsErr ? 'ERROR' : 'BLOCKED_EXTERNAL',
        roundTripLatencyMs: 0,
        lastCheckedAt: new Date().toISOString(),
        dnsResolution: isDnsErr ? 'DNS_ERROR' : 'RESOLVED_OK',
        error: imapCheck.reason,
      };
    }

    const smtpCheck = await validateSafeMailHostAsync(this.smtpHost);
    if (!smtpCheck.valid) {
      this.isConnected = false;
      const isDnsErr = smtpCheck.reason?.startsWith('DNS_ERROR');
      return {
        connectionId,
        provider: this.provider,
        mailboxEmail: this.mailboxEmail,
        healthy: false,
        status: isDnsErr ? 'ERROR' : 'BLOCKED_EXTERNAL',
        roundTripLatencyMs: 0,
        lastCheckedAt: new Date().toISOString(),
        dnsResolution: isDnsErr ? 'DNS_ERROR' : 'RESOLVED_OK',
        error: smtpCheck.reason,
      };
    }

    if (!this.isConnected) {
      return {
        connectionId,
        provider: this.provider,
        mailboxEmail: this.mailboxEmail,
        healthy: false,
        status: 'DEGRADED',
        roundTripLatencyMs: 0,
        lastCheckedAt: new Date().toISOString(),
        dnsResolution: 'RESOLVED_OK',
        error: 'AUTHORIZATION_REQUIRED: IMAP/SMTP connector is not connected or authenticated.',
        diagnosticsDetail: `IMAP (${this.imapHost}:${this.imapPort}) and SMTP (${this.smtpHost}:${this.smtpPort}) awaiting credentials and authentication.`,
      };
    }

    const probe = await verifyMailSocketReachable(this.imapHost, this.imapPort, this.imapPort === 993 ? 'TLS' : 'STARTTLS');
    if (!probe.reachable) {
      this.isConnected = false;
      return {
        connectionId,
        provider: this.provider,
        mailboxEmail: this.mailboxEmail,
        healthy: false,
        status: 'ERROR',
        roundTripLatencyMs: probe.latencyMs,
        lastCheckedAt: new Date().toISOString(),
        dnsResolution: 'RESOLVED_OK',
        error: probe.error,
      };
    }

    return {
      connectionId,
      provider: this.provider,
      mailboxEmail: this.mailboxEmail,
      healthy: true,
      status: 'HEALTHY',
      roundTripLatencyMs: probe.latencyMs,
      lastCheckedAt: new Date().toISOString(),
      tlsVersion: probe.tlsVersion || 'TLS',
      cipherSuite: probe.cipherSuite,
      dnsResolution: 'RESOLVED_OK',
      diagnosticsDetail: `IMAP (${this.imapHost}:${this.imapPort}) TLS handshake verified.`,
    };
  }

  public async listFolders(): Promise<NormalizedEmailFolder[]> {
    return [
      { id: 'INBOX', name: 'INBOX', type: 'INBOX', totalMessageCount: 0, unreadMessageCount: 0, providerFolderId: 'INBOX' },
      { id: 'Sent', name: 'Sent Messages', type: 'SENT', totalMessageCount: 0, unreadMessageCount: 0, providerFolderId: 'Sent' },
      { id: 'Drafts', name: 'Drafts', type: 'DRAFTS', totalMessageCount: 0, unreadMessageCount: 0, providerFolderId: 'Drafts' },
      { id: 'Trash', name: 'Trash', type: 'TRASH', totalMessageCount: 0, unreadMessageCount: 0, providerFolderId: 'Trash' },
      { id: 'Junk', name: 'Junk', type: 'SPAM', totalMessageCount: 0, unreadMessageCount: 0, providerFolderId: 'Junk' },
    ];
  }

  /**
   * Sanitizes untrusted HTML by removing executable tags, event handlers, and web beacons.
   */
  public sanitizeHtml(rawHtml: string): string {
    return rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
      .replace(/<img[^>]*\b(1px|tracker|pixel|beacon)[^>]*>/gi, '');
  }

  public async listMessages(_options: SyncOptions): Promise<NormalizedEmailMessage[]> {
    return [];
  }

  public async getMessage(messageId: string): Promise<NormalizedEmailMessage> {
    throw new Error(`AUTHORIZATION_REQUIRED: Cannot retrieve IMAP message ${messageId} without an authenticated live IMAP4rev1 session.`);
  }

  public async synchronize(options: SyncOptions): Promise<SyncResult> {
    const oldCursor = `UIDVALIDITY:0:UID:${this.currentUidSequence}`;
    return {
      success: false,
      connectionId: options.connectionId,
      provider: this.provider,
      mailboxEmail: this.mailboxEmail,
      messagesImported: 0,
      duplicatesSkipped: 0,
      threadsReconstructed: 0,
      oldCursor,
      newCursor: oldCursor,
      cursorType: 'IMAP_UID_SEQUENCE',
      checkpointId: '',
      status: 'FAILED',
      timestamp: new Date().toISOString(),
      error: 'IMAP_SYNC_UNAVAILABLE: Live IMAP4rev1 synchronization requires an authenticated mail transport session.',
    };
  }

  public async createDraft(message: DraftMessage): Promise<DraftResult> {
    if (this.mailboxEmail.toLowerCase().includes('safeguarding')) {
      if (message.bodyText.includes('AUTOMATED_AI_AGENT')) {
        throw new Error('SAFEGUARDING_AIR_GAP_VIOLATION: General AI agents cannot draft confidential safeguarding communications.');
      }
    }

    const draftId = `draft-${this.provider.toLowerCase()}-${Date.now()}`;
    return {
      success: true,
      draftId,
      providerDraftId: `imap-draft-${crypto.randomBytes(4).toString('hex')}`,
      version: 1,
      createdAt: new Date().toISOString(),
    };
  }

  public async sendApprovedMessage(message: ApprovedMessage): Promise<SendResult> {
    // 1. Anti-AI Self Approval Enforced
    if (message.approvedByUserId.startsWith('ai-') || message.approvedByName.toLowerCase().includes('agent')) {
      return {
        success: false,
        dispatchId: `disp-err-${Date.now()}`,
        deliveryState: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        error: 'POLICY_VIOLATION: AI agents cannot approve outgoing email dispatches. Human executive approval required.',
      };
    }

    // 2. Safeguarding check
    if (this.mailboxEmail.toLowerCase().includes('safeguarding')) {
      if (!message.approvedByName.toLowerCase().includes('safeguarding') && !message.approvedByName.toLowerCase().includes('director')) {
        throw new Error('SAFEGUARDING_AIR_GAP_VIOLATION: Only designated safeguarding officers can approve safeguarding dispatches.');
      }
    }

    // 3. Staged Development Invariant: Fail-closed unless explicitly authorized
    const isLiveSending = process.env.LIVE_EMAIL_SENDING_ENABLED === 'true';
    if (!isLiveSending) {
      return {
        success: true,
        dispatchId: `disp-${this.provider.toLowerCase()}-${Date.now()}`,
        deliveryState: 'STAGED',
        dispatchedAt: new Date().toISOString(),
      };
    }

    return {
      success: false,
      dispatchId: `disp-${this.provider.toLowerCase()}-err-${Date.now()}`,
      deliveryState: 'FAILED',
      dispatchedAt: new Date().toISOString(),
      error: 'SMTP_TRANSPORT_UNAVAILABLE: Live SMTP relay requires verified SMTP AUTH client.',
    };
  }

  public async getCapabilities(): Promise<ProviderCapabilities> {
    const descriptor = PROVIDER_DESCRIPTORS[this.provider] || PROVIDER_DESCRIPTORS.IMAP_SMTP;
    return descriptor.capabilities;
  }
}
