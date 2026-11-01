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
    for (const width of [320, 375, 393, 430, 768, 1024]) {
      await page.setViewportSize({ width, height: 851 });
      await page.goto('/');
      await expect(page.locator('header')).toBeVisible();

      const dimensions = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        overflowingElements: Array.from(document.querySelectorAll('body *'))
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return style.display !== 'none' && style.visibility !== 'hidden' &&
              (rect.right > document.documentElement.clientWidth + 1 || rect.left < -1);
          })
          .slice(0, 12)
          .map((element) => ({
            tag: element.tagName,
            className: typeof element.className === 'string' ? element.className.slice(0, 140) : '',
            right: Math.round(element.getBoundingClientRect().right),
            left: Math.round(element.getBoundingClientRect().left),
          })),
      }));
      expect.soft(dimensions.documentWidth, `overflow at ${width}px: ${JSON.stringify(dimensions.overflowingElements)}`)
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


test.describe('M41.11 — Authenticated portal mobile navigation', () => {
  async function openStaffPortal(page: import('@playwright/test').Page) {
    await page.setViewportSize({ width: 393, height: 851 });
    await page.goto('/');
    const mobileMenu = page.getByRole('button', { name: 'Toggle Navigation Menu' });
    await expect(mobileMenu).toBeVisible();
    await mobileMenu.click();
    const staffLink = page.getByRole('navigation', { name: 'Mobile website and portal navigation' })
      .getByRole('button', { name: /Staff Command Center/i }).first();
    await expect(staffLink).toBeVisible();
    await staffLink.click();
    const toggle = page.getByRole('button', { name: 'Toggle Navigation Sidebar' });
    await expect(toggle).toBeVisible();
    return toggle;
  }

  test('portal sidebar exposes state and can be dismissed with Escape', async ({ page }) => {
    const toggle = await openStaffPortal(page);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const drawer = page.getByRole('navigation', { name: 'Mobile portal navigation' });
    await expect(drawer).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawer).toHaveCount(0);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('portal mobile drawer has an accessible close control', async ({ page }) => {
    const toggle = await openStaffPortal(page);
    await toggle.click();
    const drawer = page.getByRole('navigation', { name: 'Mobile portal navigation' });
    await drawer.getByRole('button', { name: 'Close mobile portal navigation' }).click();
    await expect(drawer).toHaveCount(0);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('portal mobile drawer fits a 320px viewport', async ({ page }) => {
    const toggle = await openStaffPortal(page);
    await page.setViewportSize({ width: 320, height: 851 });
    await expect(toggle).toBeVisible();
    await toggle.click();
    const drawer = page.getByRole('navigation', { name: 'Mobile portal navigation' });
    await expect(drawer).toBeVisible();
    const geometry = await drawer.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, viewport: document.documentElement.clientWidth };
    });
    expect(geometry.left).toBeGreaterThanOrEqual(0);
    expect(geometry.right).toBeLessThanOrEqual(geometry.viewport + 1);
  });
});
