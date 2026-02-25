'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import OtpInput from './OtpInput';

interface PhoneVerifyFormProps {
  phoneNumber: string;
  onVerified: () => void;
  onBack: () => void;
}

export default function PhoneVerifyForm({ phoneNumber, onVerified, onBack }: PhoneVerifyFormProps) {
  const [otpValue, setOtpValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [smsSent, setSmsSent] = useState(false);

  // Formatear teléfono para mostrar
  const displayPhone = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');

  // Enviar código SMS
  const sendCode = useCallback(async () => {
    setIsSending(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/auth/phone-verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al enviar el código');
        return;
      }

      setSmsSent(true);
      setSuccessMessage('Código enviado exitosamente');
      // Cooldown de 60 segundos para reenviar
      setCooldown(60);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsSending(false);
    }
  }, [phoneNumber]);

  // Enviar código al montar el componente (ref evita doble envío por Strict Mode)
  const hasSentRef = useRef(false);
  useEffect(() => {
    if (hasSentRef.current) return;
    hasSentRef.current = true;
    sendCode();
  }, [sendCode]);

  // Temporizador del cooldown
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // Verificar código automáticamente al completar 6 dígitos
  useEffect(() => {
    if (otpValue.length === 6) {
      verifyCode(otpValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpValue]);

  const verifyCode = async (code: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/phone-verify/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otpCode: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Código incorrecto');
        setOtpValue('');
        setIsVerifying(false);
        return;
      }

      setSuccessMessage('Teléfono verificado correctamente');
      // Pequeño delay para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        onVerified();
      }, 800);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    setOtpValue('');
    sendCode();
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-black">
          Verifica tu teléfono
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Enviamos un código de 6 dígitos al número
        </p>
        <p className="text-purple-600 font-semibold text-lg">
          +57 {displayPhone}
        </p>
      </div>

      {/* Card */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-8 space-y-6">
        {/* Mensajes de estado */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm text-center">
            {error}
          </div>
        )}
        {successMessage && !error && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-600 text-sm text-center">
            {successMessage}
          </div>
        )}

        {/* Indicador de envío */}
        {isSending && !smsSent && (
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
            <span className="text-gray-600 text-sm">Enviando código...</span>
          </div>
        )}

        {/* OTP Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 text-center">
            Ingresa el código
          </label>
          <OtpInput
            value={otpValue}
            onChange={setOtpValue}
            disabled={isVerifying || isSending}
            error={!!error}
          />
        </div>

        {/* Verificando indicador */}
        {isVerifying && (
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
            <span className="text-gray-600 text-sm">Verificando...</span>
          </div>
        )}

        {/* Botón reenviar */}
        <div className="text-center">
          {cooldown > 0 ? (
            <p className="text-sm text-gray-500">
              Reenviar código en <span className="font-semibold text-purple-600">{cooldown}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isSending || isVerifying}
              className="text-sm text-purple-600 font-semibold hover:text-purple-700 hover:underline transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reenviar código
            </button>
          )}
        </div>

        {/* Botón atrás */}
        <button
          type="button"
          onClick={onBack}
          disabled={isVerifying}
          className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
        >
          Atrás
        </button>
      </div>

      {/* Indicador de paso */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          <div className="w-8 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
