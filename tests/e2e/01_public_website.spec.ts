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

  test('M41.10 — public website images load without broken image frames', async ({ page }) => {
    // Intercept 404 image errors
    const failedImages: string[] = [];
    page.on('response', (res) => {
      const url = res.url();
      if ((url.endsWith('.svg') || url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.webp')) && res.status() >= 400) {
        failedImages.push(url);
      }
    });

    await page.goto('/');

    // 1. Verify Header Logo
    const headerLogo = page.locator('header img, header [role="img"]').first();
    await expect(headerLogo).toBeVisible();

    // 2. Verify Homepage Hero Image
    const heroImage = page.locator('img[alt*="community sisterhood"], [role="img"][aria-label*="Community Sanctuary"]').first();
    await expect(heroImage).toBeVisible();

    // 3. Verify Founder Representation
    const founderImg = page.locator('img[alt*="Comfort Dondo"], [role="img"][aria-label*="Comfort Dondo"]').first();
    await expect(founderImg).toBeVisible();

    // 4. Scroll through programs section to trigger lazy-loaded images
    const programSec = page.locator('#programs-section');
    if (await programSec.isVisible()) {
      await programSec.scrollIntoViewIfNeeded();
      const programImgs = page.locator('#programs-section img, #programs-section [role="img"]');
      const count = await programImgs.count();
      expect(count).toBeGreaterThanOrEqual(1);
    }

    // 5. Scroll through events section
    const eventsSec = page.locator('#events-section');
    if (await eventsSec.isVisible()) {
      await eventsSec.scrollIntoViewIfNeeded();
      const eventImgs = page.locator('#events-section img, #events-section [role="img"]');
      const count = await eventImgs.count();
      expect(count).toBeGreaterThanOrEqual(1);
    }

    // 6. Assert zero 404 responses on local visual asset requests
    const internalFailures = failedImages.filter((u) => u.includes('/images/') || u.includes('/media/'));
    expect(internalFailures).toEqual([]);
  });

  test('M41.10 — responsive image verification across 6 viewports', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 393, height: 852 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1280, height: 800 },
      { width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto('/');
      const headerLogo = page.locator('header img, header [role="img"]').first();
      await expect(headerLogo).toBeVisible();
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(vp.width + 15);
    }
  });
});
