'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getUserProfile, UserProfile } from '@/lib/auth-utils';
import { getCachedData, setCachedData, clearCachedData, clearAllCache } from '@/lib/cache-utils';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  userType: 'user' | 'worker' | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY = 1000; // 1 second

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  const userIdRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadUserProfile = useCallback(async (
    userId: string,
    options?: { skipCache?: boolean; isRetry?: boolean }
  ): Promise<UserProfile | null> => {
    const cacheKey = `user_profile_${userId}`;

    if (!options?.skipCache) {
      const cached = getCachedData<UserProfile>(cacheKey, PROFILE_CACHE_TTL);
      if (cached) return cached;
    } else {
      clearCachedData(cacheKey);
    }

    const profile = await getUserProfile(userId);
    if (profile) {
      setCachedData(cacheKey, profile);
      retryCountRef.current = 0;
      return profile;
    }

    // Profile load failed - schedule retry with exponential backoff
    if (!options?.isRetry && retryCountRef.current < MAX_RETRY_ATTEMPTS) {
      retryCountRef.current += 1;
      const delay = RETRY_BASE_DELAY * Math.pow(2, retryCountRef.current - 1);

      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(async () => {
        if (userIdRef.current === userId) {
          const retryProfile = await loadUserProfile(userId, { skipCache: true, isRetry: true });
          if (retryProfile) {
            setAuthState(prev => ({ ...prev, profile: retryProfile, error: null }));
          }
        }
      }, delay);
    }

    return null;
  }, []);

  const refreshProfile = useCallback(async () => {
    const userId = userIdRef.current;
    if (!userId) return;
    const profile = await loadUserProfile(userId, { skipCache: true });
    if (profile) {
      setAuthState(prev => ({ ...prev, profile, error: null }));
    }
  }, [loadUserProfile]);

  // Single auth subscription for the entire app
  useEffect(() => {
    let isMounted = true;

    // Explicit session check on mount — reliable even under React strict mode
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        userIdRef.current = session.user.id;
        loadUserProfile(session.user.id).then(profile => {
          if (!isMounted) return;
          setAuthState({
            user: session.user,
            profile,
            loading: false,
            error: profile ? null : 'Error loading profile',
          });
        });
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

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
          clearAllCache();
          localStorage.removeItem('userType');
          setAuthState({ user: null, profile: null, loading: false, error: null });
          return;
        }

        if (session?.user) {
          const isNewUser = session.user.id !== userIdRef.current;
          userIdRef.current = session.user.id;

          if (isNewUser) {
            const profile = await loadUserProfile(session.user.id);
            setAuthState({
              user: session.user,
              profile,
              loading: false,
              error: profile ? null : 'Error loading profile',
            });
          } else {
            // Token refresh - keep existing profile
            setAuthState(prev => ({ ...prev, user: session.user, loading: false }));
          }
        } else {
          userIdRef.current = null;
          setAuthState({ user: null, profile: null, loading: false, error: null });
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [loadUserProfile]);

  // Recovery: if user exists but profile is null after loading, retry
  useEffect(() => {
    if (authState.user && !authState.profile && !authState.loading) {
      const userId = authState.user.id;
      const timer = setTimeout(async () => {
        if (userIdRef.current === userId) {
          const profile = await loadUserProfile(userId, { skipCache: true });
          if (profile) {
            setAuthState(prev => ({ ...prev, profile, error: null }));
          }
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [authState.user, authState.profile, authState.loading, loadUserProfile]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error al cerrar sesion:', error);
        setAuthState(prev => ({ ...prev, error: error.message }));
      }
    } catch (error: any) {
      console.error('Error inesperado al cerrar sesion:', error);
      setAuthState(prev => ({ ...prev, error: error.message }));
    }
  }, []);

  const value: AuthContextType = {
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    error: authState.error,
    signOut,
    isAuthenticated: !!authState.user,
    userType: authState.profile?.user_type || null,
    refreshProfile,
  };

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
