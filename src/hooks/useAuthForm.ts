import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface FormData {
  email: string;
  password: string;
  remember: boolean;
}

interface FormErrors {
  email: string;
  password: string;
  general: string;
}

export const useAuthForm = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    remember: false
  });
  
  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: '',
    general: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors on change
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { email: '', password: '', general: '' };
    
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
    
    setErrors(newErrors);
    
    if (!newErrors.email && !newErrors.password) {
      setIsLoading(true);
      
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrors(prev => ({ ...prev, general: 'Correo o contraseña incorrectos' }));
          } else if (error.message.includes('Email not confirmed')) {
            setErrors(prev => ({ ...prev, general: 'Por favor verifica tu correo electrónico' }));
          } else {
            setErrors(prev => ({ ...prev, general: 'Error al iniciar sesión. Intenta de nuevo.' }));
          }
        } else {
          window.location.href = '/dashboard';
        }
      } catch (err: any) {
        setErrors(prev => ({ ...prev, general: 'Error de conexión. Verifica tu internet.' }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
    } catch (err: any) {
      setErrors(prev => ({ ...prev, general: 'Error al conectar con Google. Intenta de nuevo.' }));
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
    handleGoogleLogin
  };
}; 