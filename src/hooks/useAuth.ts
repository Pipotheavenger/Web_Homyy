'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getUserProfile, UserProfile } from '@/lib/auth-utils';
import { getCachedData, setCachedData, clearAllCache } from '@/lib/cache-utils';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Caché para perfiles de usuario (5 minutos TTL)
const PROFILE_CACHE_TTL = 5 * 60 * 1000;

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  });

  // Track current user ID to avoid unnecessary state updates on TOKEN_REFRESHED
  const userIdRef = useRef<string | null>(null);

  // Función optimizada para cargar perfil con caché
  const loadUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    // Intentar obtener del caché primero
    const cacheKey = `user_profile_${userId}`;
    const cached = getCachedData<UserProfile>(cacheKey, PROFILE_CACHE_TTL);
    if (cached) {
      return cached;
    }

    // Si no hay en caché, cargar desde Supabase
    const profile = await getUserProfile(userId);
    if (profile) {
      setCachedData(cacheKey, profile);
    }
    return profile;
  }, []);

  useEffect(() => {
    // onAuthStateChange dispara INITIAL_SESSION al suscribirse,
    // lo que cubre tanto "no hay sesión" como "ya hay sesión guardada".
    // No necesitamos getSession() aparte (evita doble SIGNED_IN).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          userIdRef.current = null;
          clearAllCache();
          localStorage.removeItem('userType');
          setAuthState({ user: null, profile: null, loading: false, error: null });
          return;
        }

        if (session?.user) {
          const isNewUser = session.user.id !== userIdRef.current;
          userIdRef.current = session.user.id;

          if (isNewUser) {
            // New user login or initial session - full profile load
            const profile = await loadUserProfile(session.user.id);
            setAuthState({
              user: session.user,
              profile,
              loading: false,
              error: null
            });
          } else {
            // Same user, token refresh - update user object without triggering cascades
            setAuthState(prev => ({ ...prev, user: session.user, loading: false }));
          }
        } else {
          userIdRef.current = null;
          setAuthState({ user: null, profile: null, loading: false, error: null });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error al cerrar sesión:', error);
        setAuthState(prev => ({ ...prev, error: error.message }));
      }
    } catch (error: any) {
      console.error('Error inesperado al cerrar sesión:', error);
      setAuthState(prev => ({ ...prev, error: error.message }));
    }
  };

  return {
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    error: authState.error,
    signOut,
    isAuthenticated: !!authState.user,
    userType: authState.profile?.user_type || null
  };
};
