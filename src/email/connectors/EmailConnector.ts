/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Universal Email Connector Contract (Phase 62)
 */

import {
  EmailProviderType,
  ConnectionResult,
  ConnectionHealth,
  NormalizedEmailFolder,
  NormalizedEmailMessage,
  MessageQueryOptions,
  EmailMessagePage,
  SyncResult,
  EmailDraft,
  DraftResult,
  ApprovedOutboundMessage,
  SendResult,
  ProviderCapabilities,
} from '../types';

export interface EmailConnector {
  readonly provider: EmailProviderType;
  readonly providerType?: EmailProviderType;

  /**
   * Initialize and authenticate connection with provider
   */
  connect(credentials?: Record<string, unknown>): Promise<ConnectionResult>;

  /**
   * Verify provider health, TLS cipher, latency, and token status
   */
  verifyConnection(): Promise<ConnectionHealth>;

  /**
   * Test connection health and TLS status
   */
  testConnection?(): Promise<ConnectionHealth & { isHealthy: boolean; tlsVerified: boolean }>;

  /**
   * Enumerate available provider folders (Inbox, Sent, Drafts, etc.)
   */
  listFolders(): Promise<NormalizedEmailFolder[]>;

  /**
   * List paginated messages matching query parameters
   */
  listMessages(options: MessageQueryOptions): Promise<EmailMessagePage>;

  /**
   * Retrieve a single email message by provider or normalized message ID
   */
  getMessage(providerMessageId: string): Promise<NormalizedEmailMessage>;

  /**
   * Synchronize messages starting from cursor checkpoint
   */
  syncMessages(cursor?: any, options?: any): Promise<SyncResult & { messages?: any[] }>;

  /**
   * Transmit a human-approved outbound email message with idempotency
   */
  sendMessage(message: ApprovedOutboundMessage): Promise<SendResult>;

  /**
   * Store an editable email draft
   */
  saveDraft(message: EmailDraft): Promise<DraftResult>;

  /**
   * Update message read/unread flag in provider
   */
  markRead(messageId: string, read: boolean): Promise<void>;

  /**
   * Move message between folders
   */
  moveMessage(messageId: string, destinationFolder: string): Promise<void>;

  /**
   * Disconnect and clear active tokens or sessions
   */
  disconnect(): Promise<void>;

  /**
   * Return feature capability matrix for this provider
   */
  getCapabilities(): any;
}
