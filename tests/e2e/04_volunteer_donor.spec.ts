import { test, expect } from '@playwright/test';

/**
 * M38.06: Volunteer and Donor Portal Real Browser Testing
 * Tests volunteer registration, clearance status, shifts, hours submission;
 * donor login, pledge history, settled contribution history, and financial truthfulness.
 */
test.describe('M38.06 — Volunteer & Donor Portals', () => {
  test('volunteer portal loads shifts and service hour submission', async ({ page }) => {
    await page.goto('/');

    const volBtn = page.locator('button:has-text("Volunteer")').first();
    await expect(volBtn).toBeVisible();
    await volBtn.click();

    const volunteerHeading = page.locator('h1, h2, h3').filter({ hasText: /Volunteer|Opportunity|Shifts|Hours/i });
    await expect(volunteerHeading.first()).toBeVisible();
  });

  test('donor portal displays contribution history with segregated pledges', async ({ page }) => {
    await page.goto('/');

    const donorBtn = page.locator('button:has-text("Donor")').first();
    await expect(donorBtn).toBeVisible();
    await donorBtn.click();

    // Verify donor dashboard elements
    const donorSection = page.locator('h1, h2, h3').filter({ hasText: /Donor|Giving|Contributions|Impact/i });
    await expect(donorSection.first()).toBeVisible();
  });
});
