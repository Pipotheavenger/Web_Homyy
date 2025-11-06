'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertCircle, Loader2, Key } from 'lucide-react';

interface WorkCompletionModalContentProps {
  onSubmit: (pin: string) => Promise<boolean>;
  serviceTitle: string;
  onSuccess: () => void;
}

// Componente de información del servicio - Carga inmediata
export const ServiceInfoSection = ({ serviceTitle }: { serviceTitle: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 mb-6 border border-emerald-200"
  >
    <h3 className="font-semibold text-emerald-900 mb-2">Servicio a completar</h3>
    <p className="text-sm text-emerald-700">{serviceTitle}</p>
  </motion.div>
);

// Componente de instrucciones - Carga después
export const InstructionsSection = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6"
  >
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
        <Key size={16} className="text-white" />
      </div>
      <div>
        <h5 className="font-semibold text-blue-900 mb-1">PIN de Finalización</h5>
        <p className="text-sm text-blue-700">
          El cliente te proporcionó un PIN de 4 dígitos. Ingrésalo para confirmar que has completado el trabajo.
        </p>
      </div>
    </div>
  </motion.div>
);

// Componente de advertencia - Carga después
export const WarningSection = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 mb-6"
  >
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
        <AlertCircle size={16} className="text-white" />
      </div>
      <div>
        <h5 className="font-semibold text-orange-900 mb-1">Importante</h5>
        <p className="text-sm text-orange-700">
          Una vez ingresado el PIN correcto, el trabajo se marcará como completado y los fondos se transferirán a tu cuenta.
        </p>
      </div>
    </div>
  </motion.div>
);

// Contenido principal del modal
export const WorkCompletionModalContent = ({
  onSubmit,
  serviceTitle,
  onSuccess
}: WorkCompletionModalContentProps) => {
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setError('El PIN debe tener 4 dígitos');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await onSubmit(pin);
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onSuccess();
          setPin('');
        }, 3000);
      } else {
        setError('PIN incorrecto. Verifica e intenta nuevamente.');
      }
    } catch (error) {
      setError('Error al completar el trabajo. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setPin(numericValue);
    setError(null);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-8 p-6"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          ¡Trabajo Completado!
        </h3>
        <p className="text-gray-600 mb-4">
          Has completado exitosamente el trabajo. Los fondos han sido transferidos a tu cuenta.
        </p>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium">
            ¡Gracias por tu trabajo! El cliente podrá dejarte una reseña.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-6">
      {/* Información del servicio - Carga inmediata */}
      <ServiceInfoSection serviceTitle={serviceTitle} />

      {/* Instrucciones - Carga progresiva */}
      <InstructionsSection />

      {/* Input de PIN */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
          Ingresa el PIN de 4 dígitos
        </label>
        
        <div className="flex justify-center space-x-3 mb-4">
          {[0, 1, 2, 3].map((index) => (
            <input
              key={index}
              type="text"
              value={pin[index] || ''}
              onChange={(e) => {
                const newPin = pin.split('');
                newPin[index] = e.target.value.slice(-1);
                const updatedPin = newPin.join('');
                handlePinChange(updatedPin);
                
                if (e.target.value && index < 3) {
                  const nextInput = document.querySelector(`input[data-pin-index="${index + 1}"]`) as HTMLInputElement;
                  nextInput?.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !pin[index] && index > 0) {
                  const prevInput = document.querySelector(`input[data-pin-index="${index - 1}"]`) as HTMLInputElement;
                  prevInput?.focus();
                }
                if (e.key === 'Enter' && pin.length === 4) {
                  handleSubmit();
                }
                if (e.key === 'Escape') {
                  onSuccess();
                }
              }}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              data-pin-index={index}
              className={`w-12 h-12 border-2 rounded-lg text-xl font-bold text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                pin.length > index
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-300 bg-white text-gray-400'
              } ${error ? 'border-red-500' : ''}`}
              maxLength={1}
              autoComplete="off"
              autoFocus={index === 0}
            />
          ))}
        </div>
        
        <input
          type="text"
          value={pin}
          onChange={(e) => handlePinChange(e.target.value)}
          className="sr-only"
          maxLength={4}
          autoComplete="off"
        />
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
        >
          <AlertCircle size={16} className="text-red-500" />
          <span className="text-red-700 text-sm">{error}</span>
        </motion.div>
      )}

      {/* Advertencia - Carga progresiva */}
      <WarningSection />

      {/* Botones */}
      <div className="flex space-x-3">
        <button
          onClick={onSuccess}
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={pin.length !== 4 || isSubmitting}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Verificando...</span>
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              <span>Completar Trabajo</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

