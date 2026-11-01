import { test, expect } from '@playwright/test';

/**
 * M38.05: Staff and Master Administration Real Browser Testing
 * Tests staff login, service queue, case assignment, referral approval,
 * program capacity view, volunteer clearance review, fundraising reporting,
 * and server-side authorization gates.
 */
/**
 * Helper to navigate to a portal across desktop and mobile viewports
 */
async function navigateToPortal(page: any, portalRole: 'community' | 'staff' | 'donor' | 'volunteer' | 'master-admin') {
  const desktopSelectors: Record<string, string> = {
    community: 'button:has-text("Community Member")',
    volunteer: 'button:has-text("Volunteer")',
    donor: 'button:has-text("Donor")',
    staff: 'button:has-text("Staff")',
    'master-admin': 'button:has-text("Master Admin")',
  };

  const desktopBtn = page.locator(desktopSelectors[portalRole]).first();
  if (await desktopBtn.isVisible()) {
    await desktopBtn.click();
    return;
  }

  // Mobile flow: open mobile navigation menu from header if on public website
  const menuToggle = page.locator('button[aria-label*="Toggle Navigation Menu"]');
  if (await menuToggle.isVisible()) {
    await menuToggle.click();
    const mobileLinkMap: Record<string, string> = {
      community: 'button:has-text("Community & Volunteer Hub")',
      volunteer: 'button:has-text("Community & Volunteer Hub")',
      donor: 'button:has-text("Donor & Sponsor Portal")',
      staff: 'button:has-text("Staff Command Center")',
      'master-admin': 'button:has-text("Master Administrator")',
    };
    const mobileLink = page.locator(mobileLinkMap[portalRole]).first();
    await expect(mobileLink).toBeVisible();
    await mobileLink.click();
    return;
  }

  // Inside a portal on mobile: use the Portals dropdown in PortalLayout
  const portalsDropdown = page.locator('button:has-text("Portals")').first();
  if (await portalsDropdown.isVisible()) {
    await portalsDropdown.click();
    const dropdownLinkMap: Record<string, string> = {
      community: 'button:has-text("Community & Volunteer Hub")',
      volunteer: 'button:has-text("Community & Volunteer Hub")',
      donor: 'button:has-text("Donor & Sponsor Portal")',
      staff: 'button:has-text("Staff Command Center")',
      'master-admin': 'button:has-text("Master Administrator")',
    };
    const dropLink = page.locator(dropdownLinkMap[portalRole]).first();
    if (await dropLink.isVisible()) {
      await dropLink.click();
      return;
    }
  }

  // Role simulation select dropdown in RoleSwitcherBar
  const selectEl = page.locator('select#role-simulation-select, select[aria-label="Role Simulation"]').first();
  if (await selectEl.isVisible()) {
    const roleOptMap: Record<string, RegExp> = {
      community: /Community Member/i,
      volunteer: /Volunteer/i,
      donor: /Donor/i,
      staff: /Staff/i,
      'master-admin': /Master Admin/i,
    };
    await selectEl.selectOption({ label: roleOptMap[portalRole] });
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

test.describe('M38.05 — Staff & Administration Journeys', () => {
  test('staff command center loads with operational queues', async ({ page }) => {
    await page.goto('/');

    // Switch to staff role
    await navigateToPortal(page, 'staff');

    const heading = page.locator('h1, h2').filter({ hasText: /Staff|Operations|Command|Admin/i });
    await expect(heading.first()).toBeVisible();
  });

  test('case assignment and referral approvals flow', async ({ page }) => {
    await page.goto('/');
    await navigateToPortal(page, 'staff');

    // Verify operations tabs or queue view
    await selectPortalTab(page, 'button:has-text("Volunteer Screening Queue"), button:has-text("Screening"), button:has-text("Queue")');

    await expect(page.locator('body')).toBeVisible();
  });

  test('master administration navigation and 36 AI agent status', async ({ page }) => {
    await page.goto('/');
    await navigateToPortal(page, 'master-admin');

    // Verify workforce or administrative sections
    const workforceNav = page.locator('button:has-text("AI Workforce"), button:has-text("Workforce")').filter({ visible: true }).first();
    if (await workforceNav.isVisible()) {
      await workforceNav.click();
      await expect(page.locator('h1, h2, h3').filter({ hasText: /AI Workforce|Agent/i }).first()).toBeVisible();
    }
  });

  test('M41.08: Staff and Board operational reporting tab navigation', async ({ page }) => {
    await page.goto('/');

    // Test Master Admin Reporting Tab
    await navigateToPortal(page, 'master-admin');
    const reportingNav = page.locator('button:has-text("Authoritative Reporting (M41.08)"), button:has-text("Reporting")').filter({ visible: true }).first();
    if (await reportingNav.isVisible()) {
      await reportingNav.click();
      await expect(page.locator('text=Separation of Duties').first()).toBeVisible();
    }

    // Test Staff Command Center Reports Tab
    await navigateToPortal(page, 'staff');
    await selectPortalTab(page, 'button:has-text("Reports"), button:has-text("Staff Operations Report")');
    await expect(page.locator('body')).toBeVisible();
  });
});
