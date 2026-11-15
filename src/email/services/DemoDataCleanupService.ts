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
import { emailDispatchService } from './EmailDispatchService';
import { emailApprovalService } from './EmailApprovalService';
import { emailSyncService } from './EmailSyncService';
import { EmailGovernanceService } from './EmailGovernanceService';
import { oAuthService } from './OAuthService';
import { connectorRegistry } from '../../services/connectors/connectorRegistry';
import { googleWorkspaceAdapter } from '../../services/googleWorkspaceAdapter';
import { EnvironmentService } from '../../services/environmentService';
import { EmailAuditService } from './EmailAuditService';

export const CLEAN_EMAIL_RESET_MARKER_VERSION = 'phase79_1_clean_email_v1' as const;

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

export interface CompleteResetItemizedCount {
  category: string;
  tableOrStore: string;
  countToRemove: number;
  legalHoldPreserved: number;
}

export interface CompleteEmailResetDryRunReport {
  dryRunId: string;
  resetMarkerVersion: string;
  createdAt: string;
  expiresAt: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  backupFilePath: string;
  backupChecksum: string;
  approvalToken: string;
  totalOperationalItemsFound: number;
  legalHoldPreservedCount: number;
  legalHoldPreservedIds: string[];
  mailboxConnectionsToRemove: Array<{
    id: string;
    emailAddress: string;
    provider: string;
    authStatus: string;
  }>;
  vaultEntriesToPurge: number;
  protectedDomainsExcluded: {
    donorsAndCrmExcluded: true;
    grantsExcluded: true;
    paymentsExcluded: true;
    safeguardingRecordsExcluded: true;
    immutableAuditLedgerExcluded: true;
  };
  itemizedCounts: CompleteResetItemizedCount[];
  deleteTargetsByTable: Record<string, string[]>;
}

export interface CompleteEmailResetExecutionResult {
  success: boolean;
  dryRunId: string;
  resetMarkerVersion: string;
  executedAt: string;
  actorId: string;
  actorName: string;
  backupFilePath: string;
  backupChecksum: string;
  totalDeleted: number;
  deletedByCategory: Array<{ category: string; tableOrStore: string; deletedCount: number }>;
  mailboxConnectionsRemoved: string[];
  vaultEntriesPurged: number;
  providerRevocationsAttempted: number;
  providerRevocationsSucceeded: number;
  legalHoldPreservedCount: number;
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

const COMPLETE_RESET_EMAIL_TABLES: Array<{ table: string; category: string; supportsLegalHold?: boolean }> = [
  { table: 'email_threads', category: 'Email Threads', supportsLegalHold: true },
  { table: 'email_messages', category: 'Email Messages (Inbox / Sent / Archive / Spam / Trash)', supportsLegalHold: true },
  { table: 'email_attachments', category: 'Email Attachments & References', supportsLegalHold: true },
  { table: 'email_drafts', category: 'Drafts & AI-Generated Replies', supportsLegalHold: true },
  { table: 'email_outbound_approvals', category: 'Email Approval Queues', supportsLegalHold: true },
  { table: 'email_outbound_dispatch', category: 'Outbound Dispatch History' },
  { table: 'email_idempotency_keys', category: 'Dispatch Idempotency Records' },
  { table: 'email_sync_cursors', category: 'Synchronization History & Cursors' },
  { table: 'email_crm_links', category: 'Email-to-CRM Thread Links', supportsLegalHold: true },
  { table: 'email_campaign_batches', category: 'Scheduled Email Campaign Batches' },
  { table: 'email_ai_usage_metrics', category: 'AI Email Processing Metrics' },
  { table: 'email_financial_documents', category: 'Extracted Email Financial Docs' },
  { table: 'email_calendar_reminders', category: 'Email Calendar Reminders' },
  { table: 'email_delivery_queue', category: 'Email Delivery Queue' },
  { table: 'email_mailbox_permissions', category: 'Mailbox ACL Policies' },
  { table: 'phumulani_ai_reply_drafts', category: 'AI Reply Drafts' },
  { table: 'mailboxes', category: 'Legacy Mailbox Table' },
  { table: 'threads', category: 'Legacy Thread Table', supportsLegalHold: true },
  { table: 'messages', category: 'Legacy Message Table', supportsLegalHold: true },
  { table: 'drafts', category: 'Legacy Draft Table' },
  { table: 'approvals', category: 'Legacy Approval Table' },
  { table: 'dispatches', category: 'Legacy Dispatch Table' },
  { table: 'checkpoints', category: 'Legacy Sync Checkpoints' },
  { table: 'crm_links', category: 'Legacy CRM Links' },
];

const EMAIL_BACKGROUND_JOB_TYPES = new Set([
  'HISTORICAL_MAILBOX_IMPORT',
  'INCREMENTAL_EMAIL_SYNC',
  'APPROVED_COMMUNICATION_DISPATCH',
  'SCHEDULED_DISPATCH',
  'RECONCILIATION_PROCESSING',
  'HEALTH_PROBE_MONITOR',
  'AI_CLASSIFICATION',
]);

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
  private pendingCompleteResetApprovals: Map<
    string,
    {
      dryRunId: string;
      report: CompleteEmailResetDryRunReport;
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

  private resolveSigningSecret(): string {
    const configured = process.env.SESSION_SECRET?.trim() || '';
    const policy = EnvironmentService.getDatabasePolicy();
    if (policy.requireLiveDatabase || policy.nodeEnv === 'production') {
      if (!configured || configured.length < 32) {
        throw new Error(
          'SESSION_SECRET_MISSING_IN_PRODUCTION: SESSION_SECRET (minimum 32 characters) is required for reset approval HMAC signing in production.'
        );
      }
      return configured;
    }
    return configured || this.ephemeralHmacKey;
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

  private signApprovalToken(dryRunId: string, backupChecksum: string, prefix = 'cleanup-appr'): string {
    const nonce = crypto.randomBytes(12).toString('hex');
    const secret = this.resolveSigningSecret();
    const sig = crypto
      .createHmac('sha256', secret)
      .update(`${dryRunId}|${backupChecksum}|${nonce}`)
      .digest('hex')
      .slice(0, 24);
    return `${prefix}-${dryRunId}-${nonce}-${sig}`;
  }

  public async createDryRun(actor: {
    actorId: string;
    actorName: string;
    actorRole: string;
  }): Promise<DemoCleanupDryRunReport> {
    this.resolveSigningSecret();
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

  /**
   * Phase 79.1 Complete Email Data Reset & Clean Installation — Step 1 Dry Run
   * Exports a SHA-256 verified full backup snapshot (without secrets) and builds an itemized deletion plan,
   * preserving records under active legal holds and excluding donor CRM, grants, financial & audit ledger tables.
   */
  public async createCompleteResetDryRun(actor: {
    actorId: string;
    actorName: string;
    actorRole: string;
  }): Promise<CompleteEmailResetDryRunReport> {
    this.resolveSigningSecret();
    await emailThreadService.initialize();
    await emailDispatchService.initialize();
    await emailApprovalService.initialize();
    const governance = EmailGovernanceService.getInstance();
    await governance.initialize();

    const dryRunId = `reset-dryrun-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const createdAt = new Date().toISOString();
    const expiresAtMs = Date.now() + 15 * 60 * 1000;
    const expiresAt = new Date(expiresAtMs).toISOString();

    const backup = await this.dbAdapter.exportDurableBackup();
    const existingConnections = connectorRegistry.listConnections().map((c) => ({
      id: c.id,
      emailAddress: c.emailAddress,
      provider: String(c.provider),
      authStatus: String(c.authStatus),
    }));
    const vaultKeys = oAuthService.listStoredVaultKeys();

    const backupPayloadObj = {
      dryRunId,
      resetMarkerVersion: CLEAN_EMAIL_RESET_MARKER_VERSION,
      createdAt,
      actor,
      dbChecksum: backup.checksum,
      tablesCount: backup.tablesCount,
      mailboxConnectionsMetadata: existingConnections,
      vaultedCredentialKeysCount: vaultKeys.length,
      data: JSON.parse(backup.data),
    };
    const serializedBackup = JSON.stringify(backupPayloadObj, null, 2);
    const backupChecksum = crypto.createHash('sha256').update(serializedBackup).digest('hex');

    const backupDir = this.getBackupDir();
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
    }
    const safeTs = createdAt.replace(/[:.]/g, '-');
    const backupFilePath = path.resolve(backupDir, `complete-email-reset-backup-${safeTs}-${dryRunId}.json`);
    fs.writeFileSync(backupFilePath, serializedBackup, { encoding: 'utf8', mode: 0o600 });

    const itemizedCounts: CompleteResetItemizedCount[] = [];
    const deleteTargetsByTable: Record<string, string[]> = {};
    const legalHoldPreservedSet = new Set<string>();
    let totalOperationalItemsFound = 0;

    for (const spec of COMPLETE_RESET_EMAIL_TABLES) {
      const rows = await this.dbAdapter.select<Record<string, any>>(spec.table).catch(() => []);
      const combinedRows = [...rows];
      if (spec.table === 'email_threads') {
        const seenIds = new Set(rows.map((r) => String(r.id)));
        for (const t of emailThreadService.listThreads()) {
          if (!seenIds.has(t.id)) {
            combinedRows.push(t as any);
            seenIds.add(t.id);
          }
        }
      }
      if (spec.table === 'email_drafts') {
        const seenIds = new Set(rows.map((r) => String(r.id)));
        for (const d of await emailDispatchService.listDrafts()) {
          if (!seenIds.has(d.id)) {
            combinedRows.push(d as any);
            seenIds.add(d.id);
          }
        }
      }
      if (spec.table === 'email_outbound_approvals') {
        const seenIds = new Set(rows.map((r) => String(r.id)));
        for (const a of await emailApprovalService.listApprovals()) {
          if (!seenIds.has(a.id)) {
            combinedRows.push(a as any);
            seenIds.add(a.id);
          }
        }
      }

      const toDelete: string[] = [];
      let heldCount = 0;

      for (const row of combinedRows) {
        const rowId = String(row.id || '');
        if (!rowId) continue;

        let hold = null;
        if (spec.supportsLegalHold) {
          hold = await governance.findMatchingLegalHold({
            threadId: row.threadId || (spec.table.includes('thread') ? rowId : undefined),
            mailboxEmail: row.mailboxEmail || row.senderAccount || undefined,
            senderEmail: row.senderEmail || undefined,
          });
        }
        if (hold) {
          heldCount++;
          legalHoldPreservedSet.add(rowId);
        } else {
          toDelete.push(rowId);
        }
      }

      deleteTargetsByTable[spec.table] = toDelete;
      if (toDelete.length > 0 || heldCount > 0) {
        itemizedCounts.push({
          category: spec.category,
          tableOrStore: spec.table,
          countToRemove: toDelete.length,
          legalHoldPreserved: heldCount,
        });
      }
      totalOperationalItemsFound += toDelete.length;
    }

    // Background email jobs
    const bgJobs = await this.dbAdapter.select<Record<string, any>>('background_jobs').catch(() => []);
    const emailJobIds = bgJobs
      .filter((j) => EMAIL_BACKGROUND_JOB_TYPES.has(String(j.type || '')))
      .map((j) => String(j.id))
      .filter(Boolean);
    deleteTargetsByTable['background_jobs'] = emailJobIds;
    if (emailJobIds.length > 0) {
      itemizedCounts.push({
        category: 'Email Background Worker Jobs',
        tableOrStore: 'background_jobs',
        countToRemove: emailJobIds.length,
        legalHoldPreserved: 0,
      });
      totalOperationalItemsFound += emailJobIds.length;
    }

    if (existingConnections.length > 0) {
      itemizedCounts.push({
        category: 'Configured Mailbox Connections',
        tableOrStore: 'connector_registry',
        countToRemove: existingConnections.length,
        legalHoldPreserved: 0,
      });
      totalOperationalItemsFound += existingConnections.length;
    }

    if (vaultKeys.length > 0) {
      itemizedCounts.push({
        category: 'Encrypted OAuth Tokens & Mail Credentials',
        tableOrStore: 'oauth_token_vault',
        countToRemove: vaultKeys.length,
        legalHoldPreserved: 0,
      });
      totalOperationalItemsFound += vaultKeys.length;
    }

    const approvalToken = this.signApprovalToken(dryRunId, backupChecksum, 'reset-appr');
    const report: CompleteEmailResetDryRunReport = {
      dryRunId,
      resetMarkerVersion: CLEAN_EMAIL_RESET_MARKER_VERSION,
      createdAt,
      expiresAt,
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      backupFilePath,
      backupChecksum,
      approvalToken,
      totalOperationalItemsFound,
      legalHoldPreservedCount: legalHoldPreservedSet.size,
      legalHoldPreservedIds: Array.from(legalHoldPreservedSet),
      mailboxConnectionsToRemove: existingConnections,
      vaultEntriesToPurge: vaultKeys.length,
      protectedDomainsExcluded: {
        donorsAndCrmExcluded: true,
        grantsExcluded: true,
        paymentsExcluded: true,
        safeguardingRecordsExcluded: true,
        immutableAuditLedgerExcluded: true,
      },
      itemizedCounts,
      deleteTargetsByTable,
    };

    this.pendingCompleteResetApprovals.set(approvalToken, {
      dryRunId,
      report,
      expiresAtMs,
      consumed: false,
    });

    return report;
  }

  /**
   * Phase 79.1 Complete Email Data Reset & Clean Installation — Step 2 Verified Execution
   */
  public async executeCompleteReset(params: {
    actorId: string;
    actorName: string;
    actorRole: string;
    adminApproved: boolean;
    approvalToken: string;
    attemptProviderRevocation?: boolean;
  }): Promise<CompleteEmailResetExecutionResult> {
    if (params.adminApproved !== true) {
      throw new Error('ADMIN_APPROVAL_REQUIRED: Explicit adminApproved=true confirmation is required before deleting email data.');
    }
    if (!params.approvalToken || !this.pendingCompleteResetApprovals.has(params.approvalToken)) {
      throw new Error('INVALID_APPROVAL_TOKEN: Valid complete-reset dry-run approval token is required.');
    }

    const pending = this.pendingCompleteResetApprovals.get(params.approvalToken)!;
    if (pending.consumed) {
      throw new Error('APPROVAL_TOKEN_ALREADY_CONSUMED: Single-use complete-reset approval token has already been used.');
    }
    if (Date.now() > pending.expiresAtMs) {
      this.pendingCompleteResetApprovals.delete(params.approvalToken);
      throw new Error('APPROVAL_TOKEN_EXPIRED: Complete-reset approval token expired. Run a fresh dry-run.');
    }

    const { report } = pending;
    if (!fs.existsSync(report.backupFilePath)) {
      throw new Error('BACKUP_MISSING: Refusing complete reset because verified backup file could not be confirmed on disk.');
    }

    // Verify backup integrity before destructive operation
    const rawBackup = fs.readFileSync(report.backupFilePath, 'utf8');
    const actualChecksum = crypto.createHash('sha256').update(rawBackup).digest('hex');
    if (actualChecksum !== report.backupChecksum) {
      throw new Error('BACKUP_CHECKSUM_MISMATCH: Backup file verification failed; aborting reset safely.');
    }

    pending.consumed = true;

    const legalHoldSet = new Set(report.legalHoldPreservedIds);
    const deletedByCategory: Array<{ category: string; tableOrStore: string; deletedCount: number }> = [];
    let totalDeleted = 0;

    // 1. Revoke provider OAuth grants best-effort and purge token vault + credentials
    const vaultPurge = await oAuthService.purgeAllEmailTokensAndCredentials({
      attemptProviderRevocation: params.attemptProviderRevocation !== false,
    });
    if (vaultPurge.purgedVaultEntries > 0) {
      deletedByCategory.push({
        category: 'Encrypted OAuth Tokens & Mail Credentials',
        tableOrStore: 'oauth_token_vault',
        deletedCount: vaultPurge.purgedVaultEntries,
      });
      totalDeleted += vaultPurge.purgedVaultEntries;
    }

    // 2. Delete all non-legal-hold rows from all email tables
    for (const spec of COMPLETE_RESET_EMAIL_TABLES) {
      const targetIds = report.deleteTargetsByTable[spec.table] || [];
      if (targetIds.length === 0) continue;

      let tableDeleted = 0;
      if (spec.table === 'email_threads') {
        const res = await emailThreadService.clearAllForReset(legalHoldSet);
        tableDeleted = res.threadsRemoved;
      } else {
        for (const id of targetIds) {
          if (legalHoldSet.has(id)) continue;
          const ok = await this.dbAdapter.deleteById(spec.table, id).catch(() => false);
          if (ok) tableDeleted++;
        }
      }
      if (tableDeleted > 0) {
        deletedByCategory.push({
          category: spec.category,
          tableOrStore: spec.table,
          deletedCount: tableDeleted,
        });
        totalDeleted += tableDeleted;
      }
    }

    // Delete queued email background jobs
    const bgJobIds = report.deleteTargetsByTable['background_jobs'] || [];
    let bgDeleted = 0;
    for (const jid of bgJobIds) {
      const ok = await this.dbAdapter.deleteById('background_jobs', jid).catch(() => false);
      if (ok) bgDeleted++;
    }
    if (bgDeleted > 0) {
      deletedByCategory.push({
        category: 'Email Background Worker Jobs',
        tableOrStore: 'background_jobs',
        deletedCount: bgDeleted,
      });
      totalDeleted += bgDeleted;
    }

    // 3. Clear in-memory caches and remaining sub-stores cleanly
    await emailApprovalService.clearAllForReset(legalHoldSet);
    await emailDispatchService.clearAllForReset(legalHoldSet);
    await emailSyncService.clearCursorsForReset();
    googleWorkspaceAdapter.resetOperationalStateForCleanInstall();

    // 4. Purge all mailbox connections and persist versioned reset marker
    const connPurge = connectorRegistry.clearAllConnectionsAndPersistReset({
      version: CLEAN_EMAIL_RESET_MARKER_VERSION,
      actorId: params.actorId,
      reason: 'Phase 79.1 Complete Email Data Reset & Clean Installation',
    });
    if (connPurge.removedConnectionIds.length > 0) {
      deletedByCategory.push({
        category: 'Configured Mailbox Connections',
        tableOrStore: 'connector_registry',
        deletedCount: connPurge.removedConnectionIds.length,
      });
      totalDeleted += connPurge.removedConnectionIds.length;
    }

    const executedAt = new Date().toISOString();
    const auditEntry = await EmailAuditService.getInstance().logEvent({
      action: 'COMPLETE_EMAIL_RESET_EXECUTED',
      actor: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      details: {
        dryRunId: report.dryRunId,
        resetMarkerVersion: CLEAN_EMAIL_RESET_MARKER_VERSION,
        backupFilePath: report.backupFilePath,
        backupChecksum: report.backupChecksum,
        totalDeleted,
        deletedByCategory,
        mailboxConnectionsRemoved: connPurge.removedEmails,
        vaultEntriesPurged: vaultPurge.purgedVaultEntries,
        legalHoldPreservedCount: legalHoldSet.size,
      },
    });

    return {
      success: true,
      dryRunId: report.dryRunId,
      resetMarkerVersion: CLEAN_EMAIL_RESET_MARKER_VERSION,
      executedAt,
      actorId: params.actorId,
      actorName: params.actorName,
      backupFilePath: report.backupFilePath,
      backupChecksum: report.backupChecksum,
      totalDeleted,
      deletedByCategory,
      mailboxConnectionsRemoved: connPurge.removedEmails,
      vaultEntriesPurged: vaultPurge.purgedVaultEntries,
      providerRevocationsAttempted: vaultPurge.revocationAttempted,
      providerRevocationsSucceeded: vaultPurge.revokedAtProvider,
      legalHoldPreservedCount: legalHoldSet.size,
      auditLedgerId: auditEntry.id,
      auditLedgerHash: auditEntry.currentHash,
    };
  }
}

export const demoDataCleanupService = DemoDataCleanupService.getInstance();
