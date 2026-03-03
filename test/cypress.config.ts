import { defineConfig } from 'cypress';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local for local development
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 60000,
    video: true,
    videosFolder: 'test/cypress/videos',
    screenshotOnRunFailure: true,
    screenshotsFolder: 'test/cypress/screenshots',
    supportFile: 'test/support/e2e.ts',
    specPattern: 'test/e2e/**/*.cy.ts',
    fixturesFolder: 'test/fixtures',

    setupNodeEvents(on, config) {
      // Inject Supabase env vars into Cypress.env()
      // Priority: CYPRESS_ prefixed env vars (CI) > process.env (dotenv) > existing config.env
      config.env.NEXT_PUBLIC_SUPABASE_URL =
        process.env.CYPRESS_NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        config.env.NEXT_PUBLIC_SUPABASE_URL;

      config.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
        process.env.CYPRESS_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        config.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });

      return config;
    },
  },

  retries: {
    runMode: 2, // Retry failed tests 2 times in CI
    openMode: 0, // Don't retry in interactive mode
  },

  env: {
    // Performance test thresholds
    maxLoadTime: 4000, // 4 seconds max load time
    maxLCP: 2500, // 2.5s Largest Contentful Paint
    maxCLS: 0.1, // 0.1 Cumulative Layout Shift
  },
});
