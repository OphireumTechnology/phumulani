/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Universal Inbound Synchronization Engine
 * Phase 61 Production-Grade Synchronization, Durable Checkpoints & Rate Limiting
 * Grounded in Master Development Directive Phase 61
 */

import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  SyncOptions,
  SyncResult,
  NormalizedEmailMessage,
  NormalizedEmailAttachment,
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
  syncType: 'INITIAL' | 'INCREMENTAL';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'ROLLED_BACK';
  timestamp: string;
}

export class UniversalSyncEngine {
  private static instance: UniversalSyncEngine;
  private checkpoints: Map<string, SyncCheckpointRecord[]> = new Map();
  private processedMessageIds: Set<string> = new Set();
  private auditLogs: EmailConnectionAuditEvent[] = [];
  private persistenceFilePath: string;

  private constructor() {
    const runtimeDir = process.env.PHUMULANI_RUNTIME_DATA_DIR?.trim()
      ? path.resolve(process.env.PHUMULANI_RUNTIME_DATA_DIR.trim())
      : path.resolve(os.tmpdir(), 'phumulani-runtime-data');
    this.persistenceFilePath = path.resolve(runtimeDir, '.sync_checkpoints_vault.json');
    this.loadDurableState();
  }

  public static getInstance(): UniversalSyncEngine {
    if (!UniversalSyncEngine.instance) {
      UniversalSyncEngine.instance = new UniversalSyncEngine();
    }
    return UniversalSyncEngine.instance;
  }

  /**
   * Loads persisted sync checkpoints and deduplication index across application restarts.
   */
  private loadDurableState(): void {
    try {
      if (fs.existsSync(this.persistenceFilePath)) {
        const raw = fs.readFileSync(this.persistenceFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.checkpoints && typeof parsed.checkpoints === 'object') {
          for (const [connId, records] of Object.entries(parsed.checkpoints)) {
            if (Array.isArray(records)) {
              this.checkpoints.set(connId, records as SyncCheckpointRecord[]);
            }
          }
        }
        if (Array.isArray(parsed.processedMessageIds)) {
          this.processedMessageIds = new Set(parsed.processedMessageIds);
        }
        if (Array.isArray(parsed.auditLogs)) {
          this.auditLogs = parsed.auditLogs;
        }
      }
    } catch (err) {
      console.warn('[UniversalSyncEngine] Failed to load durable sync state (continuing in-memory):', err);
    }
  }

  /**
   * Persists sync checkpoints atomically to disk to ensure durability across restarts.
   */
  private saveDurableState(): void {
    const tmpPath = `${this.persistenceFilePath}.tmp.${process.pid}.${crypto.randomBytes(6).toString('hex')}`;
    try {
      const dir = path.dirname(this.persistenceFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
      }
      const data = {
        savedAt: new Date().toISOString(),
        checkpoints: Object.fromEntries(this.checkpoints.entries()),
        processedMessageIds: Array.from(this.processedMessageIds),
        auditLogs: this.auditLogs.slice(0, 300),
      };
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), { encoding: 'utf8', mode: 0o600 });
      fs.renameSync(tmpPath, this.persistenceFilePath);
    } catch (err: any) {
      try {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      } catch {}
      console.error('[UniversalSyncEngine] Failed to persist sync state to disk:', err?.message || err);
      throw new Error(`SYNC_STATE_PERSISTENCE_FAILED: ${err?.message || 'Unable to persist sync state.'}`);
    }
  }

  /**
   * Executes an asynchronous task with exponential backoff on rate limits or network transient failures.
   */
  public async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelayMs: number = 50
  ): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries) {
          const delay = initialDelayMs * Math.pow(2, attempt - 1);
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }
    throw lastError;
  }

  /**
   * Validates attachment metadata and quarantines executable or dangerous extensions.
   */
  public inspectAttachment(attachment: NormalizedEmailAttachment): NormalizedEmailAttachment {
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.vbs', '.js', '.scr', '.pif', '.msi'];
    const ext = attachment.filename.substring(attachment.filename.lastIndexOf('.')).toLowerCase();

    if (dangerousExtensions.includes(ext)) {
      return {
        ...attachment,
        isQuarantined: true,
        quarantineReason: `BLOCKED_DANGEROUS_EXTENSION: Attachment "${attachment.filename}" quarantined by security policy.`,
      };
    }

    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (attachment.sizeBytes > MAX_SIZE) {
      return {
        ...attachment,
        isQuarantined: true,
        quarantineReason: `ATTACHMENT_SIZE_EXCEEDED: Size (${Math.round(attachment.sizeBytes / 1024 / 1024)}MB) exceeds limit.`,
      };
    }

    return { ...attachment, isQuarantined: false };
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
    const isInitial = !options.cursor || options.forceFullResync;

    try {
      // 1. Fetch raw messages from connector with retry handler
      const messages = await this.executeWithRetry(() => connector.listMessages(options));

      // 2. Perform deduplication & attachment inspection
      let newCount = 0;
      let dupCount = 0;
      const deduplicated: NormalizedEmailMessage[] = [];

      for (const msg of messages) {
        const dedupeKey = `${connector.provider}:${msg.providerMessageId}`;
        if (this.processedMessageIds.has(dedupeKey)) {
          dupCount++;
        } else {
          this.processedMessageIds.add(dedupeKey);

          // Inspect attachments if present
          if (msg.attachments && msg.attachments.length > 0) {
            msg.attachments = msg.attachments.map((att) => this.inspectAttachment(att));
          }

          deduplicated.push(msg);
          newCount++;
        }
      }

      // 3. Delegate to connector synchronize for cursor advancement
      const syncResult = await this.executeWithRetry(() => connector.synchronize(options));
      if (!syncResult.success) {
        this.auditLogs.unshift({
          id: `aud-sync-blocked-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
          connectionId,
          mailboxEmail,
          provider: connector.provider,
          action: 'SYNC_CHECKPOINT_CREATED',
          actorName: 'UniversalSyncDaemon',
          actorRole: 'SYSTEM_SCHEDULER',
          timestamp: new Date().toISOString(),
          details: `Sync blocked/failed: ${syncResult.error || 'Provider synchronization unsuccessful'}`,
          status: 'error',
        });
        this.saveDurableState();
        return {
          ...syncResult,
          messagesImported: 0,
          duplicatesSkipped: 0,
        };
      }

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
        syncType: isInitial ? 'INITIAL' : 'INCREMENTAL',
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
      };

      const history = this.checkpoints.get(connectionId) || [];
      history.unshift(checkpoint);
      if (history.length > 50) history.length = 50;
      this.checkpoints.set(connectionId, history);

      // 5. Audit Event
      this.auditLogs.unshift({
        id: `aud-sync-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        connectionId,
        mailboxEmail,
        provider: connector.provider,
        action: 'SYNC_CHECKPOINT_CREATED',
        actorName: 'UniversalSyncDaemon',
        actorRole: 'SYSTEM_SCHEDULER',
        timestamp: new Date().toISOString(),
        details: `${isInitial ? 'Initial' : 'Incremental'} sync completed: ${newCount} imported, ${dupCount} duplicates skipped. Cursor: ${syncResult.newCursor}`,
        status: 'success',
      });

      // 6. Save durable state to disk
      this.saveDurableState();

      return {
        ...syncResult,
        messagesImported: newCount,
        duplicatesSkipped: dupCount,
        ...(deduplicated.length > 0 ? { syncedMessages: deduplicated } : {}),
      } as SyncResult & { syncedMessages?: NormalizedEmailMessage[] };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      this.auditLogs.unshift({
        id: `aud-sync-err-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
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

      this.saveDurableState();

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

    this.saveDurableState();
    return prior;
  }

  public getCheckpoints(connectionId: string): SyncCheckpointRecord[] {
    return this.checkpoints.get(connectionId) || [];
  }

  public getAuditLogs(connectionId?: string): EmailConnectionAuditEvent[] {
    if (!connectionId) return this.auditLogs;
    return this.auditLogs.filter((a) => a.connectionId === connectionId);
  }

  /**
   * Reloads persistent checkpoints from disk (used to verify restart survival in tests).
   */
  public reloadDurableState(): void {
    this.checkpoints.clear();
    this.processedMessageIds.clear();
    this.auditLogs = [];
    this.loadDurableState();
  }

  /**
   * Resets in-memory state for clean test isolation.
   */
  public resetForTesting(): void {
    this.checkpoints.clear();
    this.processedMessageIds.clear();
    this.auditLogs = [];
    try {
      if (fs.existsSync(this.persistenceFilePath)) {
        fs.unlinkSync(this.persistenceFilePath);
      }
    } catch {}
  }
}

export const universalSyncEngine = UniversalSyncEngine.getInstance();
