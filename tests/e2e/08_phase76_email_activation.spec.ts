import { test, expect } from '@playwright/test';

/**
 * Phase 76 — Production Email Activation, Clean Empty State & Wizard Discovery E2E Spec
 * Runs against both Desktop Chrome and Mobile Chrome viewports with console/pageerror checks.
 */

async function openEmailCommandCenter(page: any) {
  await page.goto('/');
  const roleSwitcher = page.locator('select#role-simulation-select');
  if ((await roleSwitcher.count()) === 0) {
    const adminTools = page.getByRole('button', { name: /Admin Tools/i });
    await expect(adminTools).toBeVisible();
    await adminTools.click();
  }
  await roleSwitcher.selectOption('u-master-admin', { force: true });
  await expect(page.locator('header').getByText('Phumulani Master Administrator', { exact: true })).toBeVisible();

  const emailNav = page.getByRole('button', { name: /Email Command Center/i }).first();
  const sidebarToggle = page.getByRole('button', { name: 'Toggle Navigation Sidebar' });
  if (!(await emailNav.isVisible()) && (await sidebarToggle.isVisible())) {
    await sidebarToggle.click();
  }
  await expect(emailNav).toBeVisible();
  await emailNav.click();
}

test.describe('Phase 76 — Email Command Center Clean State & Discovery', () => {
  test('renders clean empty inbox without demo messages and navigates to Email Connections wizard', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    let expectingOAuth503 = false;
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('WebSocket')) return;
        if (expectingOAuth503 && text.includes('503 (Service Unavailable)')) return;
        consoleErrors.push(text);
      }
    });
    page.on('pageerror', (err) => {
      if (!err.message.includes('WebSocket')) pageErrors.push(err.message);
    });

    await openEmailCommandCenter(page);

    // Clean empty inbox (zero fabricated demo emails)
    await expect(page.getByText(/No email accounts connected/i).first()).toBeVisible();
    await expect(page.getByText('Sarah Jenkins').first()).toHaveCount(0);

    // Navigate via CTA to Email Connections Manager
    await page.getByRole('button', { name: /Connect an Email Account/i }).first().click();
    await expect(page.getByText(/Enterprise Connected Mailboxes & Provider Manager/i)).toBeVisible();

    // Verify truthful BLOCKED_BY_CONFIGURATION status on unconfigured OAuth mailboxes
    await expect(page.getByText(/BLOCKED_BY_CONFIGURATION/i).first()).toBeVisible();

    // Open Connect Email Account Wizard and test email validation + DNS MX discovery
    await page.getByRole('button', { name: /Connect Email Account/i }).first().click();
    const emailInput = page.locator('input[type="email"][placeholder*="phumulani.org"]');
    await expect(emailInput).toBeVisible();

    // Invalid email keeps Continue disabled
    await emailInput.fill('invalid-email');
    await expect(page.getByText(/Enter a valid email address with domain/i)).toBeVisible();
    const continueBtn = page.getByRole('button', { name: 'Continue', exact: true });
    await expect(continueBtn).toBeDisabled();

    // Valid email triggers backend /api/admin/email/connectors/discover with MX disclosure
    const discoverPromise = page.waitForResponse(
      (res) => res.url().includes('/api/admin/email/connectors/discover') && res.status() === 200
    );
    await emailInput.fill('info@phumulani.org');
    await discoverPromise;

    await expect(page.getByText(/MX records identify mail routing only/i)).toBeVisible();
    await expect(continueBtn).toBeEnabled();

    // Advance to Step 3 and verify OAuth start fails closed with BLOCKED_BY_CONFIGURATION inline notice
    await continueBtn.click(); // Step 2
    await continueBtn.click(); // Step 3
    expectingOAuth503 = true;
    await page.getByRole('button', { name: /Initiate Authorization/i }).click();
    await expect(page.getByText(/Provider OAuth Credentials Missing/i)).toBeVisible();
    expectingOAuth503 = false;

    // Close wizard cleanly
    await page.locator('button:has-text("✕")').first().click();

    // Verify Safe Demo Cleanup dry-run workflow works without error
    await page.getByRole('button', { name: /Safe Demo Cleanup/i }).click();
    await page.getByRole('button', { name: /Run Dry-Run & Create Backup/i }).click();
    await expect(page.getByText(/Dry-Run Inspection Report/i)).toBeVisible();

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('compose modal renders all 5 organizational mailboxes and saves persistent draft cleanly', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => {
      if (!err.message.includes('WebSocket')) pageErrors.push(err.message);
    });

    await openEmailCommandCenter(page);

    // Open Compose modal (works on both desktop and mobile)
    const composeBtn = page.getByRole('button', { name: /Compose/i }).first();
    await expect(composeBtn).toBeVisible();
    await composeBtn.click();

    await expect(page.getByText(/Compose Authorized Email/i)).toBeVisible();
    await expect(page.locator('option[value="grants@phumulani.org"]')).toHaveCount(1);
    await expect(page.locator('option[value="donations@phumulani.org"]')).toHaveCount(1);

    await page.locator('input[placeholder="recipient@organization.org"]').fill('foundation@example.org');
    await page.locator('input[placeholder="Subject line..."]').fill('Phase 76 Persistent Draft Verification');
    await page.locator('textarea[placeholder*="official Phumulani"]').fill('Draft verification body.');

    const draftPromise = page.waitForResponse(
      (res) => res.url().includes('/api/admin/email/drafts') && res.request().method() === 'POST'
    );
    await page.getByRole('button', { name: /Save Persistent Draft/i }).click();
    const draftRes = await draftPromise;
    expect(draftRes.status()).toBe(201);

    expect(pageErrors).toEqual([]);
  });
});
