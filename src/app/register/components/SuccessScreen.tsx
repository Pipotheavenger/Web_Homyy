'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SuccessScreen() {
  useEffect(() => {
    const redirectToDashboard = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        
        if (user) {
          // Verificar el tipo de usuario para redirigir al dashboard correcto
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('user_type')
            .eq('user_id', user.id)
            .single();

          if (profile) {
            setTimeout(() => {
              window.location.href = profile.user_type === 'worker' ? '/worker/dashboard' : '/user/dashboard';
            }, 3000);
          }
        }
      } catch (error) {
        console.error('Error redirigiendo:', error);
      }
    };

    redirectToDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            ¡Perfil creado exitosamente!
          </h1>
          <p className="text-gray-600 mb-8">
            Tu cuenta ha sido configurada correctamente. Te estamos redirigiendo a tu dashboard...
          </p>

          {/* Loading Animation */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





