import { createLogger } from '../utils/logger';
import type { SupabaseClient } from '@supabase/supabase-js';

const log = createLogger('AUTH');

export interface AuthEvent {
  timestamp: number;
  event: string;
  sessionExists: boolean;
  userId: string | null;
  expiresAt: number | null;
  hasRefreshToken: boolean;
  error?: string;
}

export interface AuthMonitorState {
  events: AuthEvent[];
  currentSession: {
    userId: string | null;
    expiresAt: number | null;
    isExpired: boolean;
  } | null;
  tokenRefreshCount: number;
  errorCount: number;
  lastError: string | null;
}

const MAX_EVENTS = 100;

export function createAuthMonitor(supabaseClient: SupabaseClient) {
  const state: AuthMonitorState = {
    events: [],
    currentSession: null,
    tokenRefreshCount: 0,
    errorCount: 0,
    lastError: null,
  };

  let subscription: { unsubscribe: () => void } | null = null;
  let expiryWatcherInterval: ReturnType<typeof setInterval> | null = null;
  let unpatchGetUser: (() => void) | null = null;

  const addEvent = (event: AuthEvent) => {
    state.events.push(event);
    if (state.events.length > MAX_EVENTS) {
      state.events.shift();
    }
  };

  const checkInitialSession = async () => {
    try {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) {
        log.error('Initial getSession() failed', { error: error.message });
        state.errorCount++;
        state.lastError = error.message;
        addEvent({
          timestamp: Date.now(),
          event: 'INITIAL_SESSION_ERROR',
          sessionExists: false,
          userId: null,
          expiresAt: null,
          hasRefreshToken: false,
          error: error.message,
        });
        return;
      }

      const session = data?.session;
      if (session) {
        const isExpired = session.expires_at ? session.expires_at * 1000 < Date.now() : false;
        state.currentSession = {
          userId: session.user?.id ?? null,
          expiresAt: session.expires_at ?? null,
          isExpired,
        };
        log.info('Initial session found', {
          userId: session.user?.id?.slice(0, 8) + '...',
          expiresAt: session.expires_at
            ? new Date(session.expires_at * 1000).toISOString()
            : 'unknown',
          isExpired,
          hasRefreshToken: !!session.refresh_token,
        });
        addEvent({
          timestamp: Date.now(),
          event: 'INITIAL_SESSION_FOUND',
          sessionExists: true,
          userId: session.user?.id ?? null,
          expiresAt: session.expires_at ?? null,
          hasRefreshToken: !!session.refresh_token,
        });
      } else {
        log.warn('No initial session found');
        state.currentSession = null;
        addEvent({
          timestamp: Date.now(),
          event: 'NO_INITIAL_SESSION',
          sessionExists: false,
          userId: null,
          expiresAt: null,
          hasRefreshToken: false,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      log.error('Unexpected error in initial session check', { error: message });
      state.errorCount++;
      state.lastError = message;
    }
  };

  const startListening = () => {
    const {
      data: { subscription: sub },
    } = supabaseClient.auth.onAuthStateChange((event: string, session) => {
      const entry: AuthEvent = {
        timestamp: Date.now(),
        event,
        sessionExists: !!session,
        userId: session?.user?.id ?? null,
        expiresAt: session?.expires_at ?? null,
        hasRefreshToken: !!session?.refresh_token,
      };
      addEvent(entry);

      switch (event) {
        case 'SIGNED_IN':
          log.info('User signed in', {
            userId: session?.user?.id?.slice(0, 8) + '...',
          });
          state.currentSession = {
            userId: session?.user?.id ?? null,
            expiresAt: session?.expires_at ?? null,
            isExpired: false,
          };
          break;

        case 'SIGNED_OUT':
          log.warn('User signed out');
          state.currentSession = null;
          break;

        case 'TOKEN_REFRESHED':
          state.tokenRefreshCount++;
          log.info(`Token refreshed (#${state.tokenRefreshCount})`, {
            newExpiresAt: session?.expires_at
              ? new Date(session.expires_at * 1000).toISOString()
              : 'unknown',
          });
          if (state.currentSession) {
            state.currentSession.expiresAt = session?.expires_at ?? null;
            state.currentSession.isExpired = false;
          }
          break;

        case 'USER_UPDATED':
          log.info('User updated', { userId: session?.user?.id?.slice(0, 8) + '...' });
          break;

        case 'INITIAL_SESSION':
          log.debug('Initial session event from onAuthStateChange');
          break;

        default:
          log.warn(`Unknown auth event: ${event}`, { session: !!session });
      }
    });

    return sub;
  };

  const startExpiryWatcher = () => {
    return setInterval(() => {
      if (!state.currentSession?.expiresAt) return;

      const expiresAtMs = state.currentSession.expiresAt * 1000;
      const remainingMs = expiresAtMs - Date.now();
      const remainingMinutes = Math.round(remainingMs / 60000);

      if (remainingMs < 0) {
        log.error('SESSION EXPIRED! Token has not been refreshed.', {
          expiredAgo: `${Math.abs(remainingMinutes)} minutes`,
        });
        state.currentSession.isExpired = true;
      } else if (remainingMs < 5 * 60 * 1000) {
        log.warn(`Session expires in ${remainingMinutes} minutes`, {
          expiresAt: new Date(expiresAtMs).toISOString(),
        });
      }
    }, 30000);
  };

  const patchGetUser = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const auth = supabaseClient.auth as any;
    const originalGetUser = auth.getUser.bind(auth);

    auth.getUser = async (...args: unknown[]) => {
      try {
        const result = await originalGetUser(...args);
        if (result.error) {
          log.error('getUser() returned error', {
            error: result.error.message,
            code: result.error.code,
            status: result.error.status,
          });
          state.errorCount++;
          state.lastError = result.error.message;

          if (result.error.message?.includes('Refresh Token')) {
            log.error(
              '*** CRITICAL: Refresh Token Not Found. This causes blank screens. ***',
              { suggestion: 'Session likely corrupted. User needs to sign out and sign back in.' }
            );
          }
        }
        return result;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        log.error('getUser() threw exception', { error: message });
        state.errorCount++;
        state.lastError = message;
        throw err;
      }
    };

    return () => {
      auth.getUser = originalGetUser;
    };
  };

  const start = async () => {
    log.info('Auth Session Monitor started');
    await checkInitialSession();
    subscription = startListening();
    expiryWatcherInterval = startExpiryWatcher();
    unpatchGetUser = patchGetUser();
  };

  const stop = () => {
    subscription?.unsubscribe();
    if (expiryWatcherInterval) clearInterval(expiryWatcherInterval);
    unpatchGetUser?.();
    log.info('Auth Session Monitor stopped');
  };

  const getState = (): AuthMonitorState => ({
    ...state,
    events: [...state.events],
  });

  return { start, stop, getState };
}
