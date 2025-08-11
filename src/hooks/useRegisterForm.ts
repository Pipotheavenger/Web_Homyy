import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormErrors {
  email: string;
  password: string;
  confirmPassword: string;
  general: string;
}

export const useRegisterForm = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<RegisterFormErrors>({
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof RegisterFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { email: '', password: '', confirmPassword: '', general: '' };
    
    if (!formData.email) {
      newErrors.email = 'El correo es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Formato de correo inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Mínimo 6 caracteres';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    
    if (!newErrors.email && !newErrors.password && !newErrors.confirmPassword) {
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: 'https://www.mcdonalds.com.co/'
          }
        });
        
        if (error) {
          if (error.message.includes('User already registered')) {
            setErrors(prev => ({ ...prev, email: 'Este correo ya está registrado' }));
          } else if (error.message.includes('Invalid email')) {
            setErrors(prev => ({ ...prev, email: 'Correo electrónico inválido' }));
          } else {
            setErrors(prev => ({ ...prev, general: 'Error al crear la cuenta. Intenta de nuevo.' }));
          }
        } else {
          setShowSuccess(true);
          setFormData({ email: '', password: '', confirmPassword: '' });
        }
      } catch (err: any) {
        setErrors(prev => ({ ...prev, general: 'Error de conexión. Verifica tu internet.' }));
      } finally {
        setIsLoading(false);
      }
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