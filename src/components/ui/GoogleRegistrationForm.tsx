'use client';

import { useState } from 'react';
import { FormInput } from './FormInput';
import { LoginHeader } from './LoginHeader';
import BgWave from '../../app/login/BgWave';

interface GoogleRegistrationFormProps {
  userEmail: string;
  onComplete: (userData: {
    name: string;
    phone: string;
    birthDate: string;
    userType: 'user' | 'worker';
  }) => void;
  isLoading?: boolean;
}

export const GoogleRegistrationForm = ({ userEmail, onComplete, isLoading = false }: GoogleRegistrationFormProps) => {
  const [selectedRole, setSelectedRole] = useState<'user' | 'worker' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthDate: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRoleSelect = (role: 'user' | 'worker') => {
    setSelectedRole(role);
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    if (!selectedRole) {
      newErrors.role = 'Por favor selecciona un tipo de usuario';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es requerida';
    }

    if (newErrors.role || newErrors.name || newErrors.phone || newErrors.birthDate) {
      setErrors(newErrors);
      return;
    }

    onComplete({
      name: formData.name,
      phone: formData.phone,
      birthDate: formData.birthDate,
      userType: selectedRole!
    });
  };

  const userIcon = (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );

  const phoneIcon = (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );

  const calendarIcon = (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 bg-lavender overflow-hidden">
      <BgWave />
      <LoginHeader />
      
      <section className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 pb-0 animate-fade-in-up animation-delay-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenido a Hommy!</h2>
          <p className="text-gray-600 text-sm">
            Completa tu perfil para continuar
          </p>
          <p className="text-[#743fc6] font-medium text-sm mt-1">
            {userEmail}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm font-medium animate-shake">
              {errors.general}
            </div>
          )}

          {/* Selección de rol */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              ¿Qué quieres hacer en Hommy?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('user')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-sm font-medium ${
                  selectedRole === 'user'
                    ? 'border-[#743fc6] bg-[#743fc6]/10 text-[#743fc6]'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Buscar servicios</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => handleRoleSelect('worker')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-sm font-medium ${
                  selectedRole === 'worker'
                    ? 'border-[#743fc6] bg-[#743fc6]/10 text-[#743fc6]'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Vender servicios</span>
                </div>
              </button>
            </div>
            {errors.role && (
              <p className="text-red-500 text-xs">{errors.role}</p>
            )}
          </div>

          {/* Campos adicionales */}
          <FormInput
            type="text"
            placeholder="Tu nombre completo"
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
            error={errors.name}
            icon={userIcon}
            autoComplete="name"
          />

          <FormInput
            type="tel"
            placeholder="Teléfono"
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            error={errors.phone}
            icon={phoneIcon}
            autoComplete="tel"
          />

          <FormInput
            type="date"
            placeholder="Fecha de nacimiento"
            value={formData.birthDate}
            onChange={(value) => handleInputChange('birthDate', value)}
            error={errors.birthDate}
            icon={calendarIcon}
            autoComplete="bday"
          />

          <button
            type="submit"
            disabled={isLoading || !selectedRole}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] text-white rounded-xl font-semibold hover:from-[#8a5fd1] hover:to-[#743fc6] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-sans relative overflow-hidden group text-sm sm:text-base"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <div className="flex items-center justify-center gap-2">
              {isLoading && (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span className="font-medium flex items-center">
                {isLoading ? 'Completando registro...' : 'Completar registro'}
              </span>
            </div>
          </button>
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
};
