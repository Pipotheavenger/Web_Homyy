'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getUserProfile, UserProfile } from '@/lib/auth-utils';
import { getCachedData, setCachedData, clearCachedData } from '@/lib/cache-utils';

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
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error obteniendo sesión:', error);
          setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
          return;
        }

        if (session?.user) {
          // Cargar perfil con caché (más rápido)
          const profile = await loadUserProfile(session.user.id);
          setAuthState({
            user: session.user,
            profile,
            loading: false,
            error: null
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null
          });
        }
      } catch (error: any) {
        console.error('Error inesperado:', error);
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
      }
    };

    getInitialSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Cargar perfil con caché
          const profile = await loadUserProfile(session.user.id);
          setAuthState({
            user: session.user,
            profile,
            loading: false,
            error: null
          });
        } else {
          // Limpiar caché al cerrar sesión
          setAuthState(prev => {
            if (prev.user?.id) {
              clearCachedData(`user_profile_${prev.user.id}`);
            }
            return {
              user: null,
              profile: null,
              loading: false,
              error: null
            };
          });
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
