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
type StorageEntry = [string, string];

// Must match the scoped key format in src/lib/supabase.ts
const STORAGE_KEY = 'sb-hommy-auth';
const SESSION_SCOPE_STORAGE_KEY = 'hommy-tab-id';

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

async function ensureAppOrigin(page: Page): Promise<void> {
  const currentUrl = page.url();
  if (
    currentUrl === 'about:blank' ||
    !currentUrl.startsWith('http://localhost:3000')
  ) {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  }
}

/**
 * Login as a test user and inject the session into the browser's sessionStorage.
 *
 * The page must be on the app's origin before we can set sessionStorage.
 * This function navigates to '/' first if needed.
 */
export async function loginAs(page: Page, role: UserRole): Promise<void> {
  const user = TEST_USERS[role];
  const session = await getSupabaseSession(user.email, user.password);
  const scopeId = `playwright-${role}-${Date.now()}`;

  const sessionData = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  };

  // Navigate to origin first so sessionStorage is accessible
  await ensureAppOrigin(page);

  // Clear existing Supabase sessions from both storages, then set in sessionStorage
  await page.evaluate(
    ({ key, data, scopeId, sessionScopeKey }) => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('sb-'))
        .forEach((k) => localStorage.removeItem(k));
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith('sb-') || k === 'hommy-tab-id')
        .forEach((k) => sessionStorage.removeItem(k));

      sessionStorage.setItem(sessionScopeKey, scopeId);
      sessionStorage.setItem(`${key}:${scopeId}`, JSON.stringify(data));
    },
    { key: STORAGE_KEY, data: sessionData, scopeId, sessionScopeKey: SESSION_SCOPE_STORAGE_KEY }
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
  const scopeId = `playwright-user-${Date.now()}`;

  const sessionData = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  };

  await ensureAppOrigin(page);

  await page.evaluate(
    ({ key, data, scopeId, sessionScopeKey }) => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('sb-'))
        .forEach((k) => localStorage.removeItem(k));
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith('sb-') || k === 'hommy-tab-id')
        .forEach((k) => sessionStorage.removeItem(k));

      sessionStorage.setItem(sessionScopeKey, scopeId);
      sessionStorage.setItem(`${key}:${scopeId}`, JSON.stringify(data));
    },
    { key: STORAGE_KEY, data: sessionData, scopeId, sessionScopeKey: SESSION_SCOPE_STORAGE_KEY }
  );

  await page.reload({ waitUntil: 'networkidle' });
}

export async function captureSessionStorage(
  page: Page
): Promise<StorageEntry[]> {
  await ensureAppOrigin(page);
  return page.evaluate(() =>
    Object.entries(sessionStorage).map(([key, value]) => [key, value])
  );
}

export async function restoreSessionStorage(
  page: Page,
  entries: StorageEntry[]
): Promise<void> {
  await ensureAppOrigin(page);
  await page.evaluate((storageEntries) => {
    sessionStorage.clear();
    for (const [key, value] of storageEntries) {
      sessionStorage.setItem(key, value);
    }
  }, entries);
}

export async function cloneSessionStorageToPage(
  sourcePage: Page,
  targetPage: Page
): Promise<void> {
  const entries = await captureSessionStorage(sourcePage);
  await restoreSessionStorage(targetPage, entries);
}

export async function openDuplicatedTab(sourcePage: Page): Promise<Page> {
  const entries = await captureSessionStorage(sourcePage);
  const newPage = await sourcePage.context().newPage();

  // Page-scoped init script: only the duplicated tab gets the cloned
  // sessionStorage. Using page.addInitScript (not context.addInitScript)
  // so the original tab's future navigations are not affected.
  await newPage.addInitScript((storageEntries: StorageEntry[]) => {
    sessionStorage.clear();
    for (const [key, value] of storageEntries) {
      sessionStorage.setItem(key, value);
    }
  }, entries);

  return newPage;
}
