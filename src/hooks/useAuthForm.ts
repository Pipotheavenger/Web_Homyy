import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getUserType, redirectToUserDashboard } from '@/lib/auth-utils';

interface FormData {
  email: string;
  password: string;
}

interface Errors {
  email?: string;
  password?: string;
  general?: string;
}

export const useAuthForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof Errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Limpiar error general cuando el usuario empiece a escribir
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      // Manejar todos los errores específicos sin lanzar excepciones
      if (error) {
        let errorMessage = '';

        if (error.message.includes('Invalid login credentials')) {
          errorMessage = '❌ Correo electrónico o contraseña incorrectos. Verifica tus datos e intenta de nuevo.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = '⏰ Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.';
        } else if (error.message.includes('User not found')) {
          errorMessage = '❌ No existe una cuenta con este correo electrónico. ¿Deseas registrarte?';
        } else {
          errorMessage = '❌ Error al iniciar sesión. ' + error.message;
        }

        setErrors({ general: errorMessage });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Obtener el tipo de usuario desde la base de datos
        const userType = await getUserType(data.user.id);
        
        if (userType) {
          // Redirigir al dashboard correspondiente
          const dashboardPath = redirectToUserDashboard(userType);
          router.push(dashboardPath);
        } else {
          // Si no se puede determinar el tipo de usuario, mostrar error
          setErrors({
            general: 'No se pudo verificar tu tipo de usuario. Contacta al soporte.'
          });
        }
      }
    } catch (error: any) {
      // Capturar cualquier otro error inesperado
      setErrors({
        general: '❌ Error inesperado. Por favor, intenta de nuevo.'
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
    handleSubmit
  };
}; 