import { test, expect } from '@playwright/test';

/**
 * M41.11 accessibility/mobile regression entry point.
 * These are automated checks, not human assistive-technology certification.
 * No sensitive case fixtures or survivor data are used.
 */
test.describe('M41.11 — Public accessibility and mobile smoke checks', () => {
  test('public page exposes a usable main landmark and keyboard-reachable Safe Exit', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('main').first()).toBeVisible();

    const exit = page.getByRole('button', { name: /safe exit/i }).first();
    await expect(exit).toBeVisible();
    await expect(exit).toBeEnabled();

    // Inspect focusability without activating the emergency redirect.
    await exit.focus();
    await expect(exit).toBeFocused();
  });

  test('mobile navigation can be opened using keyboard activation', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });
    await page.goto('/');

    const toggle = page.locator('button[aria-label*="Toggle Navigation Menu"]').first();
    await expect(toggle).toBeVisible();
    await toggle.focus();
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Enter');

    // Verify the actual mobile drawer, not an unrelated navigation landmark.
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation', { name: 'Mobile website and portal navigation' })).toBeVisible();
  });

  test('essential homepage content reflows without horizontal overflow', async ({ page }) => {
    for (const width of [320, 375, 390, 393, 430, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 851 });
      await page.goto('/');
      await expect(page.locator('header')).toBeVisible();

      const dimensions = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        // Include container widths and minimum-size constraints: document overflow can
        // occur even when no individual element's rectangle exceeds the viewport.
        overflowingElements: Array.from(document.querySelectorAll('body *'))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return { element, rect, style };
          })
          .filter(({ element, rect, style }) => {
            if (style.display === 'none' || style.visibility === 'hidden') return false;
            return rect.right > document.documentElement.clientWidth + 1 ||
              rect.left < -1 ||
              (element.scrollWidth > element.clientWidth + 1 &&
                element.scrollWidth >= document.documentElement.scrollWidth - 1 &&
                style.overflowX !== 'auto' && style.overflowX !== 'scroll');
          })
          .slice(0, 20)
          .map(({ element, rect, style }) => ({
            tag: element.tagName,
            className: typeof element.className === 'string' ? element.className.slice(0, 140) : '',
            right: Math.round(rect.right),
            left: Math.round(rect.left),
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
            minWidth: style.minWidth,
            overflowX: style.overflowX,
          })),
      }));
      expect.soft(dimensions.documentWidth, `overflow at ${width}px: ${JSON.stringify(dimensions.overflowingElements)}`)
        .toBeLessThanOrEqual(dimensions.viewportWidth + 1);
    }
  });

  test('header logo and hero badge do not overlap and maintain independent geometry', async ({ page }) => {
    await page.goto('/');
    const headerLogo = page.locator('header img[alt*="Phumulani"]').first();
    const heroBadge = page.locator('span:has-text("MINNESOTA 501(C)(3)")').first();

    await expect(headerLogo).toBeVisible();
    await expect(heroBadge).toBeVisible();

    const logoBox = await headerLogo.boundingBox();
    const badgeBox = await heroBadge.boundingBox();

    expect(logoBox).not.toBeNull();
    expect(badgeBox).not.toBeNull();

    if (logoBox && badgeBox) {
      // Badge must be rendered strictly below the header logo (no negative margin or overlapping collision)
      expect(badgeBox.y).toBeGreaterThanOrEqual(logoBox.y + logoBox.height - 2);
    }
  });

  test('hero heading and right-column cards do not collide or clip', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const heading = page.locator('h1').first();
    const heroImage = page.locator('img[alt*="Joyful African mother"]').first();

    await expect(heading).toBeVisible();
    await expect(heroImage).toBeVisible();

    const headingBox = await heading.boundingBox();
    const imageBox = await heroImage.boundingBox();

    expect(headingBox).not.toBeNull();
    expect(imageBox).not.toBeNull();

    if (headingBox && imageBox) {
      // In 2-column desktop layout (1440px), the left column heading right edge should not overlap image left edge
      expect(headingBox.x + headingBox.width).toBeLessThanOrEqual(imageBox.x + 30);
    }
  });

  test('language selector has an accessible name and is keyboard focusable', async ({ page }) => {
    await page.goto('/');
    const selector = page.locator('#header-lang-select, select[aria-label="Select Language"]').first();
    await expect(selector).toBeVisible();
    const accessibleName = await selector.evaluate((el) => {
      const select = el as HTMLSelectElement;
      const label = select.labels?.[0]?.textContent?.trim() || '';
      return el.getAttribute('aria-label') || label || el.getAttribute('aria-labelledby') || '';
    });
    expect(accessibleName.trim().length).toBeGreaterThan(0);
    await selector.focus();
    await expect(selector).toBeFocused();
  });
});
