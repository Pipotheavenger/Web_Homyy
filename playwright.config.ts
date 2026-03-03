import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local for Supabase credentials
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig({
  testDir: './test/playwright',

  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },

  retries: 2,

  // Single worker — the test is serial and shares state
  workers: 1,

  reporter: [
    ['html', { outputFolder: 'test/playwright/reports' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1280, height: 720 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 60_000,
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],

  outputDir: 'test/playwright/results',
});
