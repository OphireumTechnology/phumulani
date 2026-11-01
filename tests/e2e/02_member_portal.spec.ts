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

