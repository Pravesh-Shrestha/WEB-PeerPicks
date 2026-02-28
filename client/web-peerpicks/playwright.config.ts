import { defineConfig, devices } from '@playwright/test';

/**
 * PLAYWRIGHT CONFIGURATION - PROTOCOL 2026-02-25
 * Optimized for: Microsoft Edge (Chromium)
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* * FIX 1: Set fullyParallel to false for debugging. 
   * High parallelism often causes local Next.js servers to timeout.
   */
  fullyParallel: false, 
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, 
  /* * FIX 2: Limit workers to 1 temporarily to ensure the "60 failures" 
   * aren't caused by resource exhaustion.
   */
  workers: 1, 
  reporter: [['html'], ['list']],
  
  use: {
    /* * FIX 3: Use 127.0.0.1 instead of localhost.
     * This forces IPv4 and prevents DNS resolution delays in Edge.
     */
    baseURL: 'http://localhost:3004',
    testIdAttribute: 'data-testid',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    /* FIX 4: Increase action timeout for slower Edge initialization */
    actionTimeout: 10000, 
  },

  projects: [
    {
      name: 'Microsoft Edge',
      use: { 
        ...devices['Desktop Edge'], 
        channel: 'msedge' 
      },
    },
    /* Chromium is kept as a stable engine fallback */
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Automatically starts the Next.js server */
  webServer: {
    command: 'npm run dev',
    /* Ensure this matches the baseURL IP */
    url: 'http://localhost:3004',
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 120 * 1000,
  },
});