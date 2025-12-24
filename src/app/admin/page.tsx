'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowLeft } from 'lucide-react';

// Email del admin donde se enviará el OTP
// Este debe ser el mismo que en el backend (src/app/api/admin/otp/send/route.ts)
const ADMIN_EMAIL = 'admin@hommy.app';

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  useEffect(() => {
    // Verificar si ya está autenticado (tanto sessionStorage como cookies)
    const isAdminAuthenticated = sessionStorage.getItem('admin_authenticated');
    const isAdminAuthenticatedCookie = document.cookie.includes('admin_authenticated=true');
    
    if (isAdminAuthenticated === 'true' && isAdminAuthenticatedCookie) {
      console.log('🔐 Admin already authenticated, redirecting to dashboard');
      router.push('/admin/dashboard');
      return;
    }

    // Verificar si hay un OTP en la URL (cuando el usuario llega desde el email)
    const urlParams = new URLSearchParams(window.location.search);
    const otpFromUrl = urlParams.get('otp');
    if (otpFromUrl) {
      console.log('📧 OTP detectado en URL:', otpFromUrl);
      setCode(otpFromUrl);
      setStep('verify');
      // Limpiar la URL
      window.history.replaceState({}, '', '/admin');
    }
  }, [router]);

  const handleRequestCode = async () => {
    setError('');
    setSuccess('');
    setSendingCode(true);

    try {
      const response = await fetch('/api/admin/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el código');
      }

      if (data.otp) {
        // Si hay código en la respuesta (desarrollo o si el email falló)
        setSuccess(`Código generado: ${data.otp} ${data.emailError ? '(Email falló - revisa logs)' : '(Revisa tu correo)'}`);
        console.log('📧 Código OTP:', data.otp);
        if (data.emailError) {
          console.error('❌ Error de email:', data.emailError);
          console.error('🔧 Debug info:', data.debug);
        }
      } else {
        setSuccess('Código enviado exitosamente al correo electrónico');
      }
      setStep('verify');
    } catch (error: any) {
      console.error('Error solicitando código:', error);
      setError(error.message || 'Error al enviar el código. Inténtalo de nuevo.');
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otpCode: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Código incorrecto');
      }

      // Establecer la autenticación de admin
      sessionStorage.setItem('admin_authenticated', 'true');
      document.cookie = 'admin_authenticated=true; path=/; max-age=3600; SameSite=Strict'; // 1 hora
      
      console.log('🔐 Admin authentication successful');
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error('Error verificando código:', error);
      setError(error.message || 'Código incorrecto. Inténtalo de nuevo.');
      setCode('');
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full -bottom-48 -right-48 animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl mb-4">
            <Lock size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Panel de Administración</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          {step === 'request' ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
                  <Mail size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Solicitar Código de Acceso</h2>
                <p className="text-gray-400 text-sm">
                  Se enviará un código de verificación de 6 dígitos a:
                </p>
                <p className="text-purple-300 font-semibold mt-2">{ADMIN_EMAIL}</p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                  <p className="text-red-200 text-sm text-center font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
                  <p className="text-green-200 text-sm text-center font-medium">{success}</p>
                </div>
              )}

              <button
                onClick={handleRequestCode}
                disabled={sendingCode}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:to-pink-500"
              >
                {sendingCode ? 'Enviando código...' : 'Enviar Código de Acceso'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('request');
                    setCode('');
                    setError('');
                    setSuccess('');
                  }}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                >
                  <ArrowLeft size={16} />
                  <span className="text-sm">Volver</span>
                </button>
                <label className="block text-sm font-medium text-white mb-2">
                  Código de Verificación
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all text-center text-2xl font-bold tracking-[0.5em]"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Ingresa el código de 6 dígitos enviado a {ADMIN_EMAIL}<br/>
                  <span className="text-yellow-400 font-semibold">El código expira en 10 minutos</span>
                </p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                  <p className="text-red-200 text-sm text-center font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={code.length !== 6 || loading}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-500 disabled:hover:to-pink-500"
              >
                {loading ? 'Verificando...' : 'Verificar y Acceder'}
              </button>

              <button
                type="button"
                onClick={handleRequestCode}
                disabled={sendingCode}
                className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                {sendingCode ? 'Reenviando...' : 'Reenviar código'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs">
              <Lock size={12} />
              <span>Acceso restringido solo para administradores</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            © 2024 Hommy. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

