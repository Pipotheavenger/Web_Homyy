'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu cuenta...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setStatus('error');
          setMessage('Error al verificar la cuenta. Intenta de nuevo.');
          return;
        }

        if (data.session) {
          // Usuario autenticado exitosamente
          setStatus('success');
          setMessage('¡Cuenta verificada exitosamente! Redirigiendo...');
          
          // Redirigir al dashboard después de 2 segundos
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          // No hay sesión, verificar si hay error en la URL
          const errorParam = searchParams.get('error');
          const errorDescription = searchParams.get('error_description');
          
          if (errorParam) {
            setStatus('error');
            setMessage(errorDescription || 'Error en la verificación. Intenta de nuevo.');
          } else {
            // Redirigir al login si no hay sesión ni error
            router.push('/login');
          }
        }
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