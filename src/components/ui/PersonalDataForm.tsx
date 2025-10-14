'use client';

import { useState } from 'react';
import PhoneInput from './PhoneInput';

interface PersonalData {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
}

interface PersonalDataFormProps {
  onSubmit: (data: PersonalData) => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string;
}

export default function PersonalDataForm({ onSubmit, onBack, isLoading, error }: PersonalDataFormProps) {
  const [formData, setFormData] = useState<PersonalData>({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<PersonalData>>({});

  const handleInputChange = (field: keyof PersonalData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Validación en tiempo real para email y teléfono
    if (field === 'email' && value.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors(prev => ({
          ...prev,
          email: 'El correo electrónico no es válido'
        }));
      }
    }

    if (field === 'phone' && value.trim()) {
      const phoneDigits = value.replace(/\s/g, '');
      if (!/^\d{10}$/.test(phoneDigits)) {
        setErrors(prev => ({
          ...prev,
          phone: 'El número debe tener exactamente 10 dígitos'
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PersonalData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El número de teléfono es requerido';
    } else {
      const phoneDigits = formData.phone.replace(/\s/g, '');
      if (!/^\d{10}$/.test(phoneDigits)) {
        newErrors.phone = 'El número debe tener exactamente 10 dígitos';
      }
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es requerida';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const nameIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );

  const emailIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 21.75 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );


  const calendarIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );

  const passwordIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );

  const eyeIcon = (show: boolean) => (
    <button
      type="button"
      onClick={() => show ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
      className="text-gray-400 hover:text-gray-600 transition-colors"
    >
      {(show ? showPassword : showConfirmPassword) ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-black">
          Datos Personales
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Completa tu información para finalizar el registro
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Nombre completo */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Nombre completo *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                {nameIcon}
              </div>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Ingresa tu nombre completo"
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 ${
                  errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>
          </div>

          {/* Correo electrónico */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Correo electrónico *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                {emailIcon}
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="correo@ejemplo.com"
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.email ? (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">Ingresa un correo electrónico válido</p>
              )}
            </div>
          </div>

          {/* Número de teléfono */}
          <PhoneInput
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            error={errors.phone}
          />

          {/* Fecha de nacimiento */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Fecha de nacimiento *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                {calendarIcon}
              </div>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700 ${
                  errors.birthDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
              )}
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Contraseña *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                {passwordIcon}
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                {eyeIcon(true)}
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Confirmar contraseña *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                {passwordIcon}
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirma tu contraseña"
                className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 ${
                  errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                {eyeIcon(false)}
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              disabled={isLoading}
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg shadow-purple-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>{isLoading ? 'Registrando...' : 'Registrarme'}</span>
            </button>
          </div>

          {/* Link a login */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <a href="/login" className="text-purple-600 font-semibold hover:text-purple-700 hover:underline transition-all duration-200">
                Inicia sesión
              </a>
            </p>
          </div>
        </form>
      </div>

      {/* Indicador de paso */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          <div className="w-8 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
