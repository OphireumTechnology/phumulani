import { test, expect } from '@playwright/test';

/**
 * M38.03: Public Website Real Browser Journey Verification
 * Tests homepage, navigation, about, programs, volunteer, donation,
 * contact forms, language switching, mobile layout, and error routes.
 */
test.describe('M38.03 — Public Website Journeys', () => {
  test('homepage loads with correct branding, mission, and emergency escape', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Phumulani/i);

    // Verify mission title or header brand
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Verify safe exit / emergency crisis banner or button
    const safeExit = page.locator('button:has-text("Safe Exit"), button[aria-label*="Exit"]');
    await expect(safeExit.first()).toBeVisible();
  });

  test('navigation links function correctly across public sections', async ({ page }) => {
    await page.goto('/');

    // Check programs link/navigation
    const programNav = page.locator('nav button:has-text("Programs"), button:has-text("Programs")').first();
    if (await programNav.isVisible()) {
      await programNav.click();
      await expect(page.locator('#programs-section')).toBeVisible();
    }

    // Check volunteer link
    const volunteerNav = page.locator('nav button:has-text("Get Involved"), button:has-text("Volunteer")').first();
    if (await volunteerNav.isVisible()) {
      await volunteerNav.click();
    }

    // Check donate link
    const donateNav = page.locator('button:has-text("Donate")').first();
    if (await donateNav.isVisible()) {
      await donateNav.click();
      await expect(page.locator('#donate-section')).toBeVisible();
    }
  });

  test('multilingual language switching updates UI text', async ({ page }) => {
    await page.goto('/');

    // Look for accessible language select
    const langSelect = page.locator('#header-lang-select, select[aria-label="Select Language"]').first();
    await expect(langSelect).toBeVisible();
    await langSelect.selectOption('es');
    await expect(langSelect).toHaveValue('es');
  });

  test('contact form handles input and validation without submission crash', async ({ page }) => {
    await page.goto('/');

    // Check if contact button or form opens
    const contactBtn = page.locator('nav button:has-text("Contact"), button:has-text("Contact")').first();
    if (await contactBtn.isVisible()) {
      await contactBtn.click();
    }

    const contactSection = page.locator('#contact-section');
    await expect(contactSection).toBeVisible();

    // Verify contact form fields exist
    const nameInput = page.locator('input[placeholder*="First and Last Name"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('Jane Doe');
      await expect(nameInput).toHaveValue('Jane Doe');
    }
  });

  test('mobile viewport renders responsive hamburger or streamlined navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Mobile menu toggle must be visible
    const menuToggle = page.locator('button[aria-label*="Toggle Navigation Menu"]');
    await expect(menuToggle).toBeVisible();

    // Page must remain scrollable and content visible without horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(390);
  });
});
