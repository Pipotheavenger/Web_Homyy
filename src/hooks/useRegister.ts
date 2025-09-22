'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RegisterUserData, RegisterWorkerData } from '@/types/database';

interface UseRegisterReturn {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  registerUser: (data: RegisterUserData) => Promise<{ success: boolean; error?: string }>;
  registerWorker: (data: RegisterWorkerData) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export const useRegister = (): UseRegisterReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const clearError = () => setError(null);

  const registerUser = async (data: RegisterUserData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
            birth_date: data.birthDate
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      // 2. Crear perfil de usuario
      const profileData = {
        user_id: authData.user.id,
        email: data.email,
        name: data.fullName,
        user_type: 'user' as const,
        phone: data.phone,
        birth_date: data.birthDate
      };

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileData);

      if (profileError) {
        console.error('Error creando perfil de usuario:', profileError);
        throw new Error('Error al crear el perfil de usuario');
      }

      setSuccess(true);
      return { success: true };

    } catch (error: any) {
      console.error('Error en registro de usuario:', error);
      
      let errorMessage = 'Error al crear la cuenta. Inténtalo de nuevo.';
      
      if (error.message) {
        if (error.message.includes('User already registered')) {
          errorMessage = 'Este correo electrónico ya está registrado';
        } else if (error.message.includes('Password should be at least 6 characters')) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'El correo electrónico no es válido';
        } else if (error.message.includes('duplicate key value')) {
          errorMessage = 'Este correo electrónico ya está en uso';
        }
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };

    } finally {
      setIsLoading(false);
    }
  };

  const registerWorker = async (data: RegisterWorkerData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
            birth_date: data.birthDate
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      // 2. Crear perfil de usuario
      const profileData = {
        user_id: authData.user.id,
        email: data.email,
        name: data.fullName,
        user_type: 'worker' as const,
        phone: data.phone,
        birth_date: data.birthDate
      };

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileData);

      if (profileError) {
        console.error('Error creando perfil de usuario:', profileError);
        throw new Error('Error al crear el perfil de usuario');
      }

      // 3. Crear perfil de trabajador
      const workerData = {
        user_id: authData.user.id,
        profession: data.profession,
        experience_years: data.experienceYears,
        bio: data.profileDescription,
        profile_description: data.profileDescription,
        categories: data.selectedCategories,
        certifications: data.certifications || [],
        hourly_rate: null,
        rating: 0.0,
        total_services: 0,
        is_verified: false,
        is_available: true,
        location: null
      };

      const { error: workerError } = await supabase
        .from('worker_profiles')
        .insert(workerData);

      if (workerError) {
        console.error('Error creando perfil de trabajador:', workerError);
        // No lanzamos error aquí para no interrumpir el flujo
        console.warn('El perfil de trabajador no se pudo crear, pero el usuario fue registrado');
      }

      setSuccess(true);
      return { success: true };

    } catch (error: any) {
      console.error('Error en registro de trabajador:', error);
      
      let errorMessage = 'Error al crear la cuenta. Inténtalo de nuevo.';
      
      if (error.message) {
        if (error.message.includes('User already registered')) {
          errorMessage = 'Este correo electrónico ya está registrado';
        } else if (error.message.includes('Password should be at least 6 characters')) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'El correo electrónico no es válido';
        } else if (error.message.includes('duplicate key value')) {
          errorMessage = 'Este correo electrónico ya está en uso';
        }
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };

    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    success,
    registerUser,
    registerWorker,
    clearError
  };
};
