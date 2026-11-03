import { test, expect } from '@playwright/test';

/**
 * Regression: importing the Phumulani Ai local inference adapter must not
 * crash the public website in a browser without Node.js globals.
 */
test('public website boots without Node process global errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto('/');
  await expect(page.locator('header')).toBeVisible();
  expect(errors.filter(message => /process is not defined|LocalInferenceAdapter/.test(message))).toEqual([]);
});
