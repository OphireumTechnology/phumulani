/**
 * Mobile Playback Verification for Phumulani Founder Interview Video
 */

import { chromium, devices } from 'playwright';

async function testMobilePlayback() {
  const iPhone = devices['iPhone 13'];
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required',
    ]
  });

  const context = await browser.newContext({
    ...iPhone,
  });

  const page = await context.newPage();
  console.log('Navigating to deployed site on mobile...');
  await page.goto('https://ophireumtechnology.github.io/phumulani/', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  const iframeLocator = page.locator('#founder-section iframe');
  await iframeLocator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  const iframeEl = await iframeLocator.elementHandle();
  if (!iframeEl) {
    console.error('No iframe found on mobile!');
    await browser.close();
    return;
  }

  const frame = await iframeEl.contentFrame();
  if (!frame) {
    console.error('Could not get frame on mobile');
  } else {
    console.log('Got mobile frame! Frame URL:', frame.url());
    
    // Tap the native play button inside the frame
    const playBtn = frame.locator('button[aria-label="Play"], button.play').first();
    if (await playBtn.count() > 0) {
      console.log('Clicking native play button in mobile frame...');
      await playBtn.click().catch(() => {});
    } else {
      const box = await iframeEl.boundingBox();
      if (box && box.y > 0) {
        console.log('Tapping center of iframe on mobile at:', box.x + box.width / 2, box.y + box.height / 2);
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      }
    }

    await page.waitForTimeout(3000);
    const state = await frame.evaluate(() => {
      const v = document.querySelector('video');
      return v ? {
        paused: v.paused,
        currentTime: v.currentTime,
        duration: v.duration,
        readyState: v.readyState,
        volume: v.volume,
        muted: v.muted,
      } : null;
    });

    console.log('Mobile video state:', state);
  }

  await browser.close();
}

testMobilePlayback().catch(console.error);
