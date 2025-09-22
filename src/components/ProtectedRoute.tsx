'use client';

import { useEffect } from 'react';
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
  const { user, profile, loading, userType } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Si no está autenticado, redirigir al login
      if (!user) {
        router.push('/login');
        return;
      }

      // Si el usuario está autenticado pero no tiene perfil
      if (user && !profile) {
        console.warn('Usuario autenticado pero sin perfil en la base de datos');
        router.push('/register');
        return;
      }

      // Si el tipo de usuario no está permitido en esta ruta
      if (userType && !allowedUserTypes.includes(userType)) {
        // Redirigir al dashboard apropiado según el tipo de usuario
        const targetDashboard = userType === 'worker' ? '/worker/dashboard' : '/user/dashboard';
        router.push(redirectTo || targetDashboard);
        return;
      }
    }
  }, [user, profile, loading, userType, allowedUserTypes, redirectTo, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lavender">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#743fc6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado o no tiene permisos, no renderizar nada
  if (!user || !profile || (userType && !allowedUserTypes.includes(userType))) {
    return null;
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
