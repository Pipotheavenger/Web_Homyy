import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getUserType, redirectToUserDashboard } from '@/lib/auth-utils';
import { isValidMxPhone10Digits, phoneToAuthEmail, normalizePhoneToDigits } from '@/lib/utils/phone-auth';

interface FormData {
  phone: string;
  password: string;
}

interface Errors {
  phone?: string;
  password?: string;
  general?: string;
}

export const useAuthForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    phone: '',
    password: ''
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    // Validar teléfono
    if (!formData.phone) {
      newErrors.phone = 'El número de teléfono es requerido';
    } else if (!isValidMxPhone10Digits(formData.phone)) {
      newErrors.phone = 'El número debe tener exactamente 10 dígitos';
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
      // Clean up old localStorage tokens from previous deployments.
      // Safe because the app now uses sessionStorage for auth persistence.
      if (typeof window !== 'undefined') {
        Object.keys(localStorage)
          .filter(k => k.startsWith('sb-'))
          .forEach(k => localStorage.removeItem(k));
      }

      // Race signIn against a 10s timeout to prevent hanging
      const phoneDigits = normalizePhoneToDigits(formData.phone);
      const email = phoneToAuthEmail(phoneDigits);
      const { data, error } = await Promise.race([
        supabase.auth.signInWithPassword({
          email,
          password: formData.password,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 10_000)
        ),
      ]);

      // Manejar todos los errores específicos sin lanzar excepciones
      if (error) {
        let errorMessage = '';

        if (error.message.includes('Email not confirmed')) {
          errorMessage =
            '⚠️ Tu cuenta aún no está activa. Si acabas de registrarte, espera un momento e intenta de nuevo o contacta soporte.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = '❌ Teléfono o contraseña incorrectos. Verifica tus datos e intenta de nuevo.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = '⏰ Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.';
        } else if (error.message.includes('User not found')) {
          errorMessage = '❌ No existe una cuenta con este número. ¿Deseas registrarte?';
        } else {
          errorMessage = '❌ Error al iniciar sesión. ' + error.message;
        }

        setErrors({ general: errorMessage });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Cuentas phone_*@hommy.local se confirman en registro (Admin API); otras cuentas email pueden requerir confirmación en panel.
        const technicalPhoneEmail =
          typeof data.user.email === 'string' &&
          /^phone_\d{10}@hommy\.local$/i.test(data.user.email);
        if (!data.user.email_confirmed_at && !technicalPhoneEmail) {
          setErrors({
            general:
              '⚠️ Revisa tu correo para confirmar la cuenta antes de entrar.',
          });
          setIsLoading(false);
          await supabase.auth.signOut({ scope: 'local' });
          return;
        }

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
      if (error?.message === 'TIMEOUT') {
        // Clear corrupted session state on timeout
        Object.keys(localStorage)
          .filter(k => k.startsWith('sb-'))
          .forEach(k => localStorage.removeItem(k));
        setErrors({
          general: '⏰ La conexión tardó demasiado. Recarga la página e intenta de nuevo.'
        });
      } else {
        setErrors({
          general: '❌ Error inesperado. Por favor, intenta de nuevo.'
        });
      }
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