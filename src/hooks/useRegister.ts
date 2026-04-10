'use client';

import { useState } from 'react';
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: 'user',
          password: data.password,
          fullName: data.fullName,
          phone: data.phone,
          birthDate: data.birthDate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear la cuenta. Inténtalo de nuevo.');
      }

      setSuccess(true);
      return { success: true, userId: result.userId };

    } catch (error: any) {
      console.error('Error en registro de usuario:', error);

      const errorMessage = error.message || 'Error al crear la cuenta. Inténtalo de nuevo.';

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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: 'worker',
          password: data.password,
          fullName: data.fullName,
          phone: data.phone,
          birthDate: data.birthDate,
          profession: data.profession,
          experienceYears: data.experienceYears,
          selectedCategories: data.selectedCategories,
          profileDescription: data.profileDescription,
          certifications: data.certifications || [],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear la cuenta. Inténtalo de nuevo.');
      }

      setSuccess(true);
      return { success: true, userId: result.userId };

    } catch (error: any) {
      console.error('Error en registro de trabajador:', error);

      const errorMessage = error.message || 'Error al crear la cuenta. Inténtalo de nuevo.';

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
