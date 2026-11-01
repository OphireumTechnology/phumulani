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

    // The button must expose its expanded state or reveal a visible menu.
    const expanded = await toggle.getAttribute('aria-expanded');
    const menuVisible = await page.getByRole('navigation').filter({ visible: true }).count();
    expect(expanded === 'true' || menuVisible > 0).toBeTruthy();
  });

  test('essential homepage content reflows without horizontal overflow', async ({ page }) => {
    for (const width of [320, 375, 393, 430, 768, 1024]) {
      await page.setViewportSize({ width, height: 851 });
      await page.goto('/');
      await expect(page.locator('header')).toBeVisible();

      const dimensions = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      }));
      expect.soft(dimensions.documentWidth, `overflow at ${width}px`)
        .toBeLessThanOrEqual(dimensions.viewportWidth + 1);
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
