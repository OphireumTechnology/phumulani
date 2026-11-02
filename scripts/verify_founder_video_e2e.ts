import { chromium } from '@playwright/test';

async function verifyFounderVideo() {
  console.log('--- Starting Playwright End-to-End Verification for Founder Interview Video ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:3000...');
  const response = await page.goto('http://localhost:3000', { waitUntil: 'load' });
  console.log(`HTTP Status: ${response?.status()}`);

  await page.waitForTimeout(2000);

  // List all iframes on page
  const allIframes = await page.locator('iframe').all();
  console.log(`Total iframes on page: ${allIframes.length}`);
  for (let i = 0; i < allIframes.length; i++) {
    const src = await allIframes[i].getAttribute('src');
    const title = await allIframes[i].getAttribute('title');
    console.log(`Iframe ${i}: title="${title}", src="${src}"`);
  }

  // Check section
  const section = await page.locator('section[aria-label="The Phumulani Story: Founder Interview"]').all();
  console.log(`Matching section count: ${section.length}`);

  // Check founder heading
  const founderHeading = page.locator('h3:has-text("The Phumulani Story")');
  console.log(`Founder heading exists: ${await founderHeading.count() > 0}`);

  // Check fallback link
  const fallbackLink = page.locator('a:has-text("Watch the Founder Interview on Vimeo")').first();
  const fallbackVisible = await fallbackLink.isVisible();
  const fallbackHref = await fallbackLink.getAttribute('href');
  console.log(`Fallback link visible: ${fallbackVisible}, href: ${fallbackHref}`);

  // Test mobile viewport
  console.log('Testing mobile viewport (375x667)...');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);

  const fallbackMobile = await fallbackLink.isVisible();
  console.log(`Fallback link on mobile visible: ${fallbackMobile}`);

  await browser.close();
  console.log('--- Playwright E2E Verification Finished Successfully ---');
}

verifyFounderVideo().catch((err) => {
  console.error('E2E Verification Failed:', err);
  process.exit(1);
});
