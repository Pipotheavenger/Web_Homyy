'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Smartphone, Lock, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import PhoneInput from './PhoneInput';
import OtpInput from './OtpInput';

type VerificationStep = 'phone-input' | 'otp-verify' | 'success';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  initialPhone?: string;
  userId?: string;
}

export default function PhoneVerificationModal({
  isOpen,
  onClose,
  onVerified,
  initialPhone = '',
  userId
}: PhoneVerificationModalProps) {
  const [step, setStep] = useState<VerificationStep>('phone-input');
  const [phoneValue, setPhoneValue] = useState(initialPhone);
  const [otpValue, setOtpValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);
  const isVerifyingRef = useRef(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('phone-input');
      setPhoneValue(initialPhone);
      setOtpValue('');
      setError(null);
      setCooldown(0);
      setRateLimitCooldown(0);
      setIsSending(false);
      setIsVerifying(false);
    }
  }, [isOpen, initialPhone]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Rate limit timer
  useEffect(() => {
    if (rateLimitCooldown <= 0) return;
    const timer = setInterval(() => {
      setRateLimitCooldown((prev) => {
        if (prev <= 1) {
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitCooldown]);

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (otpValue.length === 6 && !isVerifyingRef.current) {
      verifyCode(otpValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpValue]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const getRawPhone = () => phoneValue.replace(/\s/g, '');

  const getDisplayPhone = () => {
    const raw = getRawPhone();
    return raw.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  const sendCode = async () => {
    const rawPhone = getRawPhone();
    if (rawPhone.length !== 10) {
      setError('El número debe tener exactamente 10 dígitos');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/phone-verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: rawPhone }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.retryAfterSeconds) {
          setRateLimitCooldown(data.retryAfterSeconds);
          setError(null);
        } else {
          setError(data.error || 'Error al enviar el código');
        }
        return;
      }

      setCooldown(60);
      setStep('otp-verify');
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async (code: string) => {
    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;
    setIsVerifying(true);
    setError(null);

    try {
      const rawPhone = getRawPhone();
      const response = await fetch('/api/auth/phone-verify/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: rawPhone, otpCode: code, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Código incorrecto');
        setOtpValue('');
        return;
      }

      setStep('success');
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsVerifying(false);
      isVerifyingRef.current = false;
    }
  };

  const handleResend = () => {
    setOtpValue('');
    setError(null);
    sendCode();
  };

  const handleChangeNumber = () => {
    setStep('phone-input');
    setOtpValue('');
    setError(null);
    setCooldown(0);
  };

  const handleContinue = () => {
    onVerified();
    onClose();
  };

  const handleClose = () => {
    if (!isSending && !isVerifying) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
      <div className="bg-white rounded-t-3xl md:rounded-2xl md:max-w-md w-full md:w-auto p-6 relative animate-scale-in m-0 md:m-4 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        {step !== 'otp-verify' && !isSending && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
          >
            <X size={20} className="text-gray-500" />
          </button>
        )}

        {/* Step 1: Phone Input */}
        {step === 'phone-input' && (
          <div className="space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Smartphone size={32} className="text-purple-600" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                Verifica tu número de celular
              </h2>
              <p className="text-sm text-gray-600">
                Te enviaremos un código de verificación por SMS a este número para asegurar tu cuenta.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {/* Rate limit */}
            {rateLimitCooldown > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center space-y-2">
                <p className="text-amber-700 text-sm font-medium">
                  Límite de envíos alcanzado
                </p>
                <p className="text-2xl font-bold text-amber-700">
                  {formatTime(rateLimitCooldown)}
                </p>
              </div>
            )}

            {/* Phone Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                Número de teléfono
              </label>
              <PhoneInput
                value={phoneValue}
                onChange={setPhoneValue}
                error={undefined}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={sendCode}
              disabled={isSending || getRawPhone().length !== 10 || rateLimitCooldown > 0}
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <span>Enviar código</span>
              )}
            </button>

            {/* Info */}
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Lock size={12} />
                ¿Por qué necesitamos tu número?
              </p>
              <p className="text-xs text-gray-400">
                Usamos tu número para notificaciones importantes via WhatsApp.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp-verify' && (
          <div className="space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Lock size={32} className="text-purple-600" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                Ingresa el código de verificación
              </h2>
              <p className="text-sm text-gray-600">
                Enviamos un código de 6 dígitos al <span className="font-semibold text-gray-900">+57 {getDisplayPhone()}</span>
              </p>
              <button
                onClick={handleChangeNumber}
                disabled={isVerifying}
                className="text-sm text-purple-600 font-medium hover:text-purple-700 hover:underline transition-all disabled:opacity-50"
              >
                ¿No es tu número? Cambiar
              </button>
            </div>

            {/* Error */}
            {error && rateLimitCooldown <= 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {/* Rate limit */}
            {rateLimitCooldown > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center space-y-2">
                <p className="text-amber-700 text-sm font-medium">
                  Límite de envíos alcanzado
                </p>
                <p className="text-2xl font-bold text-amber-700">
                  {formatTime(rateLimitCooldown)}
                </p>
              </div>
            )}

            {/* OTP Input */}
            <OtpInput
              value={otpValue}
              onChange={setOtpValue}
              disabled={isVerifying || rateLimitCooldown > 0}
              error={!!error}
            />

            {/* Verify Button */}
            <button
              onClick={() => otpValue.length === 6 && verifyCode(otpValue)}
              disabled={isVerifying || otpValue.length !== 6}
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>Verificar</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Resend */}
            <div className="text-center space-y-1">
              <p className="text-sm text-gray-500">¿No recibiste el código?</p>
              {rateLimitCooldown > 0 ? (
                <p className="text-sm text-gray-400">
                  Reenvío bloqueado temporalmente
                </p>
              ) : cooldown > 0 ? (
                <p className="text-sm text-purple-600 font-medium">
                  Reenviar en {formatTime(cooldown)}
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isSending || isVerifying}
                  className="text-sm text-purple-600 font-semibold hover:text-purple-700 hover:underline transition-all disabled:opacity-50"
                >
                  Reenviar código
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="space-y-6 py-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle size={40} className="text-green-600" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">
                ¡Tu cuenta ha sido verificada!
              </h2>
              <p className="text-sm text-gray-600">
                Ahora recibirás notificaciones por WhatsApp y podrás acceder a todas las funciones.
              </p>
            </div>

            {/* Status Card */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Verificación Completa</p>
                  <p className="text-sm text-green-600 font-medium">Estado: Activo</p>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Continuar</span>
              <ArrowRight size={18} />
            </button>
          </div>
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
}
