'use client';

import { useState } from 'react';

interface WorkerInfoData {
  profession: string;
  certifications: string[];
  experienceYears: string;
  categories: string[];
  bio: string;
}

interface WorkerInfoFormProps {
  onContinue: (data: WorkerInfoData) => void;
  onBack: () => void;
}

export default function WorkerInfoForm({ onContinue, onBack }: WorkerInfoFormProps) {
  const [formData, setFormData] = useState<WorkerInfoData>({
    profession: '',
    certifications: [''],
    experienceYears: '',
    categories: [],
    bio: ''
  });

  const availableCategories = [
    'Limpieza',
    'Plomería', 
    'Electricidad',
    'Jardinería',
    'Carpintería',
    'Pintura',
    'Albañilería',
    'Mecánica'
  ];

  const handleInputChange = (field: keyof WorkerInfoData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCertificationChange = (index: number, value: string) => {
    const newCertifications = [...formData.certifications];
    newCertifications[index] = value;
    setFormData(prev => ({
      ...prev,
      certifications: newCertifications
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const removeCertification = (index: number) => {
    if (formData.certifications.length > 1) {
      const newCertifications = formData.certifications.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        certifications: newCertifications
      }));
    }
  };

  const toggleCategory = (category: string) => {
    const isSelected = formData.categories.includes(category);
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c !== category)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filtrar certificaciones vacías
    const cleanedData = {
      ...formData,
      certifications: formData.certifications.filter(cert => cert.trim() !== '')
    };
    onContinue(cleanedData);
  };

  const professionIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
    </svg>
  );

  const certificateIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.25-4.875v4.875m0 0H21a.75.75 0 0 1 .75.75v.75c0 .414-.336.75-.75.75H3a.75.75 0 0 1-.75-.75v-.75a.75.75 0 0 1 .75-.75h5.25M16.5 8.25V6.108c0-1.135-.845-2.098-1.976-2.192A48.424 48.424 0 0 0 12 3.75c-2.649 0-5.194.429-7.577 1.22a2.016 2.016 0 0 0-1.423 1.937v.75" />
    </svg>
  );

  const experienceIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-black">
          Información Laboral
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Cuéntanos sobre tu experiencia profesional
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Profesión */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Profesión *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                {professionIcon}
              </div>
              <input
                type="text"
                value={formData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                placeholder="Ej: Electricista, Plomero, Jardinero"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* Certificaciones */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Certificados y Títulos
            </label>
            {formData.certifications.map((cert, index) => (
              <div key={index} className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    {certificateIcon}
                  </div>
                  <input
                    type="text"
                    value={cert}
                    onChange={(e) => handleCertificationChange(index, e.target.value)}
                    placeholder="Nombre del certificado o título"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                  />
                </div>
                {formData.certifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCertification(index)}
                    className="px-3 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addCertification}
              className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Agregar certificado
            </button>
          </div>

          {/* Años de experiencia */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Años de experiencia *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                {experienceIcon}
              </div>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.experienceYears}
                onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                placeholder="Ej: 5"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* Categorías */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Categorías de servicios *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    formData.categories.includes(category)
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {formData.categories.length === 0 && (
              <p className="text-sm text-gray-500">Selecciona al menos una categoría</p>
            )}
          </div>

          {/* Perfil laboral */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Perfil laboral *
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Describe tu experiencia, especialidades y qué te hace único como profesional..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 resize-none"
              required
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={!formData.profession || !formData.experienceYears || formData.categories.length === 0 || !formData.bio}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        </form>
      </div>

      {/* Indicador de paso */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          <div className="w-8 h-2 bg-white/40 rounded-full">
            <div className="w-4 h-2 bg-white rounded-full"></div>
          </div>
          <div className="w-2 h-2 bg-white/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
