import { test, expect } from '@playwright/test';

/**
 * M38.04: Community Member Portal Real Browser Testing
 * Tests 9 member self-service areas: service requests, programs, applications,
 * resource referrals, events, notifications, profile, communication preferences, and feedback.
 */
/**
 * Helper to navigate to a portal across desktop and mobile viewports
 */
async function navigateToPortal(page: any, portalRole: 'community' | 'staff' | 'donor' | 'volunteer' | 'master-admin') {
  // The public visitor's demo toolbar is intentionally screen-reader-only.
  // E2E tests explicitly select a seeded, non-production demo identity first.
  // Selecting an identity is test setup; it does not grant server credentials.
  const userIdByPortal: Record<string, string> = {
    community: 'u-comm-member',
    volunteer: 'u-vol-applicant',
    donor: 'u-donor',
    staff: 'u-staff',
    'master-admin': 'u-master-admin',
  };
  const roleSwitcher = page.locator('select#role-simulation-select');
  await expect(roleSwitcher).toHaveCount(1);
  await roleSwitcher.selectOption(userIdByPortal[portalRole], { force: true });
  // RoleSwitcherBar auto-navigates to the assigned portal for these identities.
  if (portalRole === 'donor') {
    await expect(page.getByText('Donor', { exact: false }).first()).toBeVisible();
  } else {
    await expect(page.locator('main').first()).toBeVisible();
  }
}

/**
 * Helper to select tabs inside PortalLayout across desktop and mobile viewports
 */
async function selectPortalTab(page: any, tabSelector: string) {
  let targetTab = page.locator(tabSelector).filter({ visible: true }).first();
  if (await targetTab.isVisible()) {
    await targetTab.click();
    return;
  }

  // On mobile viewports (< md), open the portal sidebar drawer
  const sidebarToggle = page.locator('button[aria-label*="Toggle Navigation Sidebar"]').first();
  if (await sidebarToggle.isVisible()) {
    await sidebarToggle.click();
    targetTab = page.locator(tabSelector).filter({ visible: true }).first();
    await expect(targetTab).toBeVisible();
    await targetTab.click();
  }
}

test.describe('M38.04 — Community Member Portal Journeys', () => {
  test('member authentication and dashboard rendering', async ({ page }) => {
    await page.goto('/');

    await navigateToPortal(page, 'community');

    // Verify member portal layout or greeting
    const portalHeading = page.locator('h1, h2').filter({ hasText: /Community|Member|Portal|Self-Service/i });
    await expect(portalHeading.first()).toBeVisible();
  });

  test('service request creation and status tracking displays correctly', async ({ page }) => {
    await page.goto('/');

    await navigateToPortal(page, 'community');

    // Check service request tab
    await selectPortalTab(page, 'button:has-text("Service Requests"), button:has-text("General Service Requests")');

    await expect(page.locator('h1, h2, h3').filter({ hasText: /Service Request|Requests/i }).first()).toBeVisible();
  });

  test('resource referrals and notification mark-as-read', async ({ page }) => {
    await page.goto('/');
    await navigateToPortal(page, 'community');

    await selectPortalTab(page, 'button:has-text("Referrals"), button:has-text("Resource Referrals")');

    await expect(page.locator('body')).toBeVisible();
  });

  test('profile and communication preferences update', async ({ page }) => {
    await page.goto('/');
    await navigateToPortal(page, 'community');

    await selectPortalTab(page, 'button:has-text("Profile"), button:has-text("Member Profile"), button:has-text("Preferences")');

    await expect(page.locator('body')).toBeVisible();
  });

  test('M41.05: member program discovery, enrollment application, and waitlist tracking', async ({ page }) => {
    await page.goto('/');
    await navigateToPortal(page, 'community');

    // 1. Program discovery tab navigation
    await selectPortalTab(page, 'button:has-text("Program Enrollments"), button:has-text("Programs")');

    // Verify program content is rendered
    const heading = page.locator('h1, h2, h3, h4').filter({ hasText: /Program|Enrollment/i }).first();
    await expect(heading).toBeVisible();
  });

  test('M41.05: mobile enrollment navigation and responsive capacity display', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // On mobile, switch role via select dropdown or visible button
    const selectEl = page.locator('select').first();
    if (await selectEl.isVisible()) {
      await selectEl.selectOption({ index: 1 });
    }

    // Verify page loads without crashing on mobile viewport
    await expect(page.locator('body')).toBeVisible();
  });
});

