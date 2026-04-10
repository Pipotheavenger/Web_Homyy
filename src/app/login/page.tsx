'use client';
import { useState } from 'react';
import { useAuthForm } from '@/hooks/useAuthForm';
import { formatColombiaMobileDisplay } from '@/lib/utils/phone-auth';
import { FormInput } from '@/components/ui/FormInput';
import { LoginHeader } from '@/components/ui/LoginHeader';
import dynamic from 'next/dynamic';
const RecoverPasswordModal = dynamic(
  () => import('@/components/ui/RecoverPasswordModal').then(mod => ({ default: mod.RecoverPasswordModal })),
  { ssr: false }
);
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

  const labelClassLogin =
    'block text-sm font-semibold text-slate-800 mb-1.5 tracking-tight';

  const colombiaPhonePrefix = (
    <>
      <span
        className="inline-flex shrink-0 overflow-hidden rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.06]"
        aria-hidden
      >
        <svg
          className="h-4 w-[22px] sm:h-[17px] sm:w-6 block"
          viewBox="0 0 20 15"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="20" height="5" fill="#FCD116" />
          <rect y="5" width="20" height="5" fill="#003893" />
          <rect y="10" width="20" height="5" fill="#CE1126" />
        </svg>
      </span>
      <span className="text-slate-600 font-semibold text-sm tabular-nums">+57</span>
    </>
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

          {/* Banner de registro */}
          <a
            href="/register"
            className="group relative flex items-center justify-between w-full overflow-hidden rounded-2xl border border-[#743fc6]/18 bg-gradient-to-r from-[#743fc6]/12 to-[#8a5fd1]/12 px-4 py-3.5 shadow-sm shadow-black/5 transition-all duration-300 hover:border-[#743fc6]/28 hover:from-[#743fc6]/16 hover:to-[#8a5fd1]/16 hover:shadow-md hover:shadow-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#743fc6]/45 active:scale-[0.99]"
            aria-label="Regístrate gratis en Hommy"
          >
            {/* Brillo / textura */}
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              aria-hidden
              style={{
                background:
                  'radial-gradient(900px 140px at 20% 0%, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0) 60%), radial-gradient(700px 220px at 78% 95%, rgba(138,95,209,0.18) 0%, rgba(138,95,209,0) 62%)'
              }}
            />

            {/* Estrella decorativa (similar a la referencia) */}
            <div className="pointer-events-none absolute -right-8 -top-7 h-24 w-24 rounded-full bg-[#8a5fd1]/16 blur-[0.5px]" aria-hidden />
            <svg
              className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 text-[#743fc6]/10"
              width="88"
              height="88"
              viewBox="0 0 88 88"
              fill="none"
              aria-hidden
            >
              <path
                d="M44 6l6.7 24.6L76 18.7 63.4 41.6 82 56 57.9 56.5 44 82 30.1 56.5 6 56 24.6 41.6 12 18.7 37.3 30.6 44 6z"
                fill="currentColor"
              />
            </svg>

            {/* Texto */}
            <div className="relative min-w-0 pr-12">
              <p className="text-xs sm:text-[13px] text-slate-900/55 font-semibold leading-none">
                ¿Nuevo en Hommy?
              </p>
              <p className="mt-1 text-base sm:text-[17px] font-extrabold tracking-tight text-[#743fc6]">
                ¡Regístrate gratis!
              </p>
            </div>

            {/* Botón circular con flecha */}
            <div className="relative">
              <div className="relative grid h-11 w-11 place-items-center rounded-full bg-white/60 ring-1 ring-[#743fc6]/12 shadow-sm transition-transform duration-300 group-hover:scale-[1.03]">
                <svg
                  className="h-5 w-5 text-[#743fc6] transition-transform duration-300 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.6}
                  stroke="currentColor"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </a>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm font-medium animate-shake">
              {errors.general}
            </div>
          )}

          <FormInput
            label="Número de teléfono *"
            labelClassName={labelClassLogin}
            helperText="Número de 10 dígitos (ej: 300 123 4567)"
            type="tel"
            placeholder="300 123 4567"
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', formatColombiaMobileDisplay(value))}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
            error={errors.phone}
            isFocused={focusedField === 'phone'}
            leftAddon={colombiaPhonePrefix}
            autoComplete="tel"
          />

          <FormInput
            label="Contraseña"
            labelClassName={labelClassLogin}
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

        .animation-delay-400 {
          animation-delay: 400ms;
          animation-fill-mode: both;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </main>
  );
}