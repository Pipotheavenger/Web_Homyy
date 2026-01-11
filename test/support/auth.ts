/**
 * Authentication helpers for Cypress tests
 * Handles Supabase authentication for test users
 */

import { createClient } from '@supabase/supabase-js';

export interface TestUser {
  email: string;
  password: string;
  role: 'client' | 'worker' | 'admin';
}

/**
 * Create Supabase client for tests
 */
export function getSupabaseClient() {
  const supabaseUrl = Cypress.env('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = Cypress.env('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not found in environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Login via Supabase SDK
 * Returns the session data
 */
export async function loginViaSupabase(email: string, password: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Login failed: ${error.message}`);
  }

  if (!data.session) {
    throw new Error('No session returned from Supabase');
  }

  return data.session;
}

/**
 * Set Supabase session in browser localStorage
 * This allows bypassing the login form
 */
export function setSupabaseSession(session: any): void {
  const supabaseUrl = Cypress.env('NEXT_PUBLIC_SUPABASE_URL');

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL not found in environment');
  }

  // Extract the project ref from URL (e.g., kclglwxssvtwderrqgks from https://kclglwxssvtwderrqgks.supabase.co)
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const storageKey = `sb-${projectRef}-auth-token`;

  // Store session in localStorage
  const sessionData = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  };

  cy.window().then((win) => {
    win.localStorage.setItem(storageKey, JSON.stringify(sessionData));
  });
}

/**
 * Clear Supabase session from localStorage
 */
export function clearSupabaseSession(): void {
  cy.window().then((win) => {
    // Clear all localStorage items related to Supabase
    Object.keys(win.localStorage).forEach((key) => {
      if (key.startsWith('sb-')) {
        win.localStorage.removeItem(key);
      }
    });

    // Also clear sessionStorage
    Object.keys(win.sessionStorage).forEach((key) => {
      if (key.startsWith('sb-')) {
        win.sessionStorage.removeItem(key);
      }
    });
  });
}

/**
 * Perform login for a test user
 * This is the main function used by custom commands
 */
export function loginAsUser(userType: 'client' | 'worker' | 'admin'): void {
  cy.fixture('users').then((users) => {
    const user = users[userType] as TestUser;

    if (!user) {
      throw new Error(`User type '${userType}' not found in fixtures/users.json`);
    }

    cy.log(`Logging in as ${userType}: ${user.email}`);

    // Use cy.session to cache authentication
    cy.session(
      [userType, user.email],
      () => {
        cy.wrap(null).then(async () => {
          const session = await loginViaSupabase(user.email, user.password);
          setSupabaseSession(session);
        });
      },
      {
        validate() {
          // Validate that session exists
          cy.window().then((win) => {
            const supabaseUrl = Cypress.env('NEXT_PUBLIC_SUPABASE_URL');
            const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
            const storageKey = `sb-${projectRef}-auth-token`;
            const sessionData = win.localStorage.getItem(storageKey);

            if (!sessionData) {
              throw new Error('Session not found in localStorage');
            }
          });
        },
      }
    );
  });
}

/**
 * Logout current user
 */
export function logout(): void {
  cy.log('Logging out...');

  // Clear Supabase session
  clearSupabaseSession();

  // Visit logout or home page
  cy.visit('/');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): Cypress.Chainable<boolean> {
  return cy.window().then((win) => {
    const supabaseUrl = Cypress.env('NEXT_PUBLIC_SUPABASE_URL');
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
    const storageKey = `sb-${projectRef}-auth-token`;
    const sessionData = win.localStorage.getItem(storageKey);

    return !!sessionData;
  });
}

/**
 * Get current user from session
 */
export function getCurrentUser(): Cypress.Chainable<any | null> {
  return cy.window().then((win) => {
    const supabaseUrl = Cypress.env('NEXT_PUBLIC_SUPABASE_URL');
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
    const storageKey = `sb-${projectRef}-auth-token`;
    const sessionData = win.localStorage.getItem(storageKey);

    if (!sessionData) {
      return null;
    }

    try {
      const session = JSON.parse(sessionData);
      return session.user || null;
    } catch (e) {
      return null;
    }
  });
}
