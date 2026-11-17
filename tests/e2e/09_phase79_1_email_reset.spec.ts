import { test, expect } from '@playwright/test';

type MarkerState = 'missing' | 'outdated';

const preservedEmailState = {
  connectedMailboxes: [
    {
      id: 'mbx-preserved-info',
      email: 'info@phumulani.org',
      displayName: 'Organizational mailbox',
      status: 'AUTHORIZATION_REQUIRED',
      provider: 'GOOGLE',
    },
  ],
  enterpriseEmailThreads: [
    {
      id: 'th-preserved-001',
      mailboxId: 'mbx-preserved-info',
      mailboxEmail: 'info@phumulani.org',
      threadSubject: 'Preserved organizational correspondence',
      participantEmails: ['partner@example.org'],
      messages: [
        {
          id: 'msg-preserved-001',
          direction: 'inbound',
          senderEmail: 'partner@example.org',
          bodyText: 'Existing correspondence must survive a storage-version migration.',
          sentAt: '2026-11-01T10:00:00.000Z',
        },
      ],
    },
  ],
  followUpTasks: [{ id: 'followup-preserved-001', threadId: 'th-preserved-001', status: 'pending' }],
  calendarProposals: [{ id: 'calendar-preserved-001', threadId: 'th-preserved-001', status: 'pending' }],
  historicalImportJobs: [{ id: 'import-preserved-001', mailboxId: 'mbx-preserved-info', status: 'completed' }],
  syncCheckpoints: [{ id: 'checkpoint-preserved-001', mailboxId: 'mbx-preserved-info', cursor: 'cursor-preserved' }],
  syncConflicts: [{ id: 'conflict-preserved-001', mailboxId: 'mbx-preserved-info', status: 'open' }],
  syncAuditLogs: [{ id: 'sync-audit-preserved-001', mailboxId: 'mbx-preserved-info', action: 'SYNC_COMPLETED' }],
};

async function seedIndexedDb(page: any) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('phumulani_email_cache', 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('records')) {
          request.result.createObjectStore('records', { keyPath: 'id' });
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction('records', 'readwrite');
        transaction.objectStore('records').put({
          id: 'genuine-cache-preserved-001',
          subject: 'Cached correspondence must survive migration',
        });
        transaction.oncomplete = () => {
          database.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  });
}

async function readIndexedDb(page: any) {
  return page.evaluate(async () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('phumulani_email_cache', 1);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('records')) {
          request.result.createObjectStore('records', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains('records')) {
          database.close();
          resolve(null);
          return;
        }
        const transaction = database.transaction('records', 'readonly');
        const getRequest = transaction.objectStore('records').get('genuine-cache-preserved-001');
        getRequest.onsuccess = () => {
          database.close();
          resolve(getRequest.result || null);
        };
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  });
}

async function seedExistingEmailState(page: any, markerState: MarkerState) {
  await page.evaluate(
    ({ markerState, fixture }: { markerState: MarkerState; fixture: typeof preservedEmailState }) => {
      const raw = localStorage.getItem('phumulani_database_v1');
      const state = raw ? JSON.parse(raw) : {};
      Object.assign(state, fixture);
      if (markerState === 'missing') {
        delete state.emailResetMarkerVersion;
        localStorage.removeItem('phumulani_email_reset_version');
      } else {
        state.emailResetMarkerVersion = 'phase78_legacy_email_storage';
        localStorage.setItem('phumulani_email_reset_version', 'phase78_legacy_email_storage');
      }
      localStorage.setItem('phumulani_database_v1', JSON.stringify(state));
      localStorage.setItem(
        'phumulani_email_cached_threads',
        JSON.stringify([{ id: 'cache-preserved-001', subject: 'Cached correspondence' }])
      );
      sessionStorage.setItem('phumulani_email_session_draft', 'Preserve this existing draft.');
    },
    { markerState, fixture: preservedEmailState }
  );
}

for (const markerState of ['missing', 'outdated'] as const) {
  test(`email storage migration preserves genuine records when marker is ${markerState}`, async ({ page }) => {
    await page.goto('/');
    await seedIndexedDb(page);
    await seedExistingEmailState(page, markerState);
    await page.reload();

    const migrated = await page.evaluate(() => {
      const raw = localStorage.getItem('phumulani_database_v1');
      const state = raw ? JSON.parse(raw) : {};
      return {
        marker: localStorage.getItem('phumulani_email_reset_version'),
        dbMarker: state.emailResetMarkerVersion,
        connectedMailboxes: state.connectedMailboxes,
        enterpriseEmailThreads: state.enterpriseEmailThreads,
        followUpTasks: state.followUpTasks,
        calendarProposals: state.calendarProposals,
        historicalImportJobs: state.historicalImportJobs,
        syncCheckpoints: state.syncCheckpoints,
        syncConflicts: state.syncConflicts,
        syncAuditLogs: state.syncAuditLogs,
        localCache: JSON.parse(localStorage.getItem('phumulani_email_cached_threads') || 'null'),
        sessionDraft: sessionStorage.getItem('phumulani_email_session_draft'),
      };
    });

    expect(migrated.marker).toBe('phase79_1_clean_email_v1');
    expect(migrated.dbMarker).toBe('phase79_1_clean_email_v1');
    expect(migrated.connectedMailboxes).toEqual(preservedEmailState.connectedMailboxes);
    expect(migrated.enterpriseEmailThreads).toEqual(preservedEmailState.enterpriseEmailThreads);
    expect(migrated.followUpTasks).toEqual(preservedEmailState.followUpTasks);
    expect(migrated.calendarProposals).toEqual(preservedEmailState.calendarProposals);
    expect(migrated.historicalImportJobs).toEqual(preservedEmailState.historicalImportJobs);
    expect(migrated.syncCheckpoints).toEqual(preservedEmailState.syncCheckpoints);
    expect(migrated.syncConflicts).toEqual(preservedEmailState.syncConflicts);
    expect(migrated.syncAuditLogs).toEqual(preservedEmailState.syncAuditLogs);
    expect(migrated.localCache).toEqual([{ id: 'cache-preserved-001', subject: 'Cached correspondence' }]);
    expect(migrated.sessionDraft).toBe('Preserve this existing draft.');
    expect(await readIndexedDb(page)).toEqual({
      id: 'genuine-cache-preserved-001',
      subject: 'Cached correspondence must survive migration',
    });
  });
}

test('first boot does not erase independently stored email caches when app state is absent', async ({ page }) => {
  await page.goto('/');
  await seedIndexedDb(page);
  await page.evaluate(() => {
    localStorage.removeItem('phumulani_database_v1');
    localStorage.setItem(
      'phumulani_email_cached_threads',
      JSON.stringify([{ id: 'first-boot-cache-preserved', subject: 'Do not erase' }])
    );
    sessionStorage.setItem('phumulani_email_session_draft', 'First-boot draft remains.');
  });
  await page.reload();

  const result = await page.evaluate(() => ({
    cache: JSON.parse(localStorage.getItem('phumulani_email_cached_threads') || 'null'),
    draft: sessionStorage.getItem('phumulani_email_session_draft'),
  }));
  expect(result.cache).toEqual([{ id: 'first-boot-cache-preserved', subject: 'Do not erase' }]);
  expect(result.draft).toBe('First-boot draft remains.');
  expect(await readIndexedDb(page)).toEqual({
    id: 'genuine-cache-preserved-001',
    subject: 'Cached correspondence must survive migration',
  });
});

test('corrupt persisted state is quarantined before a safe seed fallback', async ({ page }) => {
  await page.goto('/');
  const malformedState = '{"connectedMailboxes":[{"id":"mbx-existing"}],"donorProfiles":';

  await page.evaluate((raw) => {
    localStorage.setItem('phumulani_database_v1', raw);
    localStorage.setItem(
      'phumulani_email_cached_threads',
      JSON.stringify([{ id: 'corrupt-state-cache-preserved', subject: 'Keep this cache' }])
    );
    sessionStorage.setItem('phumulani_email_session_draft', 'Keep this draft.');
  }, malformedState);

  await page.reload();

  const recovery = await page.evaluate(() => {
    const backupKeys: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith('phumulani_database_v1.corrupt.')) backupKeys.push(key);
    }

    let activeStateIsValid = false;
    try {
      const activeState = localStorage.getItem('phumulani_database_v1');
      activeStateIsValid = Boolean(activeState && JSON.parse(activeState));
    } catch {
      activeStateIsValid = false;
    }

    return {
      backupValues: backupKeys.map((key) => localStorage.getItem(key)),
      activeStateIsValid,
      emailCache: JSON.parse(localStorage.getItem('phumulani_email_cached_threads') || 'null'),
      sessionDraft: sessionStorage.getItem('phumulani_email_session_draft'),
    };
  });

  expect(recovery.backupValues).toContain(malformedState);
  expect(recovery.activeStateIsValid).toBe(true);
  expect(recovery.emailCache).toEqual([
    { id: 'corrupt-state-cache-preserved', subject: 'Keep this cache' },
  ]);
  expect(recovery.sessionDraft).toBe('Keep this draft.');
});
