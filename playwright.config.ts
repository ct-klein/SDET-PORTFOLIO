import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration
 * Runs E2E tests against the Playwright demo Todo app and API tests
 * against the JSONPlaceholder public REST API.
 *
 * CI behaviour: headless, parallel, with HTML + JUnit reports
 * Local behaviour: headed optional via `npm run test:headed`
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    ['list'],
  ],

  use: {
    baseURL: 'https://demo.playwright.dev/todomvc',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewport — good to include to show awareness of responsive testing
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: '**/e2e/*.spec.ts',
    },
  ],
});
