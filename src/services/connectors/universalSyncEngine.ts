/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Universal Inbound Synchronization Engine
 * Grounded in Master Development Instruction Phase 60 (M60.07, M60.10)
 */

import {
  SyncOptions,
  SyncResult,
  NormalizedEmailMessage,
  EmailConnectionAuditEvent,
} from '../../types/emailConnectors';
import { EmailConnector } from '../../types/emailConnectors';

export interface SyncCheckpointRecord {
  checkpointId: string;
  connectionId: string;
  mailboxEmail: string;
  cursorType: 'GMAIL_HISTORY_ID' | 'MS_GRAPH_DELTA_TOKEN' | 'IMAP_UID_SEQUENCE' | 'GENERIC_TIMESTAMP';
  cursorValue: string;
  previousCursorValue?: string;
  messagesProcessed: number;
  duplicatesSkipped: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'ROLLED_BACK';
  timestamp: string;
}

export class UniversalSyncEngine {
  private static instance: UniversalSyncEngine;
  private checkpoints: Map<string, SyncCheckpointRecord[]> = new Map();
  private processedMessageIds: Set<string> = new Set();
  private auditLogs: EmailConnectionAuditEvent[] = [];

  private constructor() {}

  public static getInstance(): UniversalSyncEngine {
    if (!UniversalSyncEngine.instance) {
      UniversalSyncEngine.instance = new UniversalSyncEngine();
    }
    return UniversalSyncEngine.instance;
  }

  /**
   * Executes synchronization using the appropriate connector and handles
   * deduplication, cursor management, and checkpointing.
   */
  public async executeSync(
    connector: EmailConnector,
    options: SyncOptions
  ): Promise<SyncResult> {
    const { connectionId, mailboxEmail } = options;

    try {
      // 1. Fetch raw messages from connector
      const messages = await connector.listMessages(options);

      // 2. Perform deduplication
      let newCount = 0;
      let dupCount = 0;
      const deduplicated: NormalizedEmailMessage[] = [];

      for (const msg of messages) {
        const dedupeKey = `${connector.provider}:${msg.providerMessageId}`;
        if (this.processedMessageIds.has(dedupeKey)) {
          dupCount++;
        } else {
          this.processedMessageIds.add(dedupeKey);
          deduplicated.push(msg);
          newCount++;
        }
      }

      // 3. Delegate to connector synchronize for cursor advancement
      const syncResult = await connector.synchronize(options);

      // 4. Record Checkpoint
      const checkpoint: SyncCheckpointRecord = {
        checkpointId: syncResult.checkpointId,
        connectionId,
        mailboxEmail,
        cursorType: syncResult.cursorType,
        cursorValue: syncResult.newCursor,
        previousCursorValue: syncResult.oldCursor,
        messagesProcessed: newCount,
        duplicatesSkipped: dupCount,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
      };

      const history = this.checkpoints.get(connectionId) || [];
      history.unshift(checkpoint);
      if (history.length > 50) history.length = 50;
      this.checkpoints.set(connectionId, history);

      // 5. Audit Event
      this.auditLogs.unshift({
        id: `aud-sync-${Date.now()}`,
        connectionId,
        mailboxEmail,
        provider: connector.provider,
        action: 'SYNC_CHECKPOINT_CREATED',
        actorName: 'UniversalSyncDaemon',
        actorRole: 'SYSTEM_SCHEDULER',
        timestamp: new Date().toISOString(),
        details: `Sync completed: ${newCount} imported, ${dupCount} duplicates skipped. Cursor: ${syncResult.newCursor}`,
        status: 'success',
      });

      return {
        ...syncResult,
        messagesImported: newCount,
        duplicatesSkipped: dupCount,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      this.auditLogs.unshift({
        id: `aud-sync-err-${Date.now()}`,
        connectionId,
        mailboxEmail,
        provider: connector.provider,
        action: 'SYNC_CHECKPOINT_CREATED',
        actorName: 'UniversalSyncDaemon',
        actorRole: 'SYSTEM_SCHEDULER',
        timestamp: new Date().toISOString(),
        details: `Sync failure: ${errorMessage}`,
        status: 'error',
      });

      return {
        success: false,
        connectionId,
        provider: connector.provider,
        mailboxEmail,
        messagesImported: 0,
        duplicatesSkipped: 0,
        threadsReconstructed: 0,
        newCursor: options.cursor || 'INITIAL_CURSOR',
        cursorType: 'GENERIC_TIMESTAMP',
        checkpointId: `chk-err-${Date.now()}`,
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error: errorMessage,
      };
    }
  }

  /**
   * Recovers cursor to previous checkpoint in case of sync degradation or corruption.
   */
  public rollbackCursor(connectionId: string): SyncCheckpointRecord | null {
    const history = this.checkpoints.get(connectionId);
    if (!history || history.length < 2) return null;

    // Latest checkpoint failed or corrupted, pop it and revert to prior
    const current = history.shift()!;
    current.status = 'ROLLED_BACK';
    const prior = history[0];

    this.auditLogs.unshift({
      id: `aud-rollback-${Date.now()}`,
      connectionId,
      mailboxEmail: current.mailboxEmail,
      provider: 'CUSTOM',
      action: 'CURSOR_RECOVERED',
      actorName: 'SecurityAdministrator',
      actorRole: 'ADMINISTRATOR',
      timestamp: new Date().toISOString(),
      details: `Cursor recovered from ${current.cursorValue} to checkpoint ${prior.checkpointId} (${prior.cursorValue})`,
      status: 'warning',
    });

    return prior;
  }

  public getCheckpoints(connectionId: string): SyncCheckpointRecord[] {
    return this.checkpoints.get(connectionId) || [];
  }

  public getAuditLogs(connectionId?: string): EmailConnectionAuditEvent[] {
    if (!connectionId) return this.auditLogs;
    return this.auditLogs.filter((a) => a.connectionId === connectionId);
  }
}

export const universalSyncEngine = UniversalSyncEngine.getInstance();
