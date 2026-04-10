import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { isValidMxPhone10Digits, normalizePhoneToDigits, phoneToAuthEmail } from '@/lib/utils/phone-auth';

interface FormData {
  phone: string;
  password: string;
  confirmPassword: string;
}

interface Errors {
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export const useRegisterForm = () => {
  const [formData, setFormData] = useState<FormData>({
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.phone) {
      newErrors.phone = 'El número de teléfono es requerido';
    } else if (!isValidMxPhone10Digits(formData.phone)) {
      newErrors.phone = 'El número debe tener exactamente 10 dígitos';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field as keyof Errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const digits = normalizePhoneToDigits(formData.phone);
      const authEmail = phoneToAuthEmail(digits);
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            phone: digits,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setShowSuccess(true);
      }
    } catch (error: unknown) {
      console.error('Error de registro:', error);

      let errorMessage = 'Error al crear la cuenta. Inténtalo de nuevo.';

      const msg = error instanceof Error ? error.message : '';
      if (msg) {
        if (msg.includes('User already registered')) {
          errorMessage = 'Ya existe una cuenta con este número';
        } else if (msg.includes('Password should be at least')) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        } else if (msg.includes('Invalid email')) {
          errorMessage = 'No se pudo registrar con este número';
        } else if (msg.includes('Too many requests')) {
          errorMessage = 'Demasiados intentos. Inténtalo más tarde';
        }
      }

      setErrors({
        general: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    focusedField,
    setFocusedField,
    handleInputChange,
    handleSubmit,
    showSuccess
  };
};
