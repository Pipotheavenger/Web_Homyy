'use client';

import { useEffect } from 'react';

interface RegisterSuccessProps {
  userType: 'user' | 'worker';
}

export default function RegisterSuccess({ userType }: RegisterSuccessProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/login';
    }, 4000);

    return () => clearTimeout(timer);
  }, [userType]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Contenido principal */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-12 text-center">
        {/* Icono de éxito */}
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>

        {/* Mensaje de éxito */}
        <div className="space-y-4 mb-8">
          <h2 className="text-3xl font-bold text-black">
            ¡Registro exitoso! 🎉
          </h2>
          <p className="text-gray-600 text-lg">
            Tu cuenta ha sido creada correctamente.
          </p>
        </div>

        {/* Información adicional */}
        <div className="bg-purple-50 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800 mb-2">
                Próximos pasos:
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Inicia sesión en tu cuenta</li>
                <li>• {userType === 'worker' ? 'Completa tu perfil profesional' : 'Publica tu primer servicio'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Indicador de redirección */}
        <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Redirigiendo al login en unos segundos...</span>
        </div>
      </div>

      {/* Progreso completado */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
