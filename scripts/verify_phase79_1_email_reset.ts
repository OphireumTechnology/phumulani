/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 79.1 Complete Email Data Reset & Clean Installation Verification
 *
 * Verifies Blocks 1–7:
 *  - Clean initial boot (0 mailboxes, 0 email threads/messages/follow-ups, auto-responders disabled, non-email domains intact)
 *  - Pre-deletion SHA-256 verified backup (without raw OAuth tokens), itemized deletion report, explicit adminApproved=true gate
 *  - Complete removal of all 5 organizational mailboxes, OAuth tokens, threads, messages, attachments, drafts, dispatches, jobs
 *  - Preservation of active legal holds & non-email domain data (donors, grants, non-email jobs, audit ledger)
 *  - Versioned reset marker (phase79_1_clean_email_v1) preventing automatic re-seeding across restarts
 *  - Disabled email operations (sync, scheduled dispatch, AI draft reply, HTTP 409 EMAIL_OPERATIONS_DISABLED locks, background worker no-op)
 */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, ChildProcess } from 'node:child_process';

const tempRuntimeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phumulani-phase79-1-'));
process.env.PHUMULANI_RUNTIME_DATA_DIR = tempRuntimeDir;
process.env.PHUMULANI_OPERATIONAL_MODE = 'STAGED_DEVELOPMENT';
process.env.SAFEGUARDING_MASTER_KEY = crypto.randomBytes(32).toString('hex');

interface CheckResult {
  id: string;
  passed: boolean;
  details: string;
}

const results: CheckResult[] = [];

async function runCheck(id: string, fn: () => Promise<string> | string) {
  try {
    const details = await fn();
    results.push({ id, passed: true, details });
    console.log(`[PASS] ${id}: ${details}`);
  } catch (err: any) {
    const msg = err?.message || String(err);
    results.push({ id, passed: false, details: msg });
    console.error(`[FAIL] ${id}: ${msg}`);
  }
}

async function waitForServer(baseUrl: string, timeoutMs = 25000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.status === 200 || res.status === 503) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for server at ${baseUrl}`);
}

async function stopChild(proc: ChildProcess | null): Promise<void> {
  if (!proc || proc.exitCode !== null) return;
  proc.kill('SIGTERM');
  await new Promise<void>((resolve) => {
    const t = setTimeout(() => {
      try {
        proc.kill('SIGKILL');
      } catch {
        // ignore
      }
      resolve();
    }, 3000);
    proc.once('exit', () => {
      clearTimeout(t);
      resolve();
    });
  });
}

async function main() {
  const { DatabaseMigrationService } = await import('../src/services/databaseMigrationService');
  const { PostgresPersistenceAdapter } = await import('../src/services/postgresPersistenceAdapter');
  const { connectorRegistry } = await import('../src/services/connectors/connectorRegistry');
  const { oAuthService } = await import('../src/email/services/OAuthService');
  const { demoDataCleanupService, CLEAN_EMAIL_RESET_MARKER_VERSION } = await import(
    '../src/email/services/DemoDataCleanupService'
  );
  const { emailThreadService } = await import('../src/email/services/EmailThreadService');
  const { emailDispatchService } = await import('../src/email/services/EmailDispatchService');
  const { emailSyncService } = await import('../src/email/services/EmailSyncService');
  const { emailAiIntelligenceService } = await import('../src/email/services/EmailAiIntelligenceService');
  const { EmailGovernanceService } = await import('../src/email/services/EmailGovernanceService');
  const { EmailAuditService } = await import('../src/email/services/EmailAuditService');
  const { createCleanAutoResponderRules } = await import('../src/services/emailEnterpriseSeed');
  const { db } = await import('../src/services/db');
  const { BackgroundWorkerService } = await import('../src/services/backgroundWorkerService');

  await DatabaseMigrationService.runPendingMigrations();
  const adapter = PostgresPersistenceAdapter.getInstance();
  await adapter.initialize();
  await EmailGovernanceService.getInstance().initialize();

  console.log('=== PHASE 79.1 COMPLETE EMAIL DATA RESET & CLEAN INSTALLATION VERIFICATION ===');

  // 1. Clean Initial Boot Without Pre-Seeded Mailboxes or Demo Data
  await runCheck('R79.1-01-CLEAN-INITIAL-BOOT', () => {
    assert.equal(connectorRegistry.listConnections().length, 0, 'connectorRegistry must start with 0 mailboxes');
    assert.equal(oAuthService.listStoredVaultKeys().length, 0, 'OAuth token vault must start empty');
    const state = db.getState();
    assert.equal(state.connectedMailboxes.length, 0, 'db.connectedMailboxes must start empty');
    assert.equal(state.enterpriseEmailThreads.length, 0, 'db.enterpriseEmailThreads must start empty');
    assert.equal(state.followUpTasks.length, 0, 'db.followUpTasks must start empty');
    const rules = createCleanAutoResponderRules();
    assert.ok(rules.length > 0 && rules.every((r) => r.enabled === false), 'All auto-responder rules start disabled');
    assert.ok(state.donorProfiles.length > 0, 'Donor CRM preserved');
    assert.ok(state.grantPipeline.length > 0, 'Grant pipeline preserved');
    return '0 connections, 0 vault keys, 0 threads/follow-ups, all auto-responders disabled, non-email domains intact.';
  });

  // 2. Seed Email Data + 5 Mailboxes + Tokens + Legal Hold + Unrelated Domain Data -> Dry-Run Backup & Checksum
  let dryRunApprovalToken = '';
  let dryRunBackupPath = '';
  const donorCountBefore = db.getState().donorProfiles.length;
  const grantCountBefore = db.getState().grantPipeline.length;

  await runCheck('R79.1-02-COMPLETE-RESET-DRY-RUN-AND-BACKUP', async () => {
    connectorRegistry.seedCanonicalConnectionsForTesting();
    const seededConns = connectorRegistry.listConnections();
    for (const email of [
      'info@phumulani.org',
      'donations@phumulani.org',
      'grants@phumulani.org',
      'executive@phumulani.org',
      'partnerships@phumulani.org',
    ]) {
      assert.ok(
        seededConns.some((c) => c.emailAddress.toLowerCase() === email),
        `Seeded connection missing: ${email}`
      );
    }

    const secretAccessToken = 'ya29.secret-phase79-1-access-token';
    const secretRefreshToken = '1//secret-phase79-1-refresh-token';
    oAuthService.storeEncryptedTokens('info@phumulani.org', {
      accessToken: secretAccessToken,
      refreshToken: secretRefreshToken,
      tokenType: 'Bearer',
      expiresAt: Date.now() + 3600_000,
      verifiedEmail: 'info@phumulani.org',
      provider: 'GOOGLE',
      updatedAt: new Date().toISOString(),
    });

    await adapter.insert('email_threads', {
      id: 'th-reset-normal-01',
      threadSubject: 'Operational Email Thread To Delete',
      mailboxEmail: 'info@phumulani.org',
    });
    await adapter.insert('email_messages', {
      id: 'msg-reset-normal-01',
      threadId: 'th-reset-normal-01',
      subject: 'Operational Email Message To Delete',
    });
    await adapter.insert('email_attachments', {
      id: 'att-reset-normal-01',
      threadId: 'th-reset-normal-01',
      filename: 'statement.pdf',
    });

    // Legal-held thread + active hold
    await adapter.insert('email_threads', {
      id: 'th-reset-legalhold-01',
      threadSubject: 'Legally Retained Thread',
      mailboxEmail: 'executive@phumulani.org',
    });
    await EmailGovernanceService.getInstance().createLegalHold({
      title: 'Phase 79.1 Audit Retention Hold',
      reason: 'Regulatory retention test',
      targetType: 'THREAD',
      targetValue: 'th-reset-legalhold-01',
      createdBy: 'u-master-admin',
    });

    // Draft + Dispatch + Email background job + Unrelated grant job + Donor row
    await emailDispatchService.createDraft({
      mailboxId: 'conn-google-info_phumulani_org',
      to: ['donor@example.org'],
      subject: 'Draft to delete on reset',
      bodyText: 'Reset target draft',
      authorId: 'staff-01',
      authorRole: 'staff',
    });
    await adapter.insert('email_outbound_dispatch', {
      id: 'disp-reset-01',
      senderAccount: 'info@phumulani.org',
      deliveryStatus: 'STAGED',
    });
    await adapter.insert('background_jobs', {
      id: 'job-reset-email-01',
      type: 'INCREMENTAL_EMAIL_SYNC',
      status: 'PENDING',
    });
    await adapter.insert('background_jobs', {
      id: 'job-reset-grant-01',
      type: 'GRANT_DEADLINE_MONITOR',
      status: 'PENDING',
    });
    await adapter.insert('donors', {
      id: 'dnr-reset-preserve-01',
      name: 'Preserved Philanthropic Partner',
    });

    const dryRun = await demoDataCleanupService.createCompleteResetDryRun({
      actorId: 'u-master-admin',
      actorName: 'Master Admin',
      actorRole: 'PLATFORM_SUPER_ADMIN',
    });

    assert.equal(dryRun.resetMarkerVersion, CLEAN_EMAIL_RESET_MARKER_VERSION);
    assert.ok(fs.existsSync(dryRun.backupFilePath), 'Backup file must exist on disk');
    const rawBackup = fs.readFileSync(dryRun.backupFilePath, 'utf8');
    const computedHash = crypto.createHash('sha256').update(rawBackup).digest('hex');
    assert.equal(dryRun.backupChecksum, computedHash, 'Backup SHA-256 checksum must match disk contents');
    assert.equal(rawBackup.includes(secretAccessToken), false, 'Backup must not leak plaintext access token');
    assert.equal(rawBackup.includes(secretRefreshToken), false, 'Backup must not leak plaintext refresh token');
    assert.ok(dryRun.legalHoldPreservedCount >= 1, 'Legal hold record must be marked preserved');
    assert.ok(dryRun.legalHoldPreservedIds.includes('th-reset-legalhold-01'));
    assert.ok(dryRun.mailboxConnectionsToRemove.some((c) => c.emailAddress === 'info@phumulani.org'));
    assert.equal(dryRun.protectedDomainsExcluded.donorsAndCrmExcluded, true);
    assert.equal(dryRun.protectedDomainsExcluded.grantsExcluded, true);
    assert.equal(dryRun.protectedDomainsExcluded.safeguardingRecordsExcluded, true);
    assert.equal(dryRun.protectedDomainsExcluded.immutableAuditLedgerExcluded, true);

    dryRunApprovalToken = dryRun.approvalToken;
    dryRunBackupPath = dryRun.backupFilePath;
    return `Dry-run verified: items=${dryRun.totalOperationalItemsFound}, legalHolds=${dryRun.legalHoldPreservedCount}, sha256=${dryRun.backupChecksum.slice(0, 12)}...`;
  });

  // 3. Explicit Confirmation Guard & Complete Reset Execution
  await runCheck('R79.1-03-EXPLICIT-CONFIRMATION-AND-EXECUTION', async () => {
    await assert.rejects(
      () =>
        demoDataCleanupService.executeCompleteReset({
          actorId: 'u-master-admin',
          actorName: 'Master Admin',
          actorRole: 'PLATFORM_SUPER_ADMIN',
          adminApproved: false,
          approvalToken: dryRunApprovalToken,
          attemptProviderRevocation: false,
        }),
      /ADMIN_APPROVAL_REQUIRED/
    );

    await assert.rejects(
      () =>
        demoDataCleanupService.executeCompleteReset({
          actorId: 'u-master-admin',
          actorName: 'Master Admin',
          actorRole: 'PLATFORM_SUPER_ADMIN',
          adminApproved: true,
          approvalToken: 'forged-reset-token',
          attemptProviderRevocation: false,
        }),
      /INVALID_APPROVAL_TOKEN/
    );

    const execRes = await demoDataCleanupService.executeCompleteReset({
      actorId: 'u-master-admin',
      actorName: 'Master Admin',
      actorRole: 'PLATFORM_SUPER_ADMIN',
      adminApproved: true,
      approvalToken: dryRunApprovalToken,
      attemptProviderRevocation: false,
    });
    assert.equal(execRes.success, true);
    assert.equal(execRes.resetMarkerVersion, CLEAN_EMAIL_RESET_MARKER_VERSION);
    assert.ok(execRes.totalDeleted >= 5, `Expected >= 5 deleted items, got ${execRes.totalDeleted}`);
    assert.ok(fs.existsSync(dryRunBackupPath), 'Verified backup retained on disk after reset');

    // Replay rejection
    await assert.rejects(
      () =>
        demoDataCleanupService.executeCompleteReset({
          actorId: 'u-master-admin',
          actorName: 'Master Admin',
          actorRole: 'PLATFORM_SUPER_ADMIN',
          adminApproved: true,
          approvalToken: dryRunApprovalToken,
          attemptProviderRevocation: false,
        }),
      /APPROVAL_TOKEN_ALREADY_CONSUMED/
    );

    // Verify all operational email data cleared, legal hold + non-email records preserved
    assert.equal(connectorRegistry.listConnections().length, 0, '0 mailbox connections remain');
    assert.equal(oAuthService.listStoredVaultKeys().length, 0, '0 vaulted OAuth tokens remain');

    const threads = await adapter.select<any>('email_threads');
    assert.equal(threads.some((t) => t.id === 'th-reset-normal-01'), false, 'Non-held thread deleted');
    assert.equal(threads.some((t) => t.id === 'th-reset-legalhold-01'), true, 'Legal-held thread preserved');
    assert.equal((await adapter.select<any>('email_messages')).length, 0, '0 email messages remain');
    assert.equal((await adapter.select<any>('email_attachments')).length, 0, '0 email attachments remain');
    assert.equal((await adapter.select<any>('email_drafts')).length, 0, '0 email drafts remain');
    assert.equal((await adapter.select<any>('email_outbound_dispatch')).length, 0, '0 dispatches remain');

    const remainingJobs = await adapter.select<any>('background_jobs');
    assert.equal(remainingJobs.some((j) => j.id === 'job-reset-email-01'), false, 'Email job purged');
    assert.equal(remainingJobs.some((j) => j.id === 'job-reset-grant-01'), true, 'Grant job preserved');

    const donors = await adapter.select<any>('donors');
    assert.equal(donors.some((d) => d.id === 'dnr-reset-preserve-01'), true, 'Donor DB record preserved');
    assert.equal(db.getState().donorProfiles.length, donorCountBefore, 'Donor profiles intact');
    assert.equal(db.getState().grantPipeline.length, grantCountBefore, 'Grant pipeline intact');

    assert.equal(await EmailAuditService.getInstance().verifyLedgerIntegrity(), true, 'Audit ledger chain valid');
    return `Deleted=${execRes.totalDeleted}, vaultPurged=${execRes.vaultEntriesPurged}, legalHoldsPreserved=${execRes.legalHoldPreservedCount}.`;
  });

  // 4. Restart & Versioned Reset Marker Persistence
  await runCheck('R79.1-04-RESTART-AND-RESET-MARKER', () => {
    const marker = connectorRegistry.getResetMarker();
    assert.ok(marker, 'Reset marker file must exist on disk');
    assert.equal(marker?.version, CLEAN_EMAIL_RESET_MARKER_VERSION);

    connectorRegistry.reloadDurableState();
    assert.equal(connectorRegistry.listConnections().length, 0, 'Reloading registry must keep 0 connections');
    assert.equal(
      connectorRegistry.getResetMarker()?.version,
      CLEAN_EMAIL_RESET_MARKER_VERSION,
      'Reset marker persists across reload'
    );
    return `Reset marker ${marker?.version} persisted across reload with 0 auto-recreated mailboxes.`;
  });

  // 5. Block 4 Operation Locks (In-Process Services + Background Worker + Express HTTP 409)
  await runCheck('R79.1-05-EMAIL-OPERATIONS-DISABLED-LOCKS', async () => {
    const syncAll = await emailSyncService.syncAllActiveMailboxes();
    assert.equal(syncAll.length, 0, 'syncAllActiveMailboxes must return 0 results when disabled');

    const schedRes = await emailDispatchService.processDueScheduledDispatches();
    assert.equal(schedRes.disabled, true);
    assert.equal(schedRes.reason, 'NO_MAILBOXES_CONNECTED');

    await assert.rejects(
      () =>
        emailAiIntelligenceService.generateDraftReply({
          mailboxEmail: 'info@phumulani.org',
          subject: '',
          incomingBody: '',
        }),
      /EMAIL_OPERATION_DISABLED|nonexistent or empty/i
    );

    const worker = BackgroundWorkerService.getInstance();
    await worker.enqueueJob('INCREMENTAL_EMAIL_SYNC', { mailboxId: 'info@phumulani.org' });
    await worker.runWorkerCycle(5);
    await worker.waitForIdle();
    assert.equal(connectorRegistry.listConnections().length, 0, 'Background worker did not recreate mailbox connections');

    // Verify Express HTTP 409 EMAIL_OPERATIONS_DISABLED locks & /api/admin/email/reset/status
    const port = 3098;
    const baseUrl = `http://127.0.0.1:${port}`;
    const proc = spawn('node', ['--import', 'tsx', 'server.ts', '--port', String(port)], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PORT: String(port),
        PHUMULANI_RUNTIME_DATA_DIR: tempRuntimeDir,
        PHUMULANI_OPERATIONAL_MODE: 'STAGED_DEVELOPMENT',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    try {
      await waitForServer(baseUrl, 25000);

      const sessRes = await fetch(`${baseUrl}/api/auth/staged-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'u-master-admin',
          email: 'admin@phumulani.org',
          role: 'PLATFORM_SUPER_ADMIN',
        }),
      });
      assert.equal(sessRes.status, 200);
      const sessJson: any = await sessRes.json();
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessJson.sessionToken || sessJson.token}`,
      };

      const statusRes = await fetch(`${baseUrl}/api/admin/email/reset/status`, { headers });
      assert.equal(statusRes.status, 200);
      const statusJson: any = await statusRes.json();
      assert.equal(statusJson.cleanInstallation, true);
      assert.equal(statusJson.connectedMailboxesCount, 0);
      assert.equal(statusJson.operationsDisabled, true);
      assert.equal(statusJson.autoSyncEnabled, false);
      assert.equal(statusJson.autoSendingEnabled, false);
      assert.equal(statusJson.resetMarker?.version, CLEAN_EMAIL_RESET_MARKER_VERSION);

      const lockedEndpoints: Array<[string, Record<string, any>]> = [
        ['/api/admin/email/google-workspace/sync/historical', { mailboxEmail: 'info@phumulani.org' }],
        ['/api/admin/email/google-workspace/sync/incremental', { mailboxEmail: 'info@phumulani.org' }],
        ['/api/admin/email/compose', { recipientEmail: 'a@b.org', subject: 'x', bodyText: 'y' }],
        ['/api/admin/email/drafts', { mailboxId: 'info@phumulani.org', to: ['a@b.org'], subject: 'x', bodyText: 'y' }],
        ['/api/admin/email/dispatch', { draftId: 'draft-1' }],
        ['/api/admin/email/ai/draft', { threadId: 'th-nonexistent' }],
        ['/api/admin/email/mailboxes/mbx-info/sync', {}],
      ];

      for (const [endpoint, body] of lockedEndpoints) {
        const res = await fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
        assert.equal(res.status, 409, `Expected 409 on ${endpoint}, got ${res.status}`);
        const json: any = await res.json();
        assert.equal(json.code, 'EMAIL_OPERATIONS_DISABLED', `Expected EMAIL_OPERATIONS_DISABLED on ${endpoint}`);
      }

      // Also verify HTTP reset dry-run + execute round-trip
      const httpDryRunRes = await fetch(`${baseUrl}/api/admin/email/reset/dry-run`, {
        method: 'POST',
        headers,
      });
      assert.equal(httpDryRunRes.status, 200);
      const httpDryRunJson: any = await httpDryRunRes.json();
      assert.ok(httpDryRunJson.report?.approvalToken);

      const httpRejectRes = await fetch(`${baseUrl}/api/admin/email/reset/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          adminApproved: false,
          approvalToken: httpDryRunJson.report.approvalToken,
        }),
      });
      assert.equal(httpRejectRes.status, 400);

      const httpExecRes = await fetch(`${baseUrl}/api/admin/email/reset/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          adminApproved: true,
          approvalToken: httpDryRunJson.report.approvalToken,
          attemptProviderRevocation: false,
        }),
      });
      assert.equal(httpExecRes.status, 200);
      const httpExecJson: any = await httpExecRes.json();
      assert.equal(httpExecJson.success, true);

      return `All ${lockedEndpoints.length} operational email endpoints returned HTTP 409 EMAIL_OPERATIONS_DISABLED; /reset/status & /reset/execute verified.`;
    } finally {
      await stopChild(proc);
    }
  });

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`\n=== PHASE 79.1 VERIFICATION SUMMARY: ${passed}/${results.length} PASSED (${failed} FAILED) ===`);
  fs.rmSync(tempRuntimeDir, { recursive: true, force: true });
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error in Phase 79.1 verification suite:', err);
  fs.rmSync(tempRuntimeDir, { recursive: true, force: true });
  process.exit(1);
});
