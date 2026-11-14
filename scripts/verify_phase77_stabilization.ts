/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 77 Bulk Repair & Production Stabilization Suite
 *
 * Covers:
 * 1. PR #22: db.syncMailbox blocks in PRODUCTION_ONLY and never marks mailbox connected or alters lastSyncedAt
 * 2. Manual State Fabrication Prevention: db.addConnectedMailbox / db.updateConnectedMailbox clamp live CONNECTED/SYNCING/authorized
 * 3. Block 77.7 PostgreSQL Fail-Closed Write Guarantee: insertDurableWithRetry throws CRITICAL_AUDIT_PERSISTENCE_FAILURE when PG pool fails
 * 4. PR #21 + UI Integrity Guard: EmailCommandCenterView contains no manual Reconnect CONNECTED promotion or CONNECTED/SYNCING modal options
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phumulani-phase77-'));
process.env.PHUMULANI_RUNTIME_DATA_DIR = tempDir;
process.env.PHUMULANI_OPERATIONAL_MODE = 'STAGED_DEVELOPMENT';

let passed = 0;

async function check(name: string, fn: () => Promise<void> | void) {
  await fn();
  console.log(`[PASS] ${name}`);
  passed++;
}

async function main() {
  const { EnvironmentService } = await import('../src/services/environmentService');
  const { db } = await import('../src/services/db');
  const { PostgresPersistenceAdapter } = await import('../src/services/postgresPersistenceAdapter');

  await check('P77-01: PR #22 db.syncMailbox fails closed in PRODUCTION_ONLY', () => {
    const prevMode = process.env.PHUMULANI_OPERATIONAL_MODE;
    try {
      process.env.PHUMULANI_OPERATIONAL_MODE = 'PRODUCTION_ONLY';
      EnvironmentService.setOperationalMode('PRODUCTION_ONLY');
      assert.throws(() => db.syncMailbox('mbx-info'), /PRODUCTION_GUARD/);
    } finally {
      process.env.PHUMULANI_OPERATIONAL_MODE = prevMode || 'STAGED_DEVELOPMENT';
      EnvironmentService.setOperationalMode('STAGED_DEVELOPMENT');
    }
  });

  await check('P77-02: PR #22 db.syncMailbox never promotes DISCONNECTED/AUTHORIZATION_REQUIRED to connected or updates lastSyncedAt', () => {
    const mbx = db.addConnectedMailbox({
      email: `p77-sync-${Date.now()}@phumulani.org`,
      displayName: 'P77 Sync Guard Test',
      department: 'DEPT-OPS',
      status: 'DISCONNECTED',
      lastSyncedAt: '2026-01-01T00:00:00.000Z',
    });
    const logsBefore = db.getState().auditLogs.length;
    db.syncMailbox(mbx.id);
    const updated = db.getState().connectedMailboxes.find((m) => m.id === mbx.id);
    assert.ok(updated);
    assert.equal(updated.status, 'DISCONNECTED');
    assert.equal(updated.lastSyncedAt, '2026-01-01T00:00:00.000Z');
    assert.ok(db.getState().auditLogs.length >= logsBefore + 1);
    db.deleteConnectedMailbox(mbx.id);
  });

  await check('P77-03: Client addConnectedMailbox and updateConnectedMailbox clamp fabricated CONNECTED/SYNCING/authorized states', () => {
    const created = db.addConnectedMailbox({
      email: `p77-clamp-${Date.now()}@phumulani.org`,
      displayName: 'P77 Clamp Test',
      department: 'DEPT-DEV',
      status: 'CONNECTED' as any,
      connectionState: 'SYNCING' as any,
      authStatus: 'authorized' as any,
    });
    assert.equal(created.status, 'AUTHORIZATION_REQUIRED');
    assert.equal(created.connectionState, 'AUTHORIZATION_REQUIRED');
    assert.notEqual(created.authStatus, 'authorized');

    db.updateConnectedMailbox(created.id, {
      displayName: 'P77 Updated Name',
      status: 'CONNECTED' as any,
      connectionState: 'CONNECTED' as any,
      authStatus: 'authorized',
    });
    const afterLiveAttempt = db.getState().connectedMailboxes.find((m) => m.id === created.id);
    assert.ok(afterLiveAttempt);
    assert.equal(afterLiveAttempt.displayName, 'P77 Updated Name');
    assert.notEqual(afterLiveAttempt.status, 'CONNECTED');
    assert.notEqual(afterLiveAttempt.authStatus, 'authorized');

    db.updateConnectedMailbox(created.id, { status: 'DISCONNECTED' });
    const afterDisconnect = db.getState().connectedMailboxes.find((m) => m.id === created.id);
    assert.equal(afterDisconnect?.status, 'DISCONNECTED');
    db.deleteConnectedMailbox(created.id);
  });

  await check('P77-04: PostgresPersistenceAdapter.insertDurableWithRetry fails closed when active PG pool write fails', async () => {
    const adapter = PostgresPersistenceAdapter.getInstance();
    await adapter.initialize();
    const origInsert = adapter.insert.bind(adapter);
    const origPool = (adapter as any).pool;
    (adapter as any).pool = { fakePoolForFailClosedTest: true };
    (adapter as any).insert = async () => {
      throw new Error('PG_WRITE_CONNECTION_LOST');
    };
    try {
      await assert.rejects(
        () =>
          adapter.insertDurableWithRetry('audit_events', {
            id: `p77-pg-fail-${Date.now()}`,
            action: 'test:pg_fail_closed',
          }),
        /CRITICAL_AUDIT_PERSISTENCE_FAILURE/
      );
    } finally {
      (adapter as any).pool = origPool;
      (adapter as any).insert = origInsert;
    }
  });

  await check('P77-05: PR #21 & Block 77.3 static UI check — no db.syncMailbox, manual Reconnect CONNECTED, or manual CONNECTED/SYNCING modal options', () => {
    const emailViewSrc = fs.readFileSync(
      path.resolve(process.cwd(), 'src/views/EmailCommandCenterView.tsx'),
      'utf8'
    );
    assert.equal(emailViewSrc.includes('db.syncMailbox'), false, 'EmailCommandCenterView must not call db.syncMailbox');
    assert.equal(
      emailViewSrc.includes('<option value="CONNECTED">'),
      false,
      'Manual mailbox modals must not expose CONNECTED option'
    );
    assert.equal(
      emailViewSrc.includes('<option value="SYNCING">'),
      false,
      'Manual mailbox modals must not expose SYNCING option'
    );
    assert.equal(
      /db\.updateConnectedMailbox\([^)]*authStatus:\s*'authorized'/.test(emailViewSrc),
      false,
      'Manual UI controls must not promote authStatus to authorized'
    );
  });

  console.log(`\n=== PHASE 77 STABILIZATION SUMMARY: ${passed}/5 PASSED ===`);
  fs.rmSync(tempDir, { recursive: true, force: true });
}

main().catch((err) => {
  console.error('PHASE 77 VERIFICATION FAILED:', err);
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {}
  process.exit(1);
});
