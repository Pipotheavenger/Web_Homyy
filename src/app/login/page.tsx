'use client';
import { useState } from 'react';
import { useAuthForm } from '@/hooks/useAuthForm';
import { FormInput } from '@/components/ui/FormInput';
import { LoginHeader } from '@/components/ui/LoginHeader';
import { RecoverPasswordModal } from '@/components/ui/RecoverPasswordModal';
import BgWave from './BgWave';

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const {
    formData,
    errors,
    isLoading,
    focusedField,
    setFocusedField,
    handleInputChange,
    handleSubmit
  } = useAuthForm();

  const emailIcon = (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5a.75.75 0 01.75.75v12a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75v-12a.75.75 0 01.75-.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.75l-8.25 6-8.25-6" />
    </svg>
  );

  const passwordIcon = (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10V7.5a4.5 4.5 0 00-9 0V10" />
      <rect x="5.25" y="10" width="13.5" height="9.5" rx="2" />
    </svg>
  );

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPwd(!showPwd)}
      className="text-gray-500 hover:text-[#743fc6] transition-all duration-300 hover:scale-110 focus:outline-none focus:scale-110"
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
  );

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 bg-lavender overflow-hidden">
      <BgWave />
      <LoginHeader />

      <section className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 pb-0 animate-fade-in-up animation-delay-200">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-6 text-sm sm:text-base">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm font-medium animate-shake">
              {errors.general}
            </div>
          )}

          <FormInput
            type="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            error={errors.email}
            isFocused={focusedField === 'email'}
            icon={emailIcon}
            autoComplete="email"
          />

          <FormInput
            type={showPwd ? 'text' : 'password'}
            placeholder="Contraseña"
            value={formData.password}
            onChange={(value) => handleInputChange('password', value)}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            error={errors.password}
            isFocused={focusedField === 'password'}
            icon={passwordIcon}
            autoComplete="current-password"
            rightElement={passwordToggle}
          />

          <div className="flex justify-end text-xs sm:text-sm text-gray-600">
            <button 
              type="button"
              onClick={() => setShowRecoverModal(true)}
              className="text-[#743fc6] hover:text-[#8a5fd1] font-medium hover:underline transition-all duration-200 text-right leading-tight"
            >
              ¿No puedes entrar?<br />
              <span className="text-[#743fc6]">Recupera tu contraseña</span>
            </button>
          </div>

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


          <p className="text-center text-xs sm:text-sm text-gray-600 font-medium mb-0 pb-0">
            ¿Primera vez aquí?{' '}
            <a href="/register" className="text-[#743fc6] font-bold hover:text-[#8a5fd1] hover:underline transition-all duration-200">
              ¡Regístrate gratis!
            </a>
          </p>
        </form>
      </section>

      {/* Modal de recuperación de contraseña */}
      <RecoverPasswordModal 
        isOpen={showRecoverModal} 
        onClose={() => setShowRecoverModal(false)} 
      />

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