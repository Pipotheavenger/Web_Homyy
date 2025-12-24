'use client';
import { useState } from 'react';
import { X, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  userType: 'user' | 'worker';
  onVerified: () => void;
}

export const PhoneVerificationModal = ({
  isOpen,
  onClose,
  phoneNumber,
  userType,
  onVerified
}: PhoneVerificationModalProps) => {
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // Función para normalizar el número de teléfono
  const normalizePhoneNumber = (phone: string): string => {
    if (!phone) return '';
    
    // Eliminar todos los caracteres que no sean números o +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Si no empieza con +, agregar +57 (código de Colombia por defecto)
    if (!cleaned.startsWith('+')) {
      // Si tiene 10 dígitos, agregar +57 al inicio
      if (cleaned.length === 10) {
        cleaned = '+57' + cleaned;
      } else {
        // Si tiene más o menos dígitos, asumir que es un número colombiano
        cleaned = '+57' + cleaned.replace(/^57/, ''); // Remover 57 si ya está al inicio
      }
    }
    
    return cleaned;
  };

  const handleSendPin = async () => {
    if (!phoneNumber) {
      setError('No hay un número de teléfono registrado');
      return;
    }

    // Normalizar el número de teléfono
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Validar que el número normalizado tenga un formato válido
    if (!normalizedPhone.startsWith('+') || normalizedPhone.length < 10) {
      setError('El número de teléfono no es válido. Por favor verifica que esté correcto.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verificar que el usuario esté autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener el token de sesión para autenticación
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Sesión no disponible');
      }

      // Enviar OTP usando la API de Infobip
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        credentials: 'include', // Incluir cookies para autenticación
        body: JSON.stringify({
          phoneNumber: normalizedPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el código de verificación');
      }

      setStep('verify');
      setSuccess(false);
    } catch (err: any) {
      console.error('Error enviando PIN:', err);
      setError('Códigos temporalmente fuera de servicio, contacta a soporte.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async () => {
    if (!pin || pin.length !== 6) {
      setError('Por favor ingresa el código de 6 dígitos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Obtener el token de sesión para autenticación
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Sesión no disponible');
      }

      // Normalizar el número de teléfono para verificación
      const normalizedPhone = normalizePhoneNumber(phoneNumber);

      // Verificar el OTP usando la API
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        credentials: 'include', // Incluir cookies para autenticación
        body: JSON.stringify({
          phoneNumber: normalizedPhone,
          otpCode: pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Código inválido');
      }

      setSuccess(true);
      setTimeout(() => {
        onVerified();
        onClose();
        setStep('send');
        setPin('');
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      console.error('Error verificando PIN:', err);
      setError(err.message || 'Código inválido. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('send');
    setPin('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 'send' ? 'Verificar Móvil' : 'Ingresa el Código'}
            </h2>
            <p className="text-gray-600">
              {step === 'send' 
                ? `Se enviará un código de verificación al número ${normalizePhoneNumber(phoneNumber)}`
                : `Ingresa el código de 6 dígitos enviado a ${normalizePhoneNumber(phoneNumber)}`
              }
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-red-700 text-sm font-medium mb-1">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <p className="text-green-700 text-sm">¡Móvil verificado exitosamente!</p>
            </div>
          )}

          {step === 'send' ? (
            <div className="space-y-4">
              <button
                onClick={handleSendPin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Phone size={20} />
                    <span>Enviar Código</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Verificación
                </label>
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPin(value);
                    setError(null);
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep('send');
                    setPin('');
                    setError(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={handleVerifyPin}
                  disabled={loading || pin.length !== 6}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      <span>Verificar</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleSendPin}
                disabled={loading}
                className="w-full text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
              >
                Reenviar código
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

