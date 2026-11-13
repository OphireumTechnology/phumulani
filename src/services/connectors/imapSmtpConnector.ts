/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Standards-Based IMAP / SMTP Connector Adapter
 * Delegates to the production ImapFlow + Nodemailer connector implementation in src/email/connectors/ImapSmtpConnector.ts.
 */

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
  ImapSmtpConnector as ProductionImapSmtpConnector,
  ImapSmtpExtendedConfig,
} from '../../email/connectors/ImapSmtpConnector';

export class ImapSmtpConnector implements EmailConnector {
  public readonly provider: EmailProviderType;
  private mailboxEmail: string;
  private delegate: ProductionImapSmtpConnector;

  constructor(
    mailboxEmail: string,
    provider: EmailProviderType = 'IMAP_SMTP',
    customSettings?: {
      imapHost?: string;
      imapPort?: number;
      imapSecurity?: 'TLS' | 'STARTTLS';
      smtpHost?: string;
      smtpPort?: number;
      smtpSecurity?: 'TLS' | 'STARTTLS';
      tlsCa?: string;
      allowLoopbackForTesting?: boolean;
      skipSmtpVerifyForImapOnly?: boolean;
    }
  ) {
    this.mailboxEmail = mailboxEmail;
    this.provider = provider;

    const descriptor = PROVIDER_DESCRIPTORS[provider] || PROVIDER_DESCRIPTORS.IMAP_SMTP;
    const imapHost =
      customSettings?.imapHost || descriptor.defaultImapHost || `imap.${mailboxEmail.split('@')[1] || 'domain.org'}`;
    const imapPort = customSettings?.imapPort || descriptor.defaultImapPort || 993;
    const smtpHost =
      customSettings?.smtpHost || descriptor.defaultSmtpHost || `smtp.${mailboxEmail.split('@')[1] || 'domain.org'}`;
    const smtpPort = customSettings?.smtpPort || descriptor.defaultSmtpPort || 587;
    const connectionId = `conn-${this.provider.toLowerCase()}-${this.mailboxEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const cfg: ImapSmtpExtendedConfig = {
      emailAddress: mailboxEmail,
      imapHost,
      imapPort,
      imapSecurity: customSettings?.imapSecurity || (imapPort === 993 ? 'TLS' : 'STARTTLS'),
      smtpHost,
      smtpPort,
      smtpSecurity: customSettings?.smtpSecurity || (smtpPort === 465 ? 'TLS' : 'STARTTLS'),
      tlsCa: customSettings?.tlsCa,
      allowLoopbackForTesting: customSettings?.allowLoopbackForTesting,
      skipSmtpVerifyForImapOnly: customSettings?.skipSmtpVerifyForImapOnly,
    };

    this.delegate = new ProductionImapSmtpConnector(connectionId, cfg, provider as any);
  }

  public async connect(credentials?: Record<string, unknown>): Promise<ConnectionResult> {
    const res = await this.delegate.connect(credentials);
    return res as unknown as ConnectionResult;
  }

  public async disconnect(): Promise<void> {
    await this.delegate.disconnect();
  }

  public async verifyConnection(): Promise<ConnectionHealth> {
    const res = await this.delegate.verifyConnection();
    return res as unknown as ConnectionHealth;
  }

  public async listFolders(): Promise<NormalizedEmailFolder[]> {
    const folders = await this.delegate.listFolders();
    return folders as unknown as NormalizedEmailFolder[];
  }

  public sanitizeHtml(rawHtml: string): string {
    return this.delegate.sanitizeHtml(rawHtml);
  }

  public async listMessages(options: SyncOptions): Promise<NormalizedEmailMessage[]> {
    const page = await this.delegate.listMessages({
      folder: options.folders?.[0],
      limit: options.maxMessages || 25,
    });
    return page.messages as unknown as NormalizedEmailMessage[];
  }

  public async getMessage(messageId: string): Promise<NormalizedEmailMessage> {
    const msg = await this.delegate.getMessage(messageId);
    return msg as unknown as NormalizedEmailMessage;
  }

  public async synchronize(options: SyncOptions): Promise<SyncResult> {
    const res = await this.delegate.syncMessages({
      cursor: options.cursor,
      folders: options.folders,
      maxMessages: options.maxMessages,
    });
    return {
      ...(res as any),
      connectionId: options.connectionId || res.connectionId,
    };
  }

  public async createDraft(message: DraftMessage): Promise<DraftResult> {
    if (this.mailboxEmail.toLowerCase().includes('safeguarding')) {
      if (message.bodyText.includes('AUTOMATED_AI_AGENT')) {
        throw new Error('SAFEGUARDING_AIR_GAP_VIOLATION: General AI agents cannot draft confidential safeguarding communications.');
      }
    }
    return this.delegate.saveDraft(message as any);
  }

  public async sendApprovedMessage(message: ApprovedMessage): Promise<SendResult> {
    if (message.approvedByUserId.startsWith('ai-') || message.approvedByName.toLowerCase().includes('agent')) {
      return {
        success: false,
        dispatchId: `disp-err-${Date.now()}`,
        deliveryState: 'FAILED',
        dispatchedAt: new Date().toISOString(),
        error: 'POLICY_VIOLATION: AI agents cannot approve outgoing email dispatches. Human executive approval required.',
      };
    }

    if (this.mailboxEmail.toLowerCase().includes('safeguarding')) {
      if (!message.approvedByName.toLowerCase().includes('safeguarding') && !message.approvedByName.toLowerCase().includes('director')) {
        throw new Error('SAFEGUARDING_AIR_GAP_VIOLATION: Only designated safeguarding officers can approve safeguarding dispatches.');
      }
    }

    const res = await this.delegate.sendMessage({
      id: message.id,
      connectionId: message.connectionId,
      senderAccount: message.senderAccount,
      to: message.recipientEmails,
      subject: message.subject,
      bodyText: message.bodyText,
      bodyHtml: message.bodyHtml,
      idempotencyKey: message.idempotencyKey,
      approvalRecordId: message.id || `apr-${Date.now()}`,
      approvedByUserId: message.approvedByUserId,
      approvedByName: message.approvedByName,
      approvedAt: message.approvedAt,
      approvalVersion: message.approvalVersion,
      deliveryState: message.deliveryState as any,
    });
    return res as unknown as SendResult;
  }

  public async markRead(messageId: string, read: boolean): Promise<void> {
    await this.delegate.markRead(messageId, read);
  }

  public async moveMessage(messageId: string, destinationFolder: string): Promise<void> {
    await this.delegate.moveMessage(messageId, destinationFolder);
  }

  public async getCapabilities(): Promise<ProviderCapabilities> {
    const descriptor = PROVIDER_DESCRIPTORS[this.provider] || PROVIDER_DESCRIPTORS.IMAP_SMTP;
    return descriptor.capabilities;
  }
}
