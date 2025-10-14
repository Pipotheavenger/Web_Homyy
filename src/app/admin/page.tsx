'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, LogOut } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar si ya está autenticado (tanto sessionStorage como cookies)
    const isAdminAuthenticated = sessionStorage.getItem('admin_authenticated');
    const isAdminAuthenticatedCookie = document.cookie.includes('admin_authenticated=true');
    
    if (isAdminAuthenticated === 'true' && isAdminAuthenticatedCookie) {
      console.log('🔐 Admin already authenticated, redirecting to dashboard');
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Código de acceso admin (en producción esto debe estar en variables de entorno)
      const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || '123456';
      
      console.log('🔍 Código ingresado:', code);
      console.log('🔍 Código esperado:', ADMIN_CODE);
      console.log('🔍 Son iguales:', code === ADMIN_CODE);

      if (code !== ADMIN_CODE) {
        console.log('❌ Código incorrecto');
        setError('Código incorrecto. Acceso denegado.');
        setCode('');
        setLoading(false);
        return;
      }
      
      console.log('✅ Código correcto, procediendo...');

      // Solo validar el código, sin verificar autenticación de usuario
      // Establecer la autenticación de admin
      sessionStorage.setItem('admin_authenticated', 'true');
      
      // También establecer una cookie para el middleware
      document.cookie = 'admin_authenticated=true; path=/; max-age=3600; SameSite=Strict'; // 1 hora
      
      console.log('🔐 Admin authentication successful');
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Error en autenticación de admin:', error);
      setError('Error de autenticación. Inténtalo de nuevo.');
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Código de Acceso
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
                Ingresa el código de 6 dígitos<br/>
                <span className="text-yellow-400 font-semibold">Acceso restringido solo para administradores</span>
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
              {loading ? 'Verificando...' : 'Acceder al Dashboard'}
            </button>
          </form>

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

