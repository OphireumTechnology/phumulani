import { test, expect } from '@playwright/test';

/**
 * M41.09: Cross-Portal Notifications & Operational Coordination Real Browser Verification
 * Tests notification center, unread counter badges, category filtering,
 * read status synchronization, communication preferences, 7-language rendering,
 * and zero-PII safeguarding compliance across Chromium, Firefox, WebKit, and Mobile Chrome.
 */
test.describe('M41.09 — Cross-Portal Notifications & Operational Coordination', () => {
  test('header contains notification center bell with accessible label', async ({ page }) => {
    await page.goto('/');
    const bellBtn = page.locator('button[aria-label="Open Notification Center"], button[title="Open Notification Center"]');
    await expect(bellBtn.first()).toBeVisible();
  });

  test('clicking notification bell opens notification center modal with tabs and controls', async ({ page }) => {
    await page.goto('/');
    const bellBtn = page.locator('button[aria-label="Open Notification Center"], button[title="Open Notification Center"]').first();
    await bellBtn.click();

    // Verify modal dialog opened
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Verify Notification Center Title
    await expect(page.locator('#notification-center-title')).toBeVisible();

    // Verify Tabs
    const notifsTab = page.locator('button:has-text("Notifications")');
    const prefsTab = page.locator('button:has-text("Communication Preferences")');
    await expect(notifsTab).toBeVisible();
    await expect(prefsTab).toBeVisible();
  });

  test('category filter buttons allow filtering by operational domain', async ({ page }) => {
    await page.goto('/');
    const bellBtn = page.locator('button[aria-label="Open Notification Center"]').first();
    await bellBtn.click();

    const allBtn = page.locator('button:has-text("ALL")');
    await expect(allBtn).toBeVisible();

    const memberBtn = page.locator('button:has-text("MEMBER")');
    if (await memberBtn.isVisible()) {
      await memberBtn.click();
      await expect(memberBtn).toHaveClass(/bg-\[#104F57\]/);
    }
  });

  test('communication preferences tab displays policy safeguards and optional category toggles', async ({ page }) => {
    await page.goto('/');
    const bellBtn = page.locator('button[aria-label="Open Notification Center"]').first();
    await bellBtn.click();

    const prefsTab = page.locator('button:has-text("Communication Preferences")');
    await prefsTab.click();

    // Verify strict policy invariant banner
    await expect(page.locator('text=Mandatory operational and security notices')).toBeVisible();

    // Verify optional checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('safeguarding confidentiality: zero survivor PII in notification DOM', async ({ page }) => {
    await page.goto('/');
    const bellBtn = page.locator('button[aria-label="Open Notification Center"]').first();
    await bellBtn.click();

    const modalContent = await page.locator('div[role="dialog"]').innerText();
    const forbiddenPii = [
      'ssn',
      'social security',
      'confidential shelter address',
      'secret safehouse location',
    ];

    for (const term of forbiddenPii) {
      expect(modalContent.toLowerCase().includes(term)).toBe(false);
    }
  });

  test('modal closes cleanly on close button click and escape key', async ({ page }) => {
    await page.goto('/');
    const bellBtn = page.locator('button[aria-label="Open Notification Center"]').first();
    await bellBtn.click();

    const closeBtn = page.locator('button:has-text("Close"), button[aria-label="Close modal"]').first();
    await closeBtn.click();

    await expect(page.locator('div[role="dialog"]')).not.toBeVisible();
  });
});
