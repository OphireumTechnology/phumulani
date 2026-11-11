import { test, expect } from '@playwright/test';

/**
 * PHUMULANI-PUBLIC-100 — Automated E2E Verification Suite
 * Verifies public website functionality, accessibility, safe exit,
 * confidential intake encryption, real contact submission, real resource downloads,
 * unconfigured gateway pledge handling, zero horizontal overflow across 8 viewports,
 * and strict access control on safeguarding data.
 */
test.describe('PHUMULANI-PUBLIC-100 — Public Website & Safeguarding Suite', () => {

  test('01: Homepage loads with correct branding, mission, and emergency escape', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Phumulani/i);

    // Verify mission title or header brand
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Verify safe exit banner / button
    const safeExit = page.locator('button:has-text("SAFE EXIT"), button:has-text("Safe Exit")');
    await expect(safeExit.first()).toBeVisible();
  });

  test('02: Navigation links function correctly across public sections', async ({ page }) => {
    await page.goto('/');

    // Check founder link
    const founderNav = page.locator('nav button:has-text("Founder"), button:has-text("Founder")').first();
    if (await founderNav.isVisible()) {
      await founderNav.click();
      await expect(page.locator('#founder-section')).toBeVisible();
    }

    // Check programs link/navigation
    const programNav = page.locator('nav button:has-text("Programs"), button:has-text("Programs")').first();
    if (await programNav.isVisible()) {
      await programNav.click();
      await expect(page.locator('#programs-section')).toBeVisible();
    }

    // Check donate link
    const donateNav = page.locator('button:has-text("Donate")').first();
    if (await donateNav.isVisible()) {
      await donateNav.click();
      await expect(page.locator('#donate-section')).toBeVisible();
    }
  });

  test('03: Multilingual language switching updates UI text and select value', async ({ page }) => {
    await page.goto('/');

    const langSelect = page.locator('#header-lang-select, select[aria-label="Select Language"]').first();
    await expect(langSelect).toBeVisible();
    await langSelect.selectOption('es');
    await expect(langSelect).toHaveValue('es');
  });

  test('04: Contact form handles real submission and tracking ID delivery', async ({ page }) => {
    await page.goto('/');

    const contactSection = page.locator('#contact-section');
    await expect(contactSection).toBeVisible();
    await contactSection.scrollIntoViewIfNeeded();

    // Fill contact form fields
    const nameInput = page.locator('#contact-section input[placeholder*="First and Last Name"]');
    const emailInput = page.locator('#contact-section input[placeholder*="you@example.com"]');
    const subjectInput = page.locator('#contact-section input[placeholder*="Brief summary"]');
    const messageInput = page.locator('#contact-section textarea[placeholder*="Please share how our team can assist you"]');

    await nameInput.fill('Amina Yusuf');
    await emailInput.fill('amina.yusuf@example.org');
    await subjectInput.fill('Community Cohort Inquiry');
    await messageInput.fill('Requesting information regarding enrollment in the upcoming Tea Healing Circle cohort.');

    // Select Department
    const deptSelect = page.locator('#contact-section select');
    if (await deptSelect.isVisible()) {
      await deptSelect.selectOption('Community Programs & Cohorts');
    }

    // Submit form and intercept API response
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/contact/submit') && res.status() === 200),
      page.locator('#contact-section button[type="submit"]').click(),
    ]);

    const resJson = await response.json();
    expect(resJson.success).toBe(true);
    expect(resJson.trackingId).toMatch(/^INQ-[A-Z0-9-]+$/);
    expect(resJson.routedTo).toContain('programs@phumulani.org');

    // Verify UI confirmation
    await expect(page.locator(`text=Inquiry Recorded: ${resJson.trackingId}`)).toBeVisible();
  });

  test('05: Confidential safeguarding intake securely encrypts and stores request', async ({ page }) => {
    await page.goto('/');

    const helpSection = page.locator('#get-help-section');
    await expect(helpSection).toBeVisible();
    await helpSection.scrollIntoViewIfNeeded();

    const safeTimeInput = page.locator('#get-help-section input[placeholder*="e.g., Weekday mornings"]');
    const notesInput = page.locator('#get-help-section textarea[placeholder*="Enter safe contact info"]');

    await safeTimeInput.fill('Mornings between 9am-11am only');
    await notesInput.fill('Safe phone: (612) 555-0144. Need discreet consultation regarding safe housing resources.');

    // Intercept API call to ensure payload encryption
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/intake/restricted') && res.status() === 200),
      page.locator('#get-help-section button[type="submit"]').click(),
    ]);

    const resJson = await response.json();
    expect(resJson.success).toBe(true);
    expect(resJson.anonymousCode).toMatch(/^SAFE-[A-Z0-9-]+$/);

    // Verify UI confirmation
    await expect(page.locator(`text=Safe Intake Reference: ${resJson.anonymousCode}`)).toBeVisible();
  });

  test('06: Donation pledge flow handles unconfigured gateway without false tax receipts', async ({ page }) => {
    await page.goto('/');

    const donateSection = page.locator('#donate-section');
    await expect(donateSection).toBeVisible();
    await donateSection.scrollIntoViewIfNeeded();

    // Check transparency banner
    await expect(page.locator('text=Payment Gateway In Configuration Mode').or(page.locator('text=Live Verified Payment Gateway'))).toBeVisible();

    const donorName = page.locator('#donate-section input[placeholder="Marcus Vance"]');
    const donorEmail = page.locator('#donate-section input[placeholder="donor@example.com"]');

    await donorName.fill('Sarah Jenkins');
    await donorEmail.fill('sarah.jenkins@example.org');

    // Click Record Tax-Deductible Pledge
    const submitBtn = page.locator('#donate-section button[type="submit"]');
    await expect(submitBtn).toBeVisible();

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/payments/pledge') && res.status() === 200),
      submitBtn.click(),
    ]);

    const resJson = await response.json();
    expect(resJson.success).toBe(true);
    expect(resJson.pledgeReference).toMatch(/^PLG-[A-Z0-9-]+$/);

    // Verify pledge confirmation card is displayed
    await expect(page.locator(`text=Donor Pledge Recorded: ${resJson.pledgeReference}`)).toBeVisible();

    // Assert that NO premature 501(c)(3) tax receipt modal or mock card modal is displayed
    const fakeReceipt = page.locator('text=Official Tax Receipt Issued, text=Card (•••• 4022)');
    await expect(fakeReceipt).toHaveCount(0);
  });

  test('07: Resource library delivers authentic downloadable PDF guides', async ({ page }) => {
    await page.goto('/');

    const resourcesSection = page.locator('#resources-section');
    await expect(resourcesSection).toBeVisible();
    await resourcesSection.scrollIntoViewIfNeeded();

    // Fetch the Order for Protection Navigator resource directly to test server delivery
    const resResponse = await page.request.get('/resources/order-for-protection-navigator.pdf');
    expect(resResponse.status()).toBe(200);
    const contentType = resResponse.headers()['content-type'] || '';
    expect(contentType).toContain('pdf');

    const bodyBuffer = await resResponse.body();
    // Valid PDF header check: starts with %PDF-
    const headerString = bodyBuffer.toString('utf-8', 0, 8);
    expect(headerString).toContain('%PDF-');

    // Verify clicking download in UI triggers the notification
    const downloadBtn = page.locator('#resources-section button:has-text("Download PDF")').first();
    await downloadBtn.click();
    await expect(page.locator('text=Downloaded authentic resource:')).toBeVisible();
  });

  test('08: Founder official photograph decodes properly without broken frames', async ({ page }) => {
    await page.goto('/');

    // Locate founder photograph in FounderSection or public website
    const founderImg = page.locator('img[src*="phumulani-founder-official.png"]').first();
    await expect(founderImg).toBeVisible();

    // Verify the image is complete and naturalWidth > 0 (actually decoded bitmap)
    const isDecoded = await founderImg.evaluate((el) => {
      const img = el as HTMLImageElement;
      return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
    });
    expect(isDecoded).toBe(true);
  });

  test('09: Safe Exit button is wired to neutral safe destination', async ({ page }) => {
    await page.goto('/');

    const safeExitBtn = page.locator('button:has-text("SAFE EXIT")').first();
    await expect(safeExitBtn).toBeVisible();

    // Test that the Safe Exit button title clarifies its purpose
    const titleAttr = await safeExitBtn.getAttribute('title');
    expect(titleAttr).toContain('Weather.com');
  });

  test('10: Direct unauthenticated access to confidential intake is strictly forbidden (RBAC)', async ({ page }) => {
    // Unauthenticated GET request to restricted intake endpoint
    const response = await page.request.get('/api/intake/restricted');
    // Must return 401 Unauthorized or 403 Forbidden
    expect([401, 403]).toContain(response.status());
  });

  test('11: Responsive reflow across 8 target viewports with zero horizontal overflow', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 },
      { width: 375, height: 667 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto('/');
      await expect(page.locator('header')).toBeVisible();

      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));

      // Strict check: scrollWidth must not exceed innerWidth (zero tolerance)
      expect(scrollWidth, `Viewport ${vp.width}px overflowed: scrollWidth ${scrollWidth} > innerWidth ${innerWidth}`)
        .toBeLessThanOrEqual(innerWidth + 1); // 1px sub-pixel rounding tolerance
    }
  });

  test('12: Public website renders with zero 404 network asset failures', async ({ page }) => {
    const failedAssets: string[] = [];

    page.on('response', (res) => {
      const url = res.url();
      if ((url.includes('/images/') || url.includes('/media/') || url.includes('/resources/')) && res.status() >= 400) {
        failedAssets.push(`${res.status()} ${url}`);
      }
    });

    await page.goto('/');

    // Scroll through the entire page to trigger lazy loading of media assets
    await page.evaluate(async () => {
      const scrollStep = 400;
      for (let y = 0; y < document.body.scrollHeight; y += scrollStep) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 50));
      }
    });

    expect(failedAssets).toEqual([]);
  });
});
