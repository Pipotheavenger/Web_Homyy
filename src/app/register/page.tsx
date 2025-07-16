'use client';
import Image from 'next/image';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import BgWave from '../login/BgWave';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);


  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { email: '', password: '', confirmPassword: '', general: '' };
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
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    setErrors(newErrors);
    if (!newErrors.email && !newErrors.password && !newErrors.confirmPassword) {
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: 'https://www.mcdonalds.com.co/'
          }
        });
        
        if (error) {
          if (error.message.includes('User already registered')) {
            setErrors(prev => ({ ...prev, email: 'Este correo ya está registrado' }));
          } else if (error.message.includes('Invalid email')) {
            setErrors(prev => ({ ...prev, email: 'Correo electrónico inválido' }));
          } else {
            setErrors(prev => ({ ...prev, general: 'Error al crear la cuenta. Intenta de nuevo.' }));
          }
        } else {
          setShowSuccess(true);
          setFormData({ email: '', password: '', confirmPassword: '' });
        }
      } catch (err: any) {
        setErrors(prev => ({ ...prev, general: 'Error de conexión. Verifica tu internet.' }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (showSuccess) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 bg-lavender overflow-hidden">
        <BgWave />
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8 text-center animate-fade-in-up">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Registro Exitoso!</h2>
            <p className="text-gray-600 mb-6">
              Hemos enviado un correo de confirmación a tu dirección de email.
              <br />
              Por favor, revisa tu bandeja de entrada y confirma tu cuenta.
            </p>
          </div>
          <a
            href="/login"
            className="inline-block w-full py-3 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] text-white rounded-xl font-semibold hover:from-[#8a5fd1] hover:to-[#743fc6] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Ir al Login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 bg-lavender overflow-hidden">
      <BgWave />
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
          Crea tu cuenta gratis y conecta con expertos del hogar.
        </p>
      </div>
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
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${focusedField === 'email' ? 'text-[#743fc6] scale-110' : 'text-gray-400'}`}> 
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
                className={`w-full pl-10 pr-2 py-3 rounded-xl border-2 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 font-medium text-sm sm:text-base ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : focusedField === 'email' ? 'border-[#743fc6] focus:border-[#743fc6] focus:ring-[#743fc6]/20' : 'border-gray-200 hover:border-gray-300'} focus:ring-4 focus:outline-none hover:bg-white/80 focus:bg-white/90 hover:shadow-md focus:shadow-lg transform hover:scale-[1.01] focus:scale-[1.01]`}
              />
            </label>
            {errors.email && (
              <p className="text-red-500 text-xs ml-2 animate-shake font-medium leading-tight">{errors.email}</p>
            )}
          </div>
          {/* Contraseña */}
          <div className="space-y-1">
            <label className="block relative group">
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${focusedField === 'password' ? 'text-[#743fc6] scale-110' : 'text-gray-400'}`}> 
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10V7.5a4.5 4.5 0 00-9 0V10" />
                  <rect x="5.25" y="10" width="13.5" height="9.5" rx="2" />
                </svg>
              </div>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Contraseña"
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 font-medium text-sm sm:text-base ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : focusedField === 'password' ? 'border-[#743fc6] focus:border-[#743fc6] focus:ring-[#743fc6]/20' : 'border-gray-200 hover:border-gray-300'} focus:ring-4 focus:outline-none hover:bg-white/80 focus:bg-white/90 hover:shadow-md focus:shadow-lg transform hover:scale-[1.01] focus:scale-[1.01]`}
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
          {/* Confirmar contraseña */}
          <div className="space-y-1">
            <label className="block relative group">
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${focusedField === 'confirmPassword' ? 'text-[#743fc6] scale-110' : 'text-gray-400'}`}> 
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10V7.5a4.5 4.5 0 00-9 0V10" />
                  <rect x="5.25" y="10" width="13.5" height="9.5" rx="2" />
                </svg>
              </div>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Confirmar contraseña"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 font-medium text-sm sm:text-base ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : focusedField === 'confirmPassword' ? 'border-[#743fc6] focus:border-[#743fc6] focus:ring-[#743fc6]/20' : 'border-gray-200 hover:border-gray-300'} focus:ring-4 focus:outline-none hover:bg-white/80 focus:bg-white/90 hover:shadow-md focus:shadow-lg transform hover:scale-[1.01] focus:scale-[1.01]`}
              />
              {/* Toggle ojo para confirmar contraseña */}
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
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs ml-2 animate-shake font-medium leading-tight">{errors.confirmPassword}</p>
            )}
          </div>
          {/* Botón registro */}
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
              <span className="font-medium flex items-center">Crear cuenta</span>
            </div>
          </button>

          <p className="text-center text-xs sm:text-sm text-gray-600 font-medium mb-0 pb-0">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-[#743fc6] font-bold hover:text-[#8a5fd1] hover:underline transition-all duration-200">
              Inicia sesión
            </a>
          </p>
        </form>
      </section>
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