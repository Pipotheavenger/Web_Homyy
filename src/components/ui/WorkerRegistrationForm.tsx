'use client';

import { useState, useEffect } from 'react';
import { FormInput } from './FormInput';
import { LoginHeader } from './LoginHeader';
import BgWave from '../../app/login/BgWave';
import { supabase } from '@/lib/supabase';

interface WorkerRegistrationFormProps {
  userEmail: string;
  onComplete: (userData: {
    name: string;
    phone: string;
    birthDate: string;
    profession: string;
    experienceYears: number;
    selectedCategories: string[];
  }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const WorkerRegistrationForm = ({ 
  userEmail, 
  onComplete, 
  onBack, 
  isLoading = false 
}: WorkerRegistrationFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthDate: '',
    profession: '',
    experienceYears: 1
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [focusedField, setFocusedField] = useState<string>('');

  // Cargar categorías desde la base de datos
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, icon, color')
          .order('name');

        if (error) {
          console.error('Error loading categories:', error);
          return;
        }

        setCategories(data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else if (prev.length < 3) {
        return [...prev, categoryId];
      }
      return prev;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
    if (!formData.birthDate) newErrors.birthDate = 'La fecha de nacimiento es requerida';
    if (!formData.profession.trim()) newErrors.profession = 'La profesión es requerida';
    if (selectedCategories.length === 0) newErrors.categories = 'Selecciona al menos una categoría';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Submitting worker form with data:', {
      name: formData.name,
      phone: formData.phone,
      birthDate: formData.birthDate,
      profession: formData.profession,
      experienceYears: formData.experienceYears,
      selectedCategories
    });

    onComplete({
      name: formData.name,
      phone: formData.phone,
      birthDate: formData.birthDate,
      profession: formData.profession,
      experienceYears: formData.experienceYears,
      selectedCategories
    });
  };

  const icons = {
    name: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>,
    phone: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>,
    calendar: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>,
    profession: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.605-9-1.7M21 13.255A23.931 23.931 0 0012 15c3.183 0 6.22-.605 9-1.7M21 13.255A23.931 23.931 0 0112 15c3.183 0-6.22-.605-9-1.7" />
    </svg>
  };

  if (isLoadingCategories) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 bg-lavender overflow-hidden">
        <BgWave />
        <LoginHeader showSlogan={false} />
        
        <section className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#743fc6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Cargando categorías...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 bg-lavender overflow-hidden">
      <BgWave />
      <LoginHeader showSlogan={false} />
      
      <section className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 sm:p-8 space-y-6 animate-fade-in-up">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-2">Datos Básicos</h2>
          <p className="text-gray-600 text-sm mb-1">Cuéntanos sobre ti y tu trabajo</p>
          <p className="text-[#743fc6] font-medium text-sm">{userEmail}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            type="text"
            placeholder="Tu nombre completo"
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
            error={errors.name}
            icon={icons.name}
            autoComplete="name"
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField('')}
            isFocused={focusedField === 'name'}
          />

          <FormInput
            type="tel"
            placeholder="Número de teléfono"
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            error={errors.phone}
            icon={icons.phone}
            autoComplete="tel"
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField('')}
            isFocused={focusedField === 'phone'}
          />

          <FormInput
            type="date"
            placeholder="Fecha de nacimiento"
            value={formData.birthDate}
            onChange={(value) => handleInputChange('birthDate', value)}
            error={errors.birthDate}
            icon={icons.calendar}
            autoComplete="bday"
            onFocus={() => setFocusedField('birthDate')}
            onBlur={() => setFocusedField('')}
            isFocused={focusedField === 'birthDate'}
          />

          <FormInput
            type="text"
            placeholder="Tu profesión o especialidad"
            value={formData.profession}
            onChange={(value) => handleInputChange('profession', value)}
            error={errors.profession}
            icon={icons.profession}
            autoComplete="organization-title"
            onFocus={() => setFocusedField('profession')}
            onBlur={() => setFocusedField('')}
            isFocused={focusedField === 'profession'}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Años de experiencia
            </label>
            <select
              value={formData.experienceYears}
              onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#743fc6] focus:ring-2 focus:ring-[#743fc6]/20 transition-all duration-300"
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map(year => (
                <option key={year} value={year}>
                  {year} {year === 1 ? 'año' : 'años'}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Selecciona hasta 3 categorías ({selectedCategories.length}/3)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 text-xs font-medium ${
                    selectedCategories.includes(category.id)
                      ? 'border-[#743fc6] bg-[#743fc6]/10 text-[#743fc6]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">{getCategoryIcon(category.icon)}</span>
                    <span className="text-center leading-tight">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
            {errors.categories && (
              <p className="text-red-500 text-xs">{errors.categories}</p>
            )}
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
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] text-white rounded-xl font-semibold hover:from-[#8a5fd1] hover:to-[#743fc6] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Siguiente...</span>
                </div>
              ) : (
                'Siguiente'
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

// Función helper para iconos de categorías
function getCategoryIcon(iconName: string) {
  const icons: Record<string, string> = {
    hammer: '🔨',
    zap: '⚡',
    leaf: '🍃',
    sparkles: '✨',
    heart: '❤️',
    'folder-open': '📁',
    plus: '➕',
    palette: '🎨',
    wrench: '🔧'
  };
  return icons[iconName] || '📋';
}
