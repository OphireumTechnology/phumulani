import { defineConfig, devices } from '@playwright/test';

/**
 * Phumulani AI Community Platform — Playwright End-to-End Test Configuration (M38.02)
 * Configures real browser automation for Public Website, Community Member Portal,
 * Staff & Administration, and Volunteer & Donor journeys.
 */
const testPort = process.env.PLAYWRIGHT_TEST_PORT || '3098';
const testBaseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || `http://localhost:${testPort}`;
const isolatedRuntimeDir =
  process.env.PHUMULANI_RUNTIME_DATA_DIR || `/tmp/phumulani-playwright-runtime-${testPort}`;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
  ],
  use: {
    baseURL: testBaseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: process.env.PLAYWRIGHT_DISABLE_VIDEO === '1' ? 'off' : 'retain-on-failure',
    bypassCSP: false,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
            ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
            : {}),
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        },
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        launchOptions: {
          ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
            ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
            : {}),
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        },
      },
    },
  ],
  webServer: {
    command: `node --import tsx server.ts --port ${testPort}`,
    url: testBaseUrl,
    reuseExistingServer: Boolean(process.env.PLAYWRIGHT_TEST_BASE_URL),
    timeout: 120000,
    env: {
      ...process.env,
      PHUMULANI_RUNTIME_DATA_DIR: isolatedRuntimeDir,
      PHUMULANI_OPERATIONAL_MODE: process.env.PHUMULANI_OPERATIONAL_MODE || 'STAGED_DEVELOPMENT',
    },
  },
});
