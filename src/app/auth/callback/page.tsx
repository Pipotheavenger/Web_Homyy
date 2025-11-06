'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getUserType, redirectToUserDashboard } from '@/lib/auth-utils';
import Image from 'next/image';

// Deshabilitar prerenderizado para esta página
export const dynamic = 'force-dynamic';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu cuenta...');

  // Funciones helper para reducir complejidad cognitiva
  const handleAuthError = (errorParam: string | null, errorDescription: string | null): boolean => {
    if (!errorParam) return false;
    
    console.error('Auth error:', errorParam, errorDescription);
    setStatus('error');
    setMessage(errorDescription || 'Error en la verificación. Intenta de nuevo.');
    return true;
  };

  const handleCodeExchange = async (code: string, type: string | null): Promise<boolean> => {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Error exchanging code:', exchangeError);
      setStatus('error');
      setMessage('Error al verificar el enlace. Intenta de nuevo.');
      return false;
    }

    // Verificar si es recuperación de contraseña
    if (type === 'recovery') {
      setStatus('success');
      setMessage('Enlace verificado. Redirigiendo para cambiar tu contraseña...');
      setTimeout(() => {
        router.push('/auth/reset-password');
      }, 2000);
      return true; // Indica que se manejó completamente
    }

    return false; // Indica que necesita procesamiento adicional
  };

  const handleManualSession = async (accessToken: string, refreshToken: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (error) {
      console.error('Error setting session:', error);
      setStatus('error');
      setMessage('Error al establecer la sesión. Intenta de nuevo.');
      return false;
    }

    if (!data.session) {
      setStatus('error');
      setMessage('No se pudo establecer la sesión. Intenta de nuevo.');
      return false;
    }

    setStatus('success');
    setMessage('¡Cuenta verificada exitosamente! Redirigiendo...');
    await redirectToAppropriateDashboard(data.session.user);
    return true;
  };

  const handleExistingSession = async (): Promise<boolean> => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      setStatus('error');
      setMessage('Error al verificar la cuenta. Intenta de nuevo.');
      return false;
    }

    if (!sessionData.session) {
      router.push('/login');
      return false;
    }

    setStatus('success');
    setMessage('¡Cuenta verificada exitosamente! Redirigiendo...');
    await redirectToAppropriateDashboard(sessionData.session.user);
    return true;
  };

  const redirectToAppropriateDashboard = async (user: any) => {
    try {
      const userType = await getUserType(user.id);
      
      if (userType) {
        const dashboardPath = redirectToUserDashboard(userType);
        setTimeout(() => {
          router.push(dashboardPath);
        }, 2000);
      } else {
        console.error('No se pudo determinar el tipo de usuario');
        setTimeout(() => {
          router.push('/user/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error determining user type:', error);
      setTimeout(() => {
        router.push('/user/dashboard');
      }, 2000);
    }
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtener los parámetros de la URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const code = searchParams.get('code');
        const type = searchParams.get('type');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('Auth callback params:', { accessToken, refreshToken, code, type, errorParam, errorDescription });

        // Manejar errores de autenticación
        if (handleAuthError(errorParam, errorDescription)) return;

        // Intercambiar código por sesión si existe
        if (code) {
          const handled = await handleCodeExchange(code, type);
          if (handled) return; // Ya se procesó completamente (recuperación de contraseña)
        }

        // Establecer sesión manual si hay tokens
        if (accessToken && refreshToken) {
          if (await handleManualSession(accessToken, refreshToken)) return;
        }

        // Verificar sesión existente
        await handleExistingSession();
      } catch (err) {
        console.error('Unexpected error:', err);
        setStatus('error');
        setMessage('Error inesperado. Intenta de nuevo.');
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 bg-lavender overflow-hidden">
      {/* Background wave */}
      <div className="absolute inset-0 -z-10">
        <svg
          viewBox="0 0 1440 900"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#743fc6" />
              <stop offset="50%" stopColor="#8a5fd1" />
              <stop offset="100%" stopColor="#a17ad8" />
            </linearGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#purpleGrad)" />
        </svg>
      </div>

      {/* Content */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8 text-center animate-fade-in-up">
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            {status === 'loading' && (
              <div className="w-16 h-16 bg-[#743fc6]/10 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#743fc6]/30 border-t-[#743fc6] rounded-full animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'loading' && 'Verificando cuenta...'}
            {status === 'success' && '¡Verificación exitosa!'}
            {status === 'error' && 'Error en la verificación'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
        </div>

        {status === 'error' && (
          <div className="space-y-3">
            <a
              href="/login"
              className="inline-block w-full py-3 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] text-white rounded-xl font-semibold hover:from-[#8a5fd1] hover:to-[#743fc6] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99]"
            >
              Ir al Login
            </a>
            <a
              href="/register"
              className="inline-block w-full py-3 border-2 border-[#743fc6] text-[#743fc6] rounded-xl font-semibold hover:bg-[#743fc6] hover:text-white transition-all duration-300"
            >
              Intentar registro nuevamente
            </a>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </main>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Cargando...</h1>
          <p className="text-gray-600">Verificando tu cuenta...</p>
        </div>
      </main>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
} 