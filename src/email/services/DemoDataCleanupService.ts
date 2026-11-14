/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 76.2 Safe Demonstration Email Data Cleanup Service
 *
 * Implements mandatory 5-step verified cleanup:
 * 1. Create a timestamped durable JSON backup snapshot before any mutation.
 * 2. Classify records strictly into CONFIRMED_DEMO, UNCERTAIN (preserved), and GENUINE (preserved).
 * 3. Generate a dry-run diff report and single-use short-lived admin approval token.
 * 4. Delete ONLY confirmed demo records upon explicit administrator authorization.
 * 5. Record an immutable hash-chained audit entry in EmailAuditService.
 */

import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { PostgresPersistenceAdapter } from '../../services/postgresPersistenceAdapter';
import {
  DEMO_MAILBOX_IDS,
  DEMO_THREAD_IDS,
  DEMO_AUTORESPONDER_LOG_IDS,
  DEMO_HISTORICAL_IMPORT_JOB_IDS,
  DEMO_SYNC_CONFLICT_IDS,
  DEMO_SYNC_AUDIT_LOG_IDS,
} from '../../services/emailEnterpriseSeed';
import { DEMO_THREAD_SERVICE_SEED_IDS, emailThreadService } from './EmailThreadService';
import { EmailAuditService } from './EmailAuditService';

export type ProvenanceClassification = 'CONFIRMED_DEMO' | 'UNCERTAIN' | 'GENUINE';

export interface CleanupRecordSummary {
  table: string;
  id: string;
  classification: ProvenanceClassification;
  reason: string;
  label?: string;
}

export interface CleanupTableStats {
  table: string;
  totalInspected: number;
  confirmedDemo: number;
  uncertainPreserved: number;
  genuinePreserved: number;
}

export interface DemoCleanupDryRunReport {
  dryRunId: string;
  createdAt: string;
  expiresAt: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  backupFilePath: string;
  backupChecksum: string;
  approvalToken: string;
  totalInspected: number;
  confirmedDemoCount: number;
  uncertainPreservedCount: number;
  genuinePreservedCount: number;
  protectedDomainCounts: {
    donorsAndContributionsExcluded: true;
    grantsExcluded: true;
    paymentsExcluded: true;
    auditLedgerExcluded: true;
  };
  tableStats: CleanupTableStats[];
  confirmedDemoIdsByTable: Record<string, string[]>;
  uncertainRecordsSample: CleanupRecordSummary[];
}

export interface DemoCleanupExecutionResult {
  success: boolean;
  dryRunId: string;
  executedAt: string;
  actorId: string;
  actorName: string;
  backupFilePath: string;
  backupChecksum: string;
  deletedCount: number;
  deletedByTable: Record<string, string[]>;
  uncertainPreservedCount: number;
  genuinePreservedCount: number;
  auditLedgerId: string;
  auditLedgerHash: string;
}

const CONFIRMED_DEMO_THREAD_ID_SET = new Set<string>([
  ...DEMO_THREAD_IDS,
  ...DEMO_THREAD_SERVICE_SEED_IDS,
]);

const CONFIRMED_DEMO_MAILBOX_ID_SET = new Set<string>(DEMO_MAILBOX_IDS);
const CONFIRMED_DEMO_AR_LOG_SET = new Set<string>(DEMO_AUTORESPONDER_LOG_IDS);
const CONFIRMED_DEMO_JOB_SET = new Set<string>(DEMO_HISTORICAL_IMPORT_JOB_IDS);
const CONFIRMED_DEMO_CONFLICT_SET = new Set<string>(DEMO_SYNC_CONFLICT_IDS);
const CONFIRMED_DEMO_SYNC_AUDIT_SET = new Set<string>(DEMO_SYNC_AUDIT_LOG_IDS);

const DEMO_MESSAGE_ID_PREFIXES = ['msg-safe-', 'msg-vance-', 'msg-bush-', 'msg-exec-', 'msg-part-', 'msg-vol-', 'msg-tea-', 'msg-spam-', 'msg-hist-'];
const DEMO_PROVIDER_MSG_PREFIXES = ['prov-msg-hist-', 'demo-prov-', 'sim-prov-'];

export class DemoDataCleanupService {
  private static instance: DemoDataCleanupService;
  private dbAdapter: PostgresPersistenceAdapter;
  private pendingApprovals: Map<
    string,
    {
      dryRunId: string;
      report: DemoCleanupDryRunReport;
      expiresAtMs: number;
      consumed: boolean;
    }
  > = new Map();
  private ephemeralHmacKey: string;

  private constructor() {
    this.dbAdapter = PostgresPersistenceAdapter.getInstance();
    this.ephemeralHmacKey =
      process.env.SESSION_SECRET?.trim() || crypto.randomBytes(32).toString('hex');
  }

  public static getInstance(): DemoDataCleanupService {
    if (!DemoDataCleanupService.instance) {
      DemoDataCleanupService.instance = new DemoDataCleanupService();
    }
    return DemoDataCleanupService.instance;
  }

  private getBackupDir(): string {
    const runtimeDir = process.env.PHUMULANI_RUNTIME_DATA_DIR?.trim()
      ? path.resolve(process.env.PHUMULANI_RUNTIME_DATA_DIR.trim())
      : path.resolve(os.tmpdir(), 'phumulani-runtime-data');
    return path.resolve(runtimeDir, 'backups');
  }

  public classifyRecord(table: string, row: Record<string, any>): {
    classification: ProvenanceClassification;
    reason: string;
  } {
    const id = String(row?.id || '');
    const lowerId = id.toLowerCase();

    // Explicit demo provenance flags
    if (
      row?.isDemo === true ||
      row?.isSynthetic === true ||
      row?.provenance === 'DEMO' ||
      row?.provenance === 'TEST_FIXTURE'
    ) {
      return {
        classification: 'CONFIRMED_DEMO',
        reason: 'Explicit demo/synthetic provenance metadata flag',
      };
    }

    if (lowerId.startsWith('demo-') || lowerId.startsWith('sim-') || lowerId.startsWith('fixture-')) {
      return {
        classification: 'CONFIRMED_DEMO',
        reason: `Explicit demo identifier prefix (${id})`,
      };
    }

    if (table === 'email_threads') {
      if (CONFIRMED_DEMO_THREAD_ID_SET.has(id)) {
        return {
          classification: 'CONFIRMED_DEMO',
          reason: `Matched confirmed Phase 8/62 seed thread ID (${id})`,
        };
      }
      if (
        typeof row?.providerMessageId === 'string' &&
        DEMO_PROVIDER_MSG_PREFIXES.some((p) => row.providerMessageId.startsWith(p))
      ) {
        return {
          classification: 'CONFIRMED_DEMO',
          reason: `Matched demo providerMessageId prefix (${row.providerMessageId})`,
        };
      }
      if (row?.connectionId && !String(row.connectionId).startsWith('conn-')) {
        return {
          classification: 'UNCERTAIN',
          reason: 'Thread lacks standard connector provenance; preserved for manual review',
        };
      }
      return {
        classification: 'GENUINE',
        reason: 'Non-seed thread with valid runtime record provenance',
      };
    }

    if (table === 'email_messages') {
      const threadId = String(row?.threadId || '');
      const providerMsgId = String(row?.providerMessageId || '');
      if (
        CONFIRMED_DEMO_THREAD_ID_SET.has(threadId) ||
        DEMO_MESSAGE_ID_PREFIXES.some((p) => id.startsWith(p)) ||
        DEMO_PROVIDER_MSG_PREFIXES.some((p) => providerMsgId.startsWith(p))
      ) {
        return {
          classification: 'CONFIRMED_DEMO',
          reason: `Matched seed message/thread provenance (${id})`,
        };
      }
      if (!providerMsgId && row?.direction === 'inbound') {
        return {
          classification: 'UNCERTAIN',
          reason: 'Inbound message missing providerMessageId and without demo marker — preserved safely',
        };
      }
      return {
        classification: 'GENUINE',
        reason: providerMsgId
          ? `Provider-backed message (${providerMsgId})`
          : 'Staff-authored/runtime record with non-demo provenance',
      };
    }

    if (table === 'email_attachments') {
      const messageId = String(row?.messageId || '');
      if (DEMO_MESSAGE_ID_PREFIXES.some((p) => messageId.startsWith(p))) {
        return {
          classification: 'CONFIRMED_DEMO',
          reason: `Attachment belongs to confirmed demo message (${messageId})`,
        };
      }
      if (!row?.messageId || !row?.connectionId) {
        return {
          classification: 'UNCERTAIN',
          reason: 'Attachment missing message/connection linkage — preserved safely',
        };
      }
      return { classification: 'GENUINE', reason: 'Runtime attachment record' };
    }

    if (table === 'email_drafts') {
      const threadId = String(row?.threadId || '');
      if (CONFIRMED_DEMO_THREAD_ID_SET.has(threadId)) {
        return {
          classification: 'CONFIRMED_DEMO',
          reason: `Draft linked to confirmed demo thread (${threadId})`,
        };
      }
      return { classification: 'GENUINE', reason: 'Staff or AI draft with non-demo provenance' };
    }

    if (table === 'email_outbound_dispatch') {
      if (row?.simulated === true) {
        return {
          classification: 'CONFIRMED_DEMO',
          reason: 'Dispatch explicitly marked simulated',
        };
      }
      return { classification: 'GENUINE', reason: 'Persistent outbound dispatch ledger entry' };
    }

    if (table === 'email_sync_cursors') {
      const mbxId = String(row?.mailboxId || '');
      if (CONFIRMED_DEMO_MAILBOX_ID_SET.has(mbxId)) {
        return {
          classification: 'CONFIRMED_DEMO',
          reason: `Sync cursor tied to confirmed demo mailbox (${mbxId})`,
        };
      }
      return { classification: 'GENUINE', reason: 'Active connector sync cursor' };
    }

    if (
      CONFIRMED_DEMO_AR_LOG_SET.has(id) ||
      CONFIRMED_DEMO_JOB_SET.has(id) ||
      CONFIRMED_DEMO_CONFLICT_SET.has(id) ||
      CONFIRMED_DEMO_SYNC_AUDIT_SET.has(id)
    ) {
      return { classification: 'CONFIRMED_DEMO', reason: `Matched seed demo record ID (${id})` };
    }

    return { classification: 'UNCERTAIN', reason: 'Unknown provenance — preserved safely' };
  }

  private signApprovalToken(dryRunId: string, backupChecksum: string): string {
    const nonce = crypto.randomBytes(12).toString('hex');
    const sig = crypto
      .createHmac('sha256', this.ephemeralHmacKey)
      .update(`${dryRunId}|${backupChecksum}|${nonce}`)
      .digest('hex')
      .slice(0, 24);
    return `cleanup-appr-${dryRunId}-${nonce}-${sig}`;
  }

  public async createDryRun(actor: {
    actorId: string;
    actorName: string;
    actorRole: string;
  }): Promise<DemoCleanupDryRunReport> {
    const dryRunId = `dryrun-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const createdAt = new Date().toISOString();
    const expiresAtMs = Date.now() + 15 * 60 * 1000;
    const expiresAt = new Date(expiresAtMs).toISOString();

    // Step 1: Mandatory timestamped durable backup snapshot BEFORE inspection/deletion
    const backup = await this.dbAdapter.exportDurableBackup();
    const backupDir = this.getBackupDir();
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
    }
    const safeTs = createdAt.replace(/[:.]/g, '-');
    const backupFilePath = path.resolve(backupDir, `demo-cleanup-backup-${safeTs}-${dryRunId}.json`);
    fs.writeFileSync(
      backupFilePath,
      JSON.stringify(
        {
          dryRunId,
          createdAt,
          actor,
          checksum: backup.checksum,
          tablesCount: backup.tablesCount,
          data: JSON.parse(backup.data),
        },
        null,
        2
      ),
      { encoding: 'utf8', mode: 0o600 }
    );

    // Step 2: Classify email-related durable tables strictly (never touch donors, grants, payments, audit logs)
    const targetTables = [
      'email_threads',
      'email_messages',
      'email_attachments',
      'email_drafts',
      'email_outbound_dispatch',
      'email_sync_cursors',
    ];

    const tableStats: CleanupTableStats[] = [];
    const confirmedDemoIdsByTable: Record<string, string[]> = {};
    const uncertainRecordsSample: CleanupRecordSummary[] = [];

    let totalInspected = 0;
    let confirmedDemoCount = 0;
    let uncertainPreservedCount = 0;
    let genuinePreservedCount = 0;

    for (const table of targetTables) {
      const rows = await this.dbAdapter.select<Record<string, any>>(table).catch(() => []);
      // Merge in-memory threads from EmailThreadService if inspecting email_threads
      const seenIds = new Set(rows.map((r) => String(r.id)));
      const combinedRows = [...rows];
      if (table === 'email_threads') {
        for (const memThread of emailThreadService.listThreads()) {
          if (!seenIds.has(memThread.id)) {
            combinedRows.push(memThread as any);
            seenIds.add(memThread.id);
          }
        }
      }

      const demoIds: string[] = [];
      let tUncertain = 0;
      let tGenuine = 0;

      for (const row of combinedRows) {
        totalInspected++;
        const { classification, reason } = this.classifyRecord(table, row);
        if (classification === 'CONFIRMED_DEMO') {
          confirmedDemoCount++;
          demoIds.push(String(row.id));
        } else if (classification === 'UNCERTAIN') {
          uncertainPreservedCount++;
          tUncertain++;
          if (uncertainRecordsSample.length < 25) {
            uncertainRecordsSample.push({
              table,
              id: String(row.id),
              classification,
              reason,
              label: row.subject || row.threadSubject || undefined,
            });
          }
        } else {
          genuinePreservedCount++;
          tGenuine++;
        }
      }

      confirmedDemoIdsByTable[table] = demoIds;
      tableStats.push({
        table,
        totalInspected: combinedRows.length,
        confirmedDemo: demoIds.length,
        uncertainPreserved: tUncertain,
        genuinePreserved: tGenuine,
      });
    }

    const approvalToken = this.signApprovalToken(dryRunId, backup.checksum);
    const report: DemoCleanupDryRunReport = {
      dryRunId,
      createdAt,
      expiresAt,
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      backupFilePath,
      backupChecksum: backup.checksum,
      approvalToken,
      totalInspected,
      confirmedDemoCount,
      uncertainPreservedCount,
      genuinePreservedCount,
      protectedDomainCounts: {
        donorsAndContributionsExcluded: true,
        grantsExcluded: true,
        paymentsExcluded: true,
        auditLedgerExcluded: true,
      },
      tableStats,
      confirmedDemoIdsByTable,
      uncertainRecordsSample,
    };

    this.pendingApprovals.set(approvalToken, {
      dryRunId,
      report,
      expiresAtMs,
      consumed: false,
    });

    return report;
  }

  public async executeCleanup(params: {
    actorId: string;
    actorName: string;
    actorRole: string;
    adminApproved: boolean;
    approvalToken: string;
  }): Promise<DemoCleanupExecutionResult> {
    if (params.adminApproved !== true) {
      throw new Error('ADMIN_APPROVAL_REQUIRED: Explicit adminApproved=true confirmation is required before cleanup execution.');
    }
    if (!params.approvalToken || !this.pendingApprovals.has(params.approvalToken)) {
      throw new Error('INVALID_APPROVAL_TOKEN: Valid dry-run approval token is required.');
    }

    const pending = this.pendingApprovals.get(params.approvalToken)!;
    if (pending.consumed) {
      throw new Error('APPROVAL_TOKEN_ALREADY_CONSUMED: Single-use cleanup approval token has already been used.');
    }
    if (Date.now() > pending.expiresAtMs) {
      this.pendingApprovals.delete(params.approvalToken);
      throw new Error('APPROVAL_TOKEN_EXPIRED: Dry-run approval token expired. Run a fresh dry-run.');
    }

    const { report } = pending;
    if (!fs.existsSync(report.backupFilePath)) {
      throw new Error('BACKUP_MISSING: Refusing destructive cleanup because backup snapshot file could not be verified on disk.');
    }

    // Consume token immediately to guarantee single-use idempotency
    pending.consumed = true;

    const deletedByTable: Record<string, string[]> = {};
    let deletedCount = 0;

    for (const [table, ids] of Object.entries(report.confirmedDemoIdsByTable)) {
      const removedIds: string[] = [];
      for (const id of ids) {
        if (table === 'email_threads') {
          const removed = await emailThreadService.removeThreadsByIds([id]);
          if (removed > 0) {
            removedIds.push(id);
            deletedCount++;
          }
        } else {
          const ok = await this.dbAdapter.deleteById(table, id).catch(() => false);
          if (ok) {
            removedIds.push(id);
            deletedCount++;
          }
        }
      }
      deletedByTable[table] = removedIds;
    }

    const executedAt = new Date().toISOString();
    const auditEntry = await EmailAuditService.getInstance().logEvent({
      action: 'DEMO_DATA_CLEANUP_EXECUTED',
      actor: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      details: {
        dryRunId: report.dryRunId,
        backupFilePath: report.backupFilePath,
        backupChecksum: report.backupChecksum,
        deletedCount,
        deletedByTable,
        uncertainPreservedCount: report.uncertainPreservedCount,
        genuinePreservedCount: report.genuinePreservedCount,
      },
    });

    return {
      success: true,
      dryRunId: report.dryRunId,
      executedAt,
      actorId: params.actorId,
      actorName: params.actorName,
      backupFilePath: report.backupFilePath,
      backupChecksum: report.backupChecksum,
      deletedCount,
      deletedByTable,
      uncertainPreservedCount: report.uncertainPreservedCount,
      genuinePreservedCount: report.genuinePreservedCount,
      auditLedgerId: auditEntry.id,
      auditLedgerHash: auditEntry.currentHash,
    };
  }
}

export const demoDataCleanupService = DemoDataCleanupService.getInstance();
