/**
 * Authentication helpers for Playwright E2E tests.
 * Replaces test/support/auth.ts (Cypress version) which depends on
 * Cypress.env(), cy.window(), cy.session(), cy.fixture().
 */

import { createClient } from '@supabase/supabase-js';
import { Page } from '@playwright/test';

export const TEST_USERS = {
  client: { email: 'test.client@hommy.test', password: 'TestClient123!' },
  worker: { email: 'test.worker@hommy.test', password: 'TestWorker123!' },
} as const;

type UserRole = keyof typeof TEST_USERS;

/**
 * Authenticate via Supabase API and return the session object.
 * Runs in Node.js (not in the browser).
 */
async function getSupabaseSession(email: string, password: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(`Login failed for ${email}: ${error.message}`);
  if (!data.session) throw new Error(`No session returned for ${email}`);

  return data.session;
}

/**
 * Get or create the tab-unique storage key used by the app's Supabase client.
 * The app generates a UUID per tab (stored in sessionStorage as 'hommy-tab-id')
 * and uses `sb-auth-{tabId}` as the storageKey.
 * In tests, we ensure this key exists and return it.
 */
async function getOrCreateStorageKey(page: Page): Promise<string> {
  return page.evaluate(() => {
    let tabId = sessionStorage.getItem('hommy-tab-id');
    if (!tabId) {
      tabId = crypto.randomUUID();
      sessionStorage.setItem('hommy-tab-id', tabId);
    }
    return `sb-auth-${tabId}`;
  });
}

/**
 * Login as a test user and inject the session into the browser's localStorage.
 *
 * The page must be on the app's origin before we can set localStorage.
 * This function navigates to '/' first if needed.
 */
export async function loginAs(page: Page, role: UserRole): Promise<void> {
  const user = TEST_USERS[role];
  const session = await getSupabaseSession(user.email, user.password);

  const sessionData = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  };

  // Navigate to origin first so sessionStorage is accessible
  const currentUrl = page.url();
  if (
    currentUrl === 'about:blank' ||
    !currentUrl.startsWith('http://localhost:3000')
  ) {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  // Get the tab-unique storage key (creates hommy-tab-id if needed)
  const storageKey = await getOrCreateStorageKey(page);

  // Clear existing Supabase sessions from both storages, then set in sessionStorage
  await page.evaluate(
    ({ key, data }) => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('sb-'))
        .forEach((k) => localStorage.removeItem(k));
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith('sb-') || k === 'hommy-tab-id')
        .forEach((k) => {
          if (k !== 'hommy-tab-id') sessionStorage.removeItem(k);
        });

      sessionStorage.setItem(key, JSON.stringify(data));
    },
    { key: storageKey, data: sessionData }
  );

  // Reload so the Supabase client re-initializes with the new session
  await page.reload({ waitUntil: 'networkidle' });
}

/**
 * Login with arbitrary email/password via session injection.
 * Same mechanism as loginAs() but accepts credentials directly.
 */
export async function loginAsUser(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  const session = await getSupabaseSession(email, password);

  const sessionData = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  };

  const currentUrl = page.url();
  if (
    currentUrl === 'about:blank' ||
    !currentUrl.startsWith('http://localhost:3000')
  ) {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  // Get the tab-unique storage key (creates hommy-tab-id if needed)
  const storageKey = await getOrCreateStorageKey(page);

  await page.evaluate(
    ({ key, data }) => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('sb-'))
        .forEach((k) => localStorage.removeItem(k));
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith('sb-') || k === 'hommy-tab-id')
        .forEach((k) => {
          if (k !== 'hommy-tab-id') sessionStorage.removeItem(k);
        });

      sessionStorage.setItem(key, JSON.stringify(data));
    },
    { key: storageKey, data: sessionData }
  );

  await page.reload({ waitUntil: 'networkidle' });
}
