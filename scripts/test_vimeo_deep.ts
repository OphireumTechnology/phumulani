/**
 * Deep inspection of Vimeo Player Playback on Deployed GitHub Pages
 */

import { chromium } from 'playwright';

async function testVimeoPlayback() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--autoplay-policy=no-user-gesture-required',
    ]
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 }
  });

  console.log('Navigating to deployed site...');
  await page.goto('https://ophireumtechnology.github.io/phumulani/', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  const founderSection = page.locator('#founder-section');
  await founderSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);

  const iframeEl = await page.locator('#founder-section iframe').elementHandle();
  if (!iframeEl) {
    console.error('No iframe found!');
    await browser.close();
    return;
  }

  const frame = await iframeEl.contentFrame();
  if (!frame) {
    console.log('Cross-origin frame boundary preventing contentFrame access directly.');
  } else {
    console.log('Got frame! Frame URL:', frame.url());
    
    // Look at elements in the frame
    const playButton = frame.locator('button.play, button[aria-label="Play"], .vp-player-ui-overlays button, .play-icon, button.rounded-box').first();
    console.log('Play button count:', await playButton.count());
    
    // Check if video element exists
    const videoTagCount = await frame.locator('video').count();
    console.log('Video tag count in frame:', videoTagCount);

    // Let's click the center of the video frame to trigger playback
    const box = await iframeEl.boundingBox();
    if (box) {
      console.log('Clicking center of iframe at:', box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }

    // Wait and check video state
    for (let i = 1; i <= 6; i++) {
      await page.waitForTimeout(1000);
      const state = await frame.evaluate(() => {
        const v = document.querySelector('video');
        if (!v) return { noVideo: true };
        return {
          paused: v.paused,
          currentTime: v.currentTime,
          duration: v.duration,
          readyState: v.readyState,
          networkState: v.networkState,
          volume: v.volume,
          muted: v.muted,
          error: v.error ? v.error.message : null
        };
      }).catch(err => ({ evalError: err.message }));
      console.log(`Sec ${i}:`, state);
      if ('paused' in state && typeof state.paused === 'boolean' && 'currentTime' in state && typeof state.currentTime === 'number' && !state.paused && state.currentTime > 0) {
        console.log('PLAYBACK CONFIRMED ACTIVE! Current time:', state.currentTime);
        break;
      }
    }

    // Also try calling .play() on video tag directly if it was still paused
    const directPlayResult = await frame.evaluate(async () => {
      const v = document.querySelector('video');
      if (!v) return 'No video tag';
      try {
        v.muted = true; // Many browsers require muted for programmatic play in headless
        await v.play();
        return 'play() succeeded';
      } catch (e: any) {
        return 'play() failed: ' + e.message;
      }
    }).catch(e => e.message);
    console.log('Direct video.play() attempt:', directPlayResult);

    await page.waitForTimeout(3000);
    const finalState = await frame.evaluate(() => {
      const v = document.querySelector('video');
      return v ? { paused: v.paused, currentTime: v.currentTime, duration: v.duration } : null;
    }).catch(() => null);
    console.log('Final state after programmatic trigger:', finalState);
  }

  await browser.close();
}

testVimeoPlayback().catch(console.error);
