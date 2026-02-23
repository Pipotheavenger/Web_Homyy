'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const ADMIN_EMAIL = 'admin@hommy.app';

export const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session || session.user.email !== ADMIN_EMAIL) {
          console.log('🔐 No admin auth found, redirecting to /admin');
          sessionStorage.removeItem('admin_authenticated');
          router.push('/admin');
          setIsLoading(false);
          return;
        }

        // Verificar que la sesión de admin esté activa
        console.log('🔐 Admin authentication verified');
        sessionStorage.setItem('admin_authenticated', 'true');
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/admin');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl mb-4 animate-pulse">
            <Lock size={32} className="text-white" />
          </div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

