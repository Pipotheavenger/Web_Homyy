'use client';

import { useState } from 'react';
import { LoginHeader } from './LoginHeader';
import BgWave from '../../app/login/BgWave';

interface WorkerProfileFormProps {
  userEmail: string;
  basicData: {
    profession: string;
    experienceYears: number;
    selectedCategories: string[];
  };
  onComplete: (profileData: {
    profileDescription: string;
  }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const WorkerProfileForm = ({ 
  userEmail, 
  basicData, 
  onComplete, 
  onBack, 
  isLoading = false 
}: WorkerProfileFormProps) => {
  const [profileDescription, setProfileDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileDescription.trim()) {
      setErrors({ profileDescription: 'La descripción del perfil es requerida' });
      return;
    }

    onComplete({ profileDescription: profileDescription.trim() });
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 bg-lavender overflow-hidden">
      <BgWave />
      <LoginHeader showSlogan={false} />
      
      <section className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 sm:p-8 space-y-6 animate-fade-in-up">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-2">Perfil Laboral</h2>
          <p className="text-gray-600 text-sm mb-1">Cuéntanos más sobre tu trabajo</p>
          <p className="text-[#743fc6] font-medium text-sm">{userEmail}</p>
        </div>

        {/* Resumen de datos básicos */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <h3 className="font-semibold text-gray-900 text-sm">Resumen de datos:</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p><span className="font-medium">Profesión:</span> {basicData.profession}</p>
            <p><span className="font-medium">Experiencia:</span> {basicData.experienceYears} {basicData.experienceYears === 1 ? 'año' : 'años'}</p>
            <p><span className="font-medium">Categorías:</span> {basicData.selectedCategories.length} seleccionadas</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Descripción de tu perfil laboral
            </label>
            <textarea
              value={profileDescription}
              onChange={(e) => {
                setProfileDescription(e.target.value);
                if (errors.profileDescription) setErrors(prev => ({ ...prev, profileDescription: '' }));
              }}
              placeholder="Describe tu experiencia, habilidades especiales, forma de trabajar, etc. (mínimo 50 caracteres)"
              rows={4}
              className={`w-full px-4 py-3 border-2 rounded-xl resize-none transition-all duration-300 ${
                errors.profileDescription 
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-[#743fc6] focus:ring-2 focus:ring-[#743fc6]/20'
              }`}
            />
            {errors.profileDescription && (
              <p className="text-red-500 text-xs">{errors.profileDescription}</p>
            )}
            <p className="text-xs text-gray-500">
              {profileDescription.length}/500 caracteres
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
            >
              Atrás
            </button>
            
            <button
              type="submit"
              disabled={isLoading || profileDescription.length < 50}
              className="flex-1 py-3 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] text-white rounded-xl font-semibold hover:from-[#8a5fd1] hover:to-[#743fc6] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Completando...</span>
                </div>
              ) : (
                'Completar Registro'
              )}
            </button>
          </div>
        </form>
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


