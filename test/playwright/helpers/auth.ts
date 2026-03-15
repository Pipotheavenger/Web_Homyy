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
 * Derive the localStorage key from the Supabase URL.
 * e.g. https://kclglwxssvtwderrqgks.supabase.co → sb-kclglwxssvtwderrqgks-auth-token
 */
function getStorageKey(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  return `sb-${projectRef}-auth-token`;
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
  const storageKey = getStorageKey();

  const sessionData = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  };

  // Navigate to origin first so localStorage is accessible
  const currentUrl = page.url();
  if (
    currentUrl === 'about:blank' ||
    !currentUrl.startsWith('http://localhost:3000')
  ) {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  // Clear existing Supabase sessions, then set the new one
  await page.evaluate(
    ({ key, data }) => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('sb-'))
        .forEach((k) => localStorage.removeItem(k));
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith('sb-'))
        .forEach((k) => sessionStorage.removeItem(k));

      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: storageKey, data: sessionData }
  );

  // Reload so the Supabase client re-initializes with the new session from localStorage.
  // Without this, switching between users (e.g. client → worker) leaves the old session in memory.
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
  const storageKey = getStorageKey();

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

  await page.evaluate(
    ({ key, data }) => {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('sb-'))
        .forEach((k) => localStorage.removeItem(k));
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith('sb-'))
        .forEach((k) => sessionStorage.removeItem(k));

      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: storageKey, data: sessionData }
  );

  await page.reload({ waitUntil: 'networkidle' });
}
