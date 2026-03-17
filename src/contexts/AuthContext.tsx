'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { clearCurrentUserAuthStorage, supabase } from '@/lib/supabase';
import {
  getUserProfileResult,
  UserProfile,
} from '@/lib/auth-utils';
import { getCachedData, setCachedData, clearCachedData, clearAllCache } from '@/lib/cache-utils';

type ProfileState = 'idle' | 'loaded' | 'missing' | 'error';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  profileState: ProfileState;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  profileState: ProfileState;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  userType: 'user' | 'worker' | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY = 1000; // 1 second
const INITIAL_SESSION_TIMEOUT_MS = 15000;
const PROFILE_LOAD_TIMEOUT_MS = 15000;

interface ProfileLoadResult {
  profile: UserProfile | null;
  state: Exclude<ProfileState, 'idle'>;
  error: string | null;
}

const createLoggedOutState = (
  overrides?: Partial<AuthState>
): AuthState => ({
  user: null,
  profile: null,
  loading: false,
  error: null,
  profileState: 'idle',
  ...overrides,
});

const withTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
    profileState: 'idle',
  });

  const userIdRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear cached data plus the scoped Supabase session payload for this tab group.
  const purgeAllSessionData = useCallback(() => {
    queryClient.clear();
    clearAllCache();
    Object.keys(localStorage)
      .filter(k => k.startsWith('sb-') || k === 'userType')
      .forEach(k => localStorage.removeItem(k));
    Object.keys(sessionStorage)
      .filter(k => k.startsWith('sb-'))
      .forEach(k => sessionStorage.removeItem(k));
  }, [queryClient]);

  const loadUserProfile = useCallback(async (
    userId: string,
    options?: { skipCache?: boolean; isRetry?: boolean }
  ): Promise<ProfileLoadResult> => {
    const cacheKey = `user_profile_${userId}`;
    const scheduleRetry = (message: string): ProfileLoadResult => {
      if (!options?.isRetry && retryCountRef.current < MAX_RETRY_ATTEMPTS) {
        retryCountRef.current += 1;
        const delay = RETRY_BASE_DELAY * Math.pow(2, retryCountRef.current - 1);

        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        retryTimerRef.current = setTimeout(async () => {
          if (userIdRef.current === userId) {
            const retryProfile = await loadUserProfile(userId, { skipCache: true, isRetry: true });
            if (retryProfile.state === 'loaded') {
              setAuthState(prev => ({
                ...prev,
                profile: retryProfile.profile,
                error: null,
                profileState: 'loaded',
              }));
            }
          }
        }, delay);
      }

      return {
        profile: null,
        state: 'error',
        error: message,
      };
    };

    if (options?.skipCache) {
      clearCachedData(cacheKey);
    } else {
      const cached = getCachedData<UserProfile>(cacheKey, PROFILE_CACHE_TTL);
      if (cached) {
        return {
          profile: cached,
          state: 'loaded',
          error: null,
        };
      }
    }

    try {
      const result = await withTimeout(
        getUserProfileResult(userId),
        PROFILE_LOAD_TIMEOUT_MS,
        'Tiempo de espera agotado cargando el perfil del usuario'
      );

      if (result.status === 'found' && result.profile) {
        setCachedData(cacheKey, result.profile);
        retryCountRef.current = 0;
        return {
          profile: result.profile,
          state: 'loaded',
          error: null,
        };
      }

      retryCountRef.current = 0;
      if (result.status === 'missing') {
        return {
          profile: null,
          state: 'missing',
          error: null,
        };
      }

      return scheduleRetry(
        result.error || 'No se pudo cargar el perfil del usuario'
      );
    } catch (error) {
      return scheduleRetry(
        error instanceof Error
          ? error.message
          : 'Error inesperado cargando el perfil del usuario'
      );
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const userId = userIdRef.current;
    if (!userId) return;
    const result = await loadUserProfile(userId, { skipCache: true });
    setAuthState(prev => ({
      ...prev,
      profile: result.profile,
      loading: false,
      error: result.error,
      profileState: result.state,
    }));
  }, [loadUserProfile]);

  const applyAuthenticatedState = useCallback(
    async (user: User, options?: { skipCache?: boolean }) => {
      userIdRef.current = user.id;
      const profileResult = await loadUserProfile(user.id, options);

      return {
        user,
        profile: profileResult.profile,
        loading: false,
        error: profileResult.error,
        profileState: profileResult.state,
      } satisfies AuthState;
    },
    [loadUserProfile]
  );

  const handleSessionRecoveryFailure = useCallback((message: string) => {
    console.error('Error rehidratando la sesión:', message);
    userIdRef.current = null;
    retryCountRef.current = 0;
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    clearCurrentUserAuthStorage();
    setAuthState(createLoggedOutState({
      error: message,
      profileState: 'error',
    }));
  }, []);

  // Single auth subscription for the entire app
  useEffect(() => {
    let isMounted = true;
    const resolveInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await withTimeout(
          supabase.auth.getSession(),
          INITIAL_SESSION_TIMEOUT_MS,
          'Tiempo de espera agotado restaurando la sesión'
        );

        if (!isMounted) return;

        if (error) {
          handleSessionRecoveryFailure(
            error.message || 'No se pudo restaurar la sesión'
          );
          return;
        }

        if (session?.user) {
          const nextState = await applyAuthenticatedState(session.user);
          if (!isMounted) return;
          setAuthState(nextState);
          return;
        }

        setAuthState(createLoggedOutState());
      } catch (error) {
        if (!isMounted) return;
        handleSessionRecoveryFailure(
          error instanceof Error
            ? error.message
            : 'No se pudo restaurar la sesión'
        );
      }
    };

    void resolveInitialSession();

    // Listen for ongoing auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        // INITIAL_SESSION already handled by getSession() above
        if (event === 'INITIAL_SESSION') return;

        if (event === 'SIGNED_OUT') {
          userIdRef.current = null;
          retryCountRef.current = 0;
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
          purgeAllSessionData();
          setAuthState(createLoggedOutState());
          return;
        }

        if (session?.user) {
          const isNewUser = session.user.id !== userIdRef.current;
          userIdRef.current = session.user.id;

          if (isNewUser) {
            // Clear previous user's cached data before loading new profile
            queryClient.clear();
            clearAllCache();
            const nextState = await applyAuthenticatedState(session.user);
            if (!isMounted) return;
            setAuthState(nextState);
          } else {
            // Token refresh - keep existing profile
            setAuthState(prev => ({ ...prev, user: session.user, loading: false }));
          }
        } else {
          userIdRef.current = null;
          setAuthState(createLoggedOutState());
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [applyAuthenticatedState, handleSessionRecoveryFailure, purgeAllSessionData, queryClient]);

  // Recovery: if user exists but profile is null after loading, retry
  useEffect(() => {
    if (
      authState.user &&
      !authState.profile &&
      !authState.loading &&
      authState.profileState === 'error'
    ) {
      const userId = authState.user.id;
      const timer = setTimeout(async () => {
        if (userIdRef.current === userId) {
          const result = await loadUserProfile(userId, { skipCache: true });
          setAuthState(prev => ({
            ...prev,
            profile: result.profile,
            error: result.error,
            profileState: result.state,
          }));
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [authState.user, authState.profile, authState.loading, authState.profileState, loadUserProfile]);

  const signOut = useCallback(async () => {
    try {
      // Race signOut against a 5s timeout to prevent hanging
      const result = await Promise.race([
        supabase.auth.signOut(),
        new Promise<{ error: { message: string } }>((resolve) =>
          setTimeout(() => resolve({ error: { message: 'Timeout' } }), 5000)
        ),
      ]);
      if (result.error) {
        console.warn('signOut error/timeout:', result.error);
      }
    } catch (error: any) {
      console.error('Error inesperado al cerrar sesion:', error);
    } finally {
      // ALWAYS purge all data, whether signOut succeeded or not
      userIdRef.current = null;
      retryCountRef.current = 0;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      purgeAllSessionData();
      setAuthState(createLoggedOutState());
    }
  }, [purgeAllSessionData]);

  const value: AuthContextType = useMemo(() => ({
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    error: authState.error,
    profileState: authState.profileState,
    signOut,
    isAuthenticated: !!authState.user,
    userType: authState.profile?.user_type || null,
    refreshProfile,
  }), [authState.user, authState.profile, authState.loading, authState.error, authState.profileState, signOut, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
