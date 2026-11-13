/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Real-Time Email Synchronization Engine (Phase 62)
 * Grounded in Section 9 of Phase 62 Directive:
 * Multi-account sync with cursor checkpointing, concurrency locking, and restart durability.
 */

import { connectorRegistry } from '../connectors/ConnectorRegistry';
import { SyncResult, SyncOptions } from '../types';
import { PostgresPersistenceAdapter } from '../../services/postgresPersistenceAdapter';

export class EmailSyncService {
  private static instance: EmailSyncService;
  private activeSyncLocks: Set<string> = new Set();
  private cursors: Map<string, string> = new Map();
  private dbAdapter: PostgresPersistenceAdapter;

  private constructor() {
    this.dbAdapter = PostgresPersistenceAdapter.getInstance();
  }

  public static getInstance(): EmailSyncService {
    if (!EmailSyncService.instance) {
      EmailSyncService.instance = new EmailSyncService();
    }
    return EmailSyncService.instance;
  }

  /**
   * Acquire a concurrency lock for a mailbox
   */
  public async acquireSyncLock(mailboxId: string, _workerId?: string): Promise<boolean> {
    if (this.activeSyncLocks.has(mailboxId)) {
      return false;
    }
    this.activeSyncLocks.add(mailboxId);
    return true;
  }

  /**
   * Release a concurrency lock for a mailbox
   */
  public async releaseSyncLock(mailboxId: string, _workerId?: string): Promise<boolean> {
    return this.activeSyncLocks.delete(mailboxId);
  }

  /**
   * Persist a synchronization cursor both in-memory and in durable storage
   */
  public async saveCursor(mailboxId: string, folder: string, cursor: string): Promise<void> {
    const key = `${mailboxId}:${folder}`;
    this.cursors.set(key, cursor);
    await this.dbAdapter.insertDurableWithRetry(
      'email_sync_cursors',
      {
        id: key,
        mailboxId,
        folder,
        cursor,
        updatedAt: new Date().toISOString(),
      },
      { context: 'EmailSyncService:saveCursor' }
    );
  }

  /**
   * Retrieve a persisted synchronization cursor (falling back to durable storage on cold start)
   */
  public async getCursor(mailboxId: string, folder: string): Promise<string | null> {
    const key = `${mailboxId}:${folder}`;
    const cached = this.cursors.get(key);
    if (cached) return cached;

    try {
      const rows = await this.dbAdapter.select<{ id: string; cursor?: string }>(
        'email_sync_cursors',
        (r) => r.id === key
      );
      const storedCursor = rows[0]?.cursor || null;
      if (storedCursor) {
        this.cursors.set(key, storedCursor);
      }
      return storedCursor;
    } catch {
      return null;
    }
  }

  /**
   * Synchronize a mailbox with concurrency locking to prevent concurrent sync races
   */
  public async syncMailbox(param: string | SyncOptions, options?: any): Promise<SyncResult & { syncedCount: number }> {
    const opts: SyncOptions = typeof param === 'string'
      ? { connectionId: param, mailboxEmail: options?.email || 'donations@phumulani.org', ...(options || {}) }
      : param;

    const lockKey = opts.connectionId;

    if (this.activeSyncLocks.has(lockKey)) {
      return {
        success: false,
        connectionId: opts.connectionId,
        provider: 'GOOGLE',
        mailboxEmail: opts.mailboxEmail,
        messagesImported: 0,
        duplicatesSkipped: 0,
        threadsReconstructed: 0,
        newCursor: opts.cursor || '',
        cursorType: 'GENERIC_TIMESTAMP',
        checkpointId: '',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error: `CONCURRENT_SYNC_LOCKED: Mailbox ${opts.mailboxEmail} is already actively synchronizing.`,
        syncedCount: 0,
      };
    }

    this.activeSyncLocks.add(lockKey);

    try {
      // Delegate to UniversalSyncEngine via connectorRegistry
      const result = await (connectorRegistry as any).syncConnection(opts.connectionId, {
        folders: opts.folders,
        maxMessages: opts.maxMessages || 50,
        sinceTimestamp: opts.sinceTimestamp,
      });

      return {
        ...result,
        syncedCount: result.messagesImported,
      };
    } finally {
      this.activeSyncLocks.delete(lockKey);
    }
  }

  /**
   * Perform synchronization across all active institutional mailboxes
   */
  public async syncAllActiveMailboxes(): Promise<SyncResult[]> {
    const connections = connectorRegistry.getAllConnections();
    const active = connections.filter(
      (c) => c.authStatus === 'CONNECTED' || c.authStatus === 'AUTHORIZED'
    );

    const results: SyncResult[] = [];
    for (const conn of active) {
      const res = await this.syncMailbox({
        connectionId: conn.id,
        mailboxEmail: conn.emailAddress,
      });
      results.push(res);
    }

    return results;
  }

  /**
   * Check if a mailbox has an active synchronization lock
   */
  public isLocked(connectionId: string): boolean {
    return this.activeSyncLocks.has(connectionId);
  }
}

export const emailSyncService = EmailSyncService.getInstance();
