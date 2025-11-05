'use client';
import { useState } from 'react';
import { X, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface RecoverPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecoverPasswordModal = ({ isOpen, onClose }: RecoverPasswordModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${globalThis.location?.origin || 'http://localhost:3000'}/auth/callback?type=recovery`
      });

      if (resetError) throw resetError;

      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setEmail('');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setError('');
      setIsSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
      <div className="bg-white rounded-t-3xl md:rounded-2xl md:max-w-md w-full md:w-auto p-6 relative animate-scale-in m-0 md:m-4">
        {/* Botón cerrar */}
        {!isLoading && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        )}

        {isSuccess ? (
          // Pantalla de éxito
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              ¡Correo Enviado!
            </h3>
            <p className="text-gray-600">
              Revisa tu bandeja de entrada para restablecer tu contraseña
            </p>
          </div>
        ) : (
          // Formulario
          <>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Mail size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Recuperar Contraseña</h2>
                <p className="text-sm text-gray-600">Te enviaremos un enlace de recuperación</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 outline-none"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Enviar Enlace</span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs text-blue-700">
                <strong>Nota:</strong> Recibirás un correo con instrucciones para restablecer tu contraseña. Revisa también tu carpeta de spam.
              </p>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

