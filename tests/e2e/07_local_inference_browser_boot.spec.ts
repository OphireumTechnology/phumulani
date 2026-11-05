import { test, expect } from '@playwright/test';

/** Catch Node-only environment access in UI-imported AI services. */
test('public website boots without Node process global errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto('/');
  await expect(page.locator('header')).toBeVisible();
  expect(errors.filter(message => /process is not defined|LocalInferenceAdapter/.test(message))).toEqual([]);
});
