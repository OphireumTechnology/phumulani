import { test, expect } from '@playwright/test';

/**
 * Phase 79.1 — Complete Email Data Reset & Clean Installation E2E Verification
 * Verifies:
 *  - Stale browser localStorage / sessionStorage email caches & demo data cannot rehydrate across reload
 *  - All 8 Block 5 counters read 0 and synchronization/automatic sending statuses read Disabled
 *  - Clean empty state ("No Email Accounts Connected" + exact copy + "Connect Email Account" CTA)
 *  - Primary CTA opens the Connect Email Account Wizard
 *  - Switching personas and reloading never restores demo messages
 *  - Unrelated Donor CRM / organizational records remain intact
 *  - Zero console errors or uncaught page errors across desktop & mobile
 */

async function openEmailCommandCenter(page: any, userId = 'u-master-admin') {
  const roleSwitcher = page.locator('select#role-simulation-select');
  if ((await roleSwitcher.count()) === 0) {
    const adminTools = page.getByRole('button', { name: /Admin Tools/i });
    await expect(adminTools).toBeVisible();
    await adminTools.click();
  }
  await roleSwitcher.selectOption(userId, { force: true });

  const emailNav = page.getByRole('button', { name: /Email Command Center/i }).first();
  const sidebarToggle = page.getByRole('button', { name: 'Toggle Navigation Sidebar' });
  if (!(await emailNav.isVisible()) && (await sidebarToggle.isVisible())) {
    await sidebarToggle.click();
  }
  await expect(emailNav).toBeVisible();
  await emailNav.click();
}

test.describe('Phase 79.1 — Complete Email Data Reset & Clean Installation', () => {
  test('purges stale cached email state via versioned reset marker, renders 0-counter clean command center, and preserves CRM data', async ({
    page,
  }, testInfo) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('Permissions policy violation: unload is not allowed in this document.')) return;
        if (/^WebSocket connection to 'ws:\/\/localhost:24678\/\?token=[^']+' failed:/.test(text)) return;
        if (/^\[vite\] failed to connect to websocket \(Error: WebSocket closed without opened\.\)/.test(text)) return;
        if (text.includes('/@vite/client') && /localhost:24678/.test(text) && /WebSocket|connection to the server/.test(text)) {
          return;
        }
        consoleErrors.push(text);
      }
    });
    page.on('pageerror', (err) => {
      if (!err.message.includes('WebSocket')) pageErrors.push(err.message);
    });

    // 1. Navigate to app first so localStorage/sessionStorage can be seeded with stale pre-reset state
    await page.goto('/');

    await page.evaluate(() => {
      const existingRaw = localStorage.getItem('phumulani_database_v1');
      const baseDb = existingRaw ? JSON.parse(existingRaw) : {};
      delete baseDb.emailResetMarkerVersion;

      baseDb.connectedMailboxes = [
        {
          id: 'mbx-stale-info',
          email: 'info@phumulani.org',
          displayName: 'Stale Info Mailbox',
          status: 'AUTHORIZATION_REQUIRED',
        },
        {
          id: 'mbx-stale-donations',
          email: 'donations@phumulani.org',
          displayName: 'Stale Donations Mailbox',
          status: 'AUTHORIZATION_REQUIRED',
        },
      ];
      baseDb.enterpriseEmailThreads = [
        {
          id: 'th-stale-demo-01',
          mailboxId: 'mbx-stale-info',
          mailboxEmail: 'info@phumulani.org',
          threadSubject: 'STALE DEMO MESSAGE SHOULD BE PURGED',
          participantEmails: ['sarah.jenkins@example.org'],
          classification: '02_donor_major',
          priority: 'P1',
          folder: 'INBOX',
          isRead: false,
          isArchived: false,
          isHistorical: false,
          lastMessageAt: new Date().toISOString(),
          messages: [
            {
              id: 'msg-stale-01',
              direction: 'inbound',
              senderEmail: 'sarah.jenkins@example.org',
              senderName: 'Sarah Jenkins',
              bodyText: 'Old demo message content that must never survive reset.',
              sentAt: new Date().toISOString(),
            },
          ],
        },
      ];
      baseDb.followUpTasks = [
        {
          id: 'fu-stale-01',
          threadId: 'th-stale-demo-01',
          title: 'Stale follow-up task',
          status: 'pending',
          dueDate: new Date().toISOString(),
        },
      ];
      baseDb.donorProfiles = [
        ...(Array.isArray(baseDb.donorProfiles) ? baseDb.donorProfiles : []),
        {
          id: 'dnr-phase79-1-preserved',
          name: 'Phase 79.1 Preserved Donor',
          email: 'preserved.donor@example.org',
          tier: 'Major Donor',
          totalGiven: 25000,
        },
      ];

      localStorage.setItem('phumulani_database_v1', JSON.stringify(baseDb));
      localStorage.removeItem('phumulani_email_reset_version');
      localStorage.setItem('phumulani_email_cached_threads', JSON.stringify([{ id: 'th-stale-cache' }]));
      sessionStorage.setItem('phumulani_email_session_draft', 'stale draft');
    });

    // 2. Reload so db.loadState() executes versioned reset migration
    await page.reload();

    const migrationResult = await page.evaluate(() => {
      const dbRaw = localStorage.getItem('phumulani_database_v1');
      const parsed = dbRaw ? JSON.parse(dbRaw) : {};
      return {
        marker: localStorage.getItem('phumulani_email_reset_version'),
        dbMarker: parsed.emailResetMarkerVersion,
        staleLocalCache: localStorage.getItem('phumulani_email_cached_threads'),
        staleSessionCache: sessionStorage.getItem('phumulani_email_session_draft'),
        mailboxesLen: (parsed.connectedMailboxes || []).length,
        threadsLen: (parsed.enterpriseEmailThreads || []).length,
        followUpsLen: (parsed.followUpTasks || []).length,
        preservedDonorExists: (parsed.donorProfiles || []).some(
          (d: any) => d.id === 'dnr-phase79-1-preserved'
        ),
      };
    });

    expect(migrationResult.marker).toBe('phase79_1_clean_email_v1');
    expect(migrationResult.dbMarker).toBe('phase79_1_clean_email_v1');
    expect(migrationResult.staleLocalCache).toBeNull();
    expect(migrationResult.staleSessionCache).toBeNull();
    expect(migrationResult.mailboxesLen).toBe(0);
    expect(migrationResult.threadsLen).toBe(0);
    expect(migrationResult.followUpsLen).toBe(0);
    expect(migrationResult.preservedDonorExists).toBe(true);

    // 3. Open Email Command Center and verify all Block 5 required states
    await openEmailCommandCenter(page, 'u-master-admin');

    const summaryStrip = page.getByTestId('email-summary-strip');
    await expect(summaryStrip).toBeVisible();

    await expect(page.getByTestId('metric-connected-mailboxes')).toContainText('Connected mailboxes');
    await expect(page.getByTestId('metric-connected-mailboxes')).toContainText('0');
    await expect(page.getByTestId('metric-inbox')).toContainText('Inbox');
    await expect(page.getByTestId('metric-inbox')).toContainText('0');
    await expect(page.getByTestId('metric-unread')).toContainText('Unread');
    await expect(page.getByTestId('metric-unread')).toContainText('0');
    await expect(page.getByTestId('metric-priority')).toContainText('Priority');
    await expect(page.getByTestId('metric-priority')).toContainText('0');
    await expect(page.getByTestId('metric-drafts')).toContainText('Drafts');
    await expect(page.getByTestId('metric-drafts')).toContainText('0');
    await expect(page.getByTestId('metric-sent')).toContainText('Sent');
    await expect(page.getByTestId('metric-sent')).toContainText('0');
    await expect(page.getByTestId('metric-awaiting-approval')).toContainText('Awaiting approval');
    await expect(page.getByTestId('metric-awaiting-approval')).toContainText('0');
    await expect(page.getByTestId('metric-follow-ups')).toContainText('Follow-ups');
    await expect(page.getByTestId('metric-follow-ups')).toContainText('0');

    await expect(page.getByTestId('status-active-sync')).toContainText(/Active email synchronization:\s*Disabled/);
    await expect(page.getByTestId('status-auto-sending')).toContainText(/Automatic email sending:\s*Disabled/);

    // Empty state copy & CTA
    const emptyState = page.getByTestId('email-clean-empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState.getByText('No Email Accounts Connected')).toBeVisible();
    await expect(
      emptyState.getByText(
        'Your Email Command Center is ready. Connect and authorize your organizational email accounts to begin receiving and managing messages.'
      )
    ).toBeVisible();

    // Ensure zero stale demo data appeared anywhere
    await expect(page.getByText('STALE DEMO MESSAGE SHOULD BE PURGED')).toHaveCount(0);
    await expect(page.getByText('Sarah Jenkins')).toHaveCount(0);

    if (process.env.CAPTURE_E2E_SCREENSHOTS === '1') {
      const slug = testInfo.project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await page.screenshot({ path: `/tmp/p79-1-clean-email-${slug}.png`, fullPage: false });
    }

    // 4. Primary CTA launches Connection Wizard cleanly
    await emptyState.getByRole('button', { name: 'Connect Email Account', exact: true }).click();
    await expect(page.locator('input[type="email"][placeholder*="phumulani.org"]')).toBeVisible();
    await page.locator('button:has-text("✕")').first().click();

    // 5. Switch personas and reload — verify demo records do NOT regenerate and donor CRM remains preserved
    const roleSwitcher = page.locator('select#role-simulation-select');
    if ((await roleSwitcher.count()) === 0) {
      await page.getByRole('button', { name: /Admin Tools/i }).click();
    }
    await roleSwitcher.selectOption('u-exec', { force: true });
    await page.reload();
    await openEmailCommandCenter(page, 'u-master-admin');

    await expect(page.getByTestId('email-clean-empty-state')).toBeVisible();
    await expect(page.getByTestId('metric-connected-mailboxes')).toContainText('0');
    await expect(page.getByText('STALE DEMO MESSAGE SHOULD BE PURGED')).toHaveCount(0);

    const donorStillIntact = await page.evaluate(() => {
      const parsed = JSON.parse(localStorage.getItem('phumulani_database_v1') || '{}');
      return (parsed.donorProfiles || []).some((d: any) => d.id === 'dnr-phase79-1-preserved');
    });
    expect(donorStillIntact).toBe(true);

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
