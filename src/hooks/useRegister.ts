'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RegisterUserData, RegisterWorkerData } from '@/types/database';

interface UseRegisterReturn {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  registerUser: (data: RegisterUserData) => Promise<{ success: boolean; error?: string; userId?: string }>;
  registerWorker: (data: RegisterWorkerData) => Promise<{ success: boolean; error?: string; userId?: string }>;
  clearError: () => void;
}

export const useRegister = (): UseRegisterReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const clearError = () => setError(null);

  const registerUser = async (data: RegisterUserData): Promise<{ success: boolean; error?: string; userId?: string }> => {
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

      // 2. Crear perfil de usuario usando función RPC
      const { error: profileError } = await supabase.rpc('create_user_profile', {
        p_user_id: authData.user.id,
        p_email: data.email,
        p_name: data.fullName,
        p_user_type: 'user',
        p_phone: data.phone,
        p_birth_date: data.birthDate
      });

      if (profileError) {
        throw new Error(profileError.message || 'Error al crear el perfil de usuario');
      }

      setSuccess(true);
      return { success: true, userId: authData.user.id };

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

  const registerWorker = async (data: RegisterWorkerData): Promise<{ success: boolean; error?: string; userId?: string }> => {
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

      // 2. Crear perfil de usuario usando función RPC
      const { error: profileError } = await supabase.rpc('create_user_profile', {
        p_user_id: authData.user.id,
        p_email: data.email,
        p_name: data.fullName,
        p_user_type: 'worker',
        p_phone: data.phone,
        p_birth_date: data.birthDate
      });

      if (profileError) {
        throw new Error(profileError.message || 'Error al crear el perfil de usuario');
      }

      // 3. Crear perfil de trabajador usando función RPC
      const { error: workerError } = await supabase.rpc('create_worker_profile', {
        p_user_id: authData.user.id,
        p_profession: data.profession,
        p_experience_years: data.experienceYears,
        p_bio: data.profileDescription,
        p_profile_description: data.profileDescription,
        p_categories: data.selectedCategories,
        p_certifications: data.certifications || []
      });

      if (workerError) {
        throw new Error(workerError.message || 'Error al crear el perfil de trabajador');
      }

      setSuccess(true);
      return { success: true, userId: authData.user.id };

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
