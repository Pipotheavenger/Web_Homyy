'use client';
import Image from 'next/image';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import BgWave from './BgWave';

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors on change
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { email: '', password: '', general: '' };
    
    if (!formData.email) {
      newErrors.email = 'El correo es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Formato de correo inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Mínimo 6 caracteres';
    }
    
    setErrors(newErrors);
    
    if (!newErrors.email && !newErrors.password) {
      setIsLoading(true);
      
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrors(prev => ({ ...prev, general: 'Correo o contraseña incorrectos' }));
          } else if (error.message.includes('Email not confirmed')) {
            setErrors(prev => ({ ...prev, general: 'Por favor verifica tu correo electrónico' }));
          } else {
            setErrors(prev => ({ ...prev, general: 'Error al iniciar sesión. Intenta de nuevo.' }));
          }
        } else {
          // Redirigir al dashboard después del login exitoso
          window.location.href = '/dashboard';
        }
      } catch (err: any) {
        setErrors(prev => ({ ...prev, general: 'Error de conexión. Verifica tu internet.' }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('🔄 Iniciando login con Google...');
      
              const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        throw error;
      }
      
              console.log('✅ Login con Google iniciado');
      
    } catch (err: any) {
      console.error('❌ Google login error:', err);
      setErrors(prev => ({ ...prev, general: 'Error al conectar con Google. Intenta de nuevo.' }));
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 bg-lavender overflow-hidden">
      <BgWave />

      {/* Cabecera con animación de entrada */}
      <div className="flex flex-col items-center gap-3 mb-2 sm:mb-4 md:mb-6 animate-fade-in-up">
        <div className="relative group">
        <Image
            src="/logo.svg" 
            alt="Logo Hommy" 
            width={72} 
            height={72} 
          priority
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#743fc6] to-[#8a5fd1] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Hommy
        </h1>
        <p className="max-w-xs text-center text-gray-600 font-medium text-sm sm:text-base">
          Expertos confiables para tu hogar, al instante.
        </p>
      </div>

      {/* Tarjeta login con animación */}
      <section className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 pb-0 animate-fade-in-up animation-delay-200">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-6 text-sm sm:text-base">
          {/* Error general */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm font-medium animate-shake">
              {errors.general}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="block relative group">
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                focusedField === 'email' ? 'text-[#743fc6] scale-110' : 'text-gray-400'
              }`}>
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5a.75.75 0 01.75.75v12a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75v-12a.75.75 0 01.75-.75z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.75l-8.25 6-8.25-6" />
                </svg>
              </div>
              <input
                type="email"
                placeholder="Correo electrónico"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-10 pr-2 py-3 rounded-xl border-2 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 font-medium text-sm sm:text-base ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : focusedField === 'email'
                    ? 'border-[#743fc6] focus:border-[#743fc6] focus:ring-[#743fc6]/20'
                    : 'border-gray-200 hover:border-gray-300'
                } focus:ring-4 focus:outline-none hover:bg-white/80 focus:bg-white/90 hover:shadow-md focus:shadow-lg transform hover:scale-[1.01] focus:scale-[1.01]`}
              />
            </label>
            {errors.email && (
              <p className="text-red-500 text-xs ml-2 animate-shake font-medium leading-tight">{errors.email}</p>
            )}
          </div>

          {/* Contraseña */}
          <div className="space-y-1">
            <label className="block relative group">
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                focusedField === 'password' ? 'text-[#743fc6] scale-110' : 'text-gray-400'
              }`}>
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10V7.5a4.5 4.5 0 00-9 0V10" />
                  <rect x="5.25" y="10" width="13.5" height="9.5" rx="2" />
                </svg>
              </div>

              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Contraseña"
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 font-medium text-sm sm:text-base ${
                  errors.password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : focusedField === 'password'
                    ? 'border-[#743fc6] focus:border-[#743fc6] focus:ring-[#743fc6]/20'
                    : 'border-gray-200 hover:border-gray-300'
                } focus:ring-4 focus:outline-none hover:bg-white/80 focus:bg-white/90 hover:shadow-md focus:shadow-lg transform hover:scale-[1.01] focus:scale-[1.01]`}
              />

              {/* Toggle ojo */}
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#743fc6] transition-all duration-300 hover:scale-110 focus:outline-none focus:scale-110"
              >
                {showPwd ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12S5.7 5.25 12 5.25 21.75 12 21.75 12 18.3 18.75 12 18.75 2.25 12 2.25 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </label>
            {errors.password && (
              <p className="text-red-500 text-xs ml-2 animate-shake font-medium leading-tight">{errors.password}</p>
            )}
          </div>

          {/* Recordarme / Enlaces */}
          <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
            <label className="flex items-center gap-1 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={formData.remember}
                onChange={(e) => setFormData(prev => ({ ...prev, remember: e.target.checked }))}
                className="w-3 h-3 sm:w-4 sm:h-4 text-[#743fc6] border-2 border-gray-300 rounded focus:ring-[#743fc6] focus:ring-2 transition-all duration-200 hover:border-[#743fc6]"
              />
              <span className="font-medium group-hover:text-gray-800 transition-colors">Recuérdame</span>
            </label>
            <a href="#" className="text-[#743fc6] hover:text-[#8a5fd1] font-medium hover:underline transition-all duration-200 text-right leading-tight">
              ¿No puedes entrar?<br />
              <span className="text-[#743fc6]">Recupera tu contraseña</span>
        </a>
          </div>

          {/* Botón primario */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] text-white rounded-xl font-semibold hover:from-[#8a5fd1] hover:to-[#743fc6] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-sans relative overflow-hidden group text-sm sm:text-base"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <div className="flex items-center justify-center gap-2">
              {isLoading && (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span className={`transition-all duration-200 ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
                {isLoading ? 'Iniciando...' : 'Iniciar con mi cuenta'}
              </span>
            </div>
          </button>
          {/* Divisor */}
          <div className="flex items-center gap-2 my-1 sm:my-2 md:my-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 py-3 sm:py-4 rounded-xl bg-white/90 backdrop-blur-sm text-gray-700 font-semibold hover:bg-white hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-[1.01] active:scale-[0.99] font-sans group text-sm sm:text-base"
          >
            <span className="flex items-center justify-center shrink-0 w-5 h-5 sm:w-6 sm:h-6">
              {/* Google G logo oficial */}
              <svg className="w-full h-full block" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <g>
                  <path d="M17.64 9.2045c0-.638-.0573-1.2527-.1636-1.8409H9v3.4818h4.8445c-.2082 1.1227-.8345 2.0755-1.7764 2.7182v2.2582h2.8736C16.9782 14.1636 17.64 11.9273 17.64 9.2045z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.4673-.8055 5.9564-2.1864l-2.8736-2.2582c-.7973.5345-1.8136.8491-3.0827.8491-2.3727 0-4.3845-1.6027-5.1045-3.7573H.8782v2.3164C2.3609 16.8973 5.4545 18 9 18z" fill="#34A853"/>
                  <path d="M3.8955 10.6473c-.1818-.5345-.2864-1.1055-.2864-1.6973s.1045-1.1627.2864-1.6973V4.9364H.8782C.3182 6.1055 0 7.5055 0 9c0 1.4945.3182 2.8945.8782 4.0636l3.0173-2.4163z" fill="#FBBC05"/>
                  <path d="M9 3.5791c1.3227 0 2.5045.4545 3.4364 1.3455l2.5773-2.5773C13.4636.8055 11.4264 0 9 0 5.4545 0 2.3609 1.1027.8782 2.9364l3.0173 2.3164C4.6155 5.0282 6.6273 3.5791 9 3.5791z" fill="#EA4335"/>
                </g>
              </svg>
            </span>
            <span className="font-medium flex items-center">Inicia sesión con Google</span>
          </button>
          <p className="text-center text-xs sm:text-sm text-gray-600 font-medium mb-0 pb-0">
            ¿Primera vez aquí?{' '}
            <a href="/register" className="text-[#743fc6] font-bold hover:text-[#8a5fd1] hover:underline transition-all duration-200">
              ¡Regístrate gratis!
            </a>
          </p>
        </form>
      </section>

      {/* Animaciones CSS */}
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

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </main>
  );
}