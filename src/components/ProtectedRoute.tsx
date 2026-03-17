'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('user' | 'worker')[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  allowedUserTypes = ['user', 'worker'], 
  redirectTo 
}: ProtectedRouteProps) => {
  const { user, profile, loading, userType, refreshProfile } = useAuth();
  const router = useRouter();
  const attemptedProfileRefreshRef = useRef<string | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);

  useEffect(() => {
    if (loading || !user) {
      attemptedProfileRefreshRef.current = null;
      setCheckingProfile(false);
      return;
    }

    if (profile) {
      attemptedProfileRefreshRef.current = null;
      setCheckingProfile(false);
      return;
    }

    if (attemptedProfileRefreshRef.current === user.id) {
      return;
    }

    attemptedProfileRefreshRef.current = user.id;
    let isMounted = true;

    setCheckingProfile(true);
    refreshProfile()
      .catch((error) => {
        console.warn('No se pudo refrescar el perfil del usuario:', error);
      })
      .finally(() => {
        if (isMounted) {
          setCheckingProfile(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [loading, user, profile, refreshProfile]);

  useEffect(() => {
    if (!loading && !checkingProfile) {
      // Si no está autenticado, redirigir al login
      if (!user) {
        router.replace('/login');
        return;
      }

      // Si el usuario está autenticado pero no tiene perfil
      if (user && !profile) {
        console.warn('Usuario autenticado pero sin perfil en la base de datos');
        router.replace('/register');
        return;
      }

      // Si el tipo de usuario no está permitido en esta ruta
      if (userType && !allowedUserTypes.includes(userType)) {
        // Redirigir al dashboard apropiado según el tipo de usuario
        const targetDashboard = userType === 'worker' ? '/worker/dashboard' : '/user/dashboard';
        router.replace(redirectTo || targetDashboard);
        return;
      }
    }
  }, [user, profile, loading, checkingProfile, userType, allowedUserTypes, redirectTo, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lavender">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#743fc6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado o no tiene permisos, mostrar spinner mientras redirige
  if (!user || !profile || (userType && !allowedUserTypes.includes(userType))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lavender">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#743fc6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // Renderizar el contenido si todo está correcto
  return <>{children}</>;
};

// Componentes específicos para cada tipo de usuario
export const UserOnlyRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedUserTypes={['user']} redirectTo="/worker/dashboard">
    {children}
  </ProtectedRoute>
);

export const WorkerOnlyRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedUserTypes={['worker']} redirectTo="/user/dashboard">
    {children}
  </ProtectedRoute>
);
