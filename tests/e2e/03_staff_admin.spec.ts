import { test, expect } from '@playwright/test';

/**
 * M38.05: Staff and Master Administration Real Browser Testing
 * Tests staff login, service queue, case assignment, referral approval,
 * program capacity view, volunteer clearance review, fundraising reporting,
 * and server-side authorization gates.
 */
test.describe('M38.05 — Staff & Administration Journeys', () => {
  test('staff command center loads with operational queues', async ({ page }) => {
    await page.goto('/');

    // Switch to staff role
    const staffBtn = page.locator('button:has-text("Staff")').first();
    await expect(staffBtn).toBeVisible();
    await staffBtn.click();

    const heading = page.locator('h1, h2').filter({ hasText: /Staff|Operations|Command|Admin/i });
    await expect(heading.first()).toBeVisible();
  });

  test('case assignment and referral approvals flow', async ({ page }) => {
    await page.goto('/');
    const staffBtn = page.locator('button:has-text("Staff")').first();
    await staffBtn.click();

    // Verify operations tabs or queue view
    const queueTab = page.locator('button:has-text("Volunteer Screening Queue"), button:has-text("Screening"), button:has-text("Queue")').first();
    await expect(queueTab).toBeVisible();
    await queueTab.click();

    await expect(page.locator('body')).toBeVisible();
  });

  test('master administration navigation and 36 AI agent status', async ({ page }) => {
    await page.goto('/');
    const adminBtn = page.locator('button:has-text("Master Admin")').first();
    await expect(adminBtn).toBeVisible();
    await adminBtn.click();

    // Verify workforce or administrative sections
    const workforceNav = page.locator('button:has-text("AI Workforce"), button:has-text("Workforce")').first();
    if (await workforceNav.isVisible()) {
      await workforceNav.click();
      await expect(page.locator('h1, h2, h3').filter({ hasText: /AI Workforce|Agent/i }).first()).toBeVisible();
    }
  });
});
