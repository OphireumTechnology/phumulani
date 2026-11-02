/**
 * Live Playback Verification Script for Phumulani Founder Interview Video
 * Target: https://ophireumtechnology.github.io/phumulani/
 */

import { chromium, Browser, Page } from 'playwright';

interface VerificationResult {
  viewport: string;
  url: string;
  iframeRendered: boolean;
  iframeSrc: string | null;
  iframeReferrerPolicy: string | null;
  iframeAllow: string | null;
  fallbackLinkPresent: boolean;
  fallbackHref: string | null;
  consoleErrors: string[];
  cspViolations: string[];
  networkResponses: Array<{ url: string; status: number; statusText: string }>;
  vimeoRequests: Array<{ url: string; status: number }>;
  playerInitialized: boolean;
  playbackStarted: boolean;
  playbackConfirmed: boolean;
  externalProviderBlocked: boolean;
  blockedReason?: string;
  currentTime?: number;
  duration?: number;
  safeExitPresent: boolean;
  founderAttributionPresent: boolean;
  producerAttributionPresent: boolean;
}

async function verifyLiveSite() {
  console.log('================================================================');
  console.log('STARTING LIVE PLAYBACK VERIFICATION ON GITHUB PAGES');
  console.log('Target URL: https://ophireumtechnology.github.io/phumulani/');
  console.log('================================================================\n');

  const browser: Browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const runTest = async (isMobile: boolean): Promise<VerificationResult> => {
    const context = await browser.newContext({
      viewport: isMobile ? { width: 375, height: 667 } : { width: 1280, height: 800 },
      userAgent: isMobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      isMobile: isMobile,
      hasTouch: isMobile,
    });

    const page: Page = await context.newPage();
    const result: VerificationResult = {
      viewport: isMobile ? 'Mobile (375x667)' : 'Desktop (1280x800)',
      url: 'https://ophireumtechnology.github.io/phumulani/',
      iframeRendered: false,
      iframeSrc: null,
      iframeReferrerPolicy: null,
      iframeAllow: null,
      fallbackLinkPresent: false,
      fallbackHref: null,
      consoleErrors: [],
      cspViolations: [],
      networkResponses: [],
      vimeoRequests: [],
      playerInitialized: false,
      playbackStarted: false,
      playbackConfirmed: false,
      externalProviderBlocked: false,
      safeExitPresent: false,
      founderAttributionPresent: false,
      producerAttributionPresent: false,
    };

    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        result.consoleErrors.push(text);
        if (text.toLowerCase().includes('content security policy') || text.toLowerCase().includes('csp')) {
          result.cspViolations.push(text);
        }
      }
    });

    page.on('response', (response) => {
      const reqUrl = response.url();
      const status = response.status();
      if (reqUrl.includes('vimeo')) {
        result.vimeoRequests.push({ url: reqUrl, status });
      }
      if (status >= 400) {
        result.networkResponses.push({ url: reqUrl, status, statusText: response.statusText() });
      }
    });

    try {
      console.log(`[${result.viewport}] Navigating to https://ophireumtechnology.github.io/phumulani/ ...`);
      await page.goto('https://ophireumtechnology.github.io/phumulani/', {
        waitUntil: 'networkidle',
        timeout: 45000,
      });

      // 1. Check Safe Exit
      const safeExitEl = await page.locator('button:has-text("Safe Exit"), a:has-text("Safe Exit")').first();
      result.safeExitPresent = (await safeExitEl.count()) > 0;

      // 2. Scroll to founder-section
      const founderSection = page.locator('#founder-section');
      await founderSection.scrollIntoViewIfNeeded({ timeout: 10000 });
      await page.waitForTimeout(1500);

      // Check founder attributions
      const founderText = await page.textContent('#founder-section');
      result.founderAttributionPresent = !!founderText && founderText.includes('Comfort Dondo');
      result.producerAttributionPresent = !!founderText && (founderText.includes('Twin Cities Community Media') || founderText.includes('Community Media'));

      // 3. Check iframe
      const iframeLocator = page.locator('#founder-section iframe');
      const iframeCount = await iframeLocator.count();
      if (iframeCount > 0) {
        result.iframeRendered = true;
        result.iframeSrc = await iframeLocator.first().getAttribute('src');
        result.iframeReferrerPolicy = await iframeLocator.first().getAttribute('referrerpolicy');
        result.iframeAllow = await iframeLocator.first().getAttribute('allow');
      }

      // 4. Check fallback link
      const fallbackLink = page.locator('a[href*="vimeo.com/355031901"]').first();
      if ((await fallbackLink.count()) > 0) {
        result.fallbackLinkPresent = true;
        result.fallbackHref = await fallbackLink.getAttribute('href');
      }

      // 5. Inspect iframe frame & player status
      const frameElement = await iframeLocator.first().elementHandle();
      if (frameElement) {
        const frame = await frameElement.contentFrame();
        if (frame) {
          result.playerInitialized = true;
          await page.waitForTimeout(3000);

          // Check if there is an error inside the Vimeo iframe
          const frameBody = await frame.content().catch(() => '');
          if (
            frameBody.includes("Sorry — We’re having a little trouble") ||
            frameBody.includes("We’re having a little trouble") ||
            frameBody.includes("Because of its privacy settings, this video cannot be played here") ||
            frameBody.includes("privacy-shield")
          ) {
            result.externalProviderBlocked = true;
            if (frameBody.includes("privacy settings")) {
              result.blockedReason = "Vimeo domain privacy restriction";
            } else {
              result.blockedReason = "Vimeo error: Sorry — We're having a little trouble";
            }
          }

          // Check for Vimeo play button inside frame
          const vimeoPlayBtn = frame.locator('button[aria-label="Play"], .play, button.play, .vp-player-ui-overlays button').first();
          if (await vimeoPlayBtn.isVisible().catch(() => false)) {
            console.log(`[${result.viewport}] Clicking Vimeo play button inside iframe...`);
            await vimeoPlayBtn.click().catch((e) => console.log('Click error:', e.message));
            await page.waitForTimeout(3000);
          } else {
            console.log(`[${result.viewport}] No native overlay play button found; trying frame click or evaluate...`);
            await frame.locator('body').click().catch(() => {});
            await page.waitForTimeout(2000);
          }

          // Check playback progression via Vimeo Player API or video element inside frame
          const playbackState = await frame.evaluate(() => {
            const video = document.querySelector('video');
            if (video) {
              return {
                foundVideoTag: true,
                paused: video.paused,
                currentTime: video.currentTime,
                duration: video.duration,
                ended: video.ended,
                readyState: video.readyState,
              };
            }
            // Check if Vimeo player object exists on window
            return { foundVideoTag: false };
          }).catch((err) => ({ foundVideoTag: false, evalError: err.message }));

          console.log(`[${result.viewport}] Video element state:`, playbackState);

          if (playbackState.foundVideoTag && 'paused' in playbackState && typeof playbackState.paused === 'boolean' && 'currentTime' in playbackState && typeof playbackState.currentTime === 'number' && 'duration' in playbackState && typeof playbackState.duration === 'number') {
            if (!playbackState.paused || playbackState.currentTime > 0) {
              result.playbackStarted = true;
              // wait another 2 seconds to confirm progression
              await page.waitForTimeout(2500);
              const secondCheck = await frame.evaluate(() => {
                const video = document.querySelector('video');
                return video ? video.currentTime : 0;
              }).catch(() => 0);
              result.currentTime = secondCheck;
              result.duration = playbackState.duration;
              if (secondCheck > 0.2) {
                result.playbackConfirmed = true;
              }
            }
          }
        } else {
          console.log(`[${result.viewport}] contentFrame() returned null (cross-origin iframe restricted)`);
          // Cross-origin iframe: let's evaluate via postMessage Vimeo API
          // We can attach a listener on the parent window to Vimeo postMessage events!
          const postMessageEvents = await page.evaluate(async () => {
            return new Promise((resolve) => {
              const events: any[] = [];
              const handler = (event: MessageEvent) => {
                if (typeof event.data === 'string' && event.data.includes('vimeo')) {
                  events.push(event.data);
                } else if (typeof event.data === 'object') {
                  events.push(event.data);
                }
              };
              window.addEventListener('message', handler);
              setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve(events);
              }, 4000);
            });
          });
          console.log(`[${result.viewport}] Vimeo postMessage events:`, postMessageEvents);
        }
      }

      // Check external provider blocked status from network responses
      for (const req of result.vimeoRequests) {
        if (req.status === 403 || req.status === 503) {
          result.externalProviderBlocked = true;
          result.blockedReason = `Vimeo request returned HTTP ${req.status}`;
        }
      }

    } catch (err: any) {
      console.error(`[${result.viewport}] Error during test:`, err.message);
    } finally {
      await context.close();
    }

    return result;
  };

  const desktopResult = await runTest(false);
  const mobileResult = await runTest(true);

  await browser.close();

  console.log('\n================================================================');
  console.log('FINAL LIVE VERIFICATION SUMMARY:');
  console.log('================================================================');
  console.log('DESKTOP RESULT:');
  console.log(JSON.stringify(desktopResult, null, 2));
  console.log('\nMOBILE RESULT:');
  console.log(JSON.stringify(mobileResult, null, 2));

  return { desktopResult, mobileResult };
}

verifyLiveSite().catch(console.error);
