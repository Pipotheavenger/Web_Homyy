'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoginHeader } from '@/components/ui/LoginHeader';
import BgWave from '@/app/login/BgWave';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.warn('No hay sesión activa para reset password');
          setError('Enlace inválido o expirado. Solicita un nuevo enlace de recuperación.');
          setHasValidSession(false);
        } else {
          console.log('Sesión válida para reset password');
          setHasValidSession(true);
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setError('Error al verificar la sesión. Intenta de nuevo.');
        setHasValidSession(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Pequeño delay para asegurar que la sesión se establezca
    const timer = setTimeout(() => {
      checkSession();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setIsSuccess(true);
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la contraseña';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Pantalla de carga mientras verifica la sesión
  if (isChecking) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center px-4 bg-lavender overflow-hidden">
        <BgWave />
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8 text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      </main>
    );
  }

  // Pantalla de error si no hay sesión válida
  if (!hasValidSession) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center px-4 bg-lavender overflow-hidden">
        <BgWave />
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Enlace Inválido
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'Este enlace ha expirado o ya fue utilizado.'}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-80 transition-all duration-300"
          >
            Volver al Login
          </button>
        </div>
      </main>
    );
  }

  // Pantalla de éxito
  if (isSuccess) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center px-4 bg-lavender overflow-hidden">
        <BgWave />
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Contraseña Actualizada!
          </h2>
          <p className="text-gray-600 mb-4">
            Tu contraseña ha sido cambiada exitosamente
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Redirigiendo al login...</span>
          </div>
        </div>
      </main>
    );
  }

  // Formulario de cambio de contraseña
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 bg-lavender overflow-hidden">
      <BgWave />
      <LoginHeader />

      <section className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8 space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Nueva Contraseña
          </h1>
          <p className="text-gray-600 text-sm">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma tu contraseña"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Actualizando...</span>
              </>
            ) : (
              <span>Actualizar Contraseña</span>
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
