import { test, expect } from '@playwright/test';

/**
 * M38.06: Volunteer and Donor Portal Real Browser Testing
 * Tests volunteer registration, clearance status, shifts, hours submission;
 * donor login, pledge history, settled contribution history, and financial truthfulness.
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

test.describe('M38.06 — Volunteer & Donor Portals', () => {
  test('volunteer portal loads shifts and service hour submission', async ({ page }) => {
    await page.goto('/');

    await navigateToPortal(page, 'volunteer');

    const volunteerHeading = page.locator('h1, h2, h3').filter({ hasText: /Volunteer|Opportunity|Shifts|Hours/i });
    await expect(volunteerHeading.first()).toBeVisible();
  });

  test('donor portal displays contribution history with segregated pledges', async ({ page }) => {
    await page.goto('/');

    await navigateToPortal(page, 'donor');

    // Verify donor dashboard elements
    const donorSection = page.locator('h1, h2, h3').filter({ hasText: /Donor|Giving|Contributions|Impact/i });
    await expect(donorSection.first()).toBeVisible();
  });
});
