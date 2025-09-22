'use client';

import { useState } from 'react';
import { LoginHeader } from './LoginHeader';
import BgWave from '../../app/login/BgWave';

interface UserTypeSelectionProps {
  userEmail: string;
  onSelectType: (type: 'client' | 'worker') => void;
}

export const UserTypeSelection = ({ userEmail, onSelectType }: UserTypeSelectionProps) => {
  const [selectedType, setSelectedType] = useState<'client' | 'worker' | null>(null);

  const handleTypeSelect = (type: 'client' | 'worker') => {
    setSelectedType(type);
    setTimeout(() => onSelectType(type), 300); // Pequeña animación antes de cambiar
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 bg-lavender overflow-hidden">
      <BgWave />
      <LoginHeader showSlogan={false} />
      
      <section className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 sm:p-8 space-y-6 animate-fade-in-up">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-2">¡Bienvenido a Hommy!</h2>
          <p className="text-gray-600 text-sm mb-1">¿Qué quieres hacer?</p>
          <p className="text-[#743fc6] font-medium text-sm">{userEmail}</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Cliente */}
          <button
            onClick={() => handleTypeSelect('client')}
            className={`p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
              selectedType === 'client'
                ? 'border-[#743fc6] bg-[#743fc6]/10 scale-105'
                : 'border-gray-200 bg-white hover:border-[#743fc6]/50 hover:bg-[#743fc6]/5'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                selectedType === 'client' ? 'bg-[#743fc6] text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Buscar Servicios</h3>
                <p className="text-sm text-gray-600">Encuentra profesionales para tus proyectos</p>
              </div>
              {selectedType === 'client' && (
                <div className="w-6 h-6 bg-[#743fc6] text-white rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>

          {/* Trabajador */}
          <button
            onClick={() => handleTypeSelect('worker')}
            className={`p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
              selectedType === 'worker'
                ? 'border-[#743fc6] bg-[#743fc6]/10 scale-105'
                : 'border-gray-200 bg-white hover:border-[#743fc6]/50 hover:bg-[#743fc6]/5'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                selectedType === 'worker' ? 'bg-[#743fc6] text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Vender Servicios</h3>
                <p className="text-sm text-gray-600">Ofrece tus habilidades y gana dinero</p>
              </div>
              {selectedType === 'worker' && (
                <div className="w-6 h-6 bg-[#743fc6] text-white rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        </div>

        {selectedType && (
          <div className="text-center pt-4">
            <div className="w-6 h-6 bg-[#743fc6] text-white rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <p className="text-sm text-[#743fc6] font-medium">Redirigiendo...</p>
          </div>
        )}
      </section>

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
      `}</style>
    </main>
  );
};


