'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, CheckCircle, AlertCircle, Loader2, Key } from 'lucide-react';

interface WorkCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<boolean>;
  serviceTitle: string;
}

export const WorkCompletionModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  serviceTitle 
}: WorkCompletionModalProps) => {
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limpiar el PIN cuando se abra/cierre el modal
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

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
          onClose();
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
    // Solo permitir números y máximo 4 dígitos
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setPin(numericValue);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length === 4) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-t-3xl md:rounded-2xl md:max-w-md w-full md:w-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden m-0 md:m-4"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Finalizar Trabajo</h2>
                    <p className="text-white/80 text-sm">Ingresa el PIN para completar</p>
                  </div>
                </div>
                {!isSuccess && (
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isSuccess ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
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
            ) : (
              <>
                {/* Información del servicio */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 mb-6 border border-emerald-200">
                  <h3 className="font-semibold text-emerald-900 mb-2">Servicio a completar</h3>
                  <p className="text-sm text-emerald-700">{serviceTitle}</p>
                </div>

                {/* Instrucciones */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
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
                </div>

                {/* Input de PIN */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Ingresa el PIN de 4 dígitos
                  </label>
                  
                  {/* Cajas del PIN interactivas */}
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
                          
                          // Auto-focus al siguiente campo
                          if (e.target.value && index < 3) {
                            const nextInput = document.querySelector(`input[data-pin-index="${index + 1}"]`) as HTMLInputElement;
                            nextInput?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          // Manejar tecla backspace
                          if (e.key === 'Backspace' && !pin[index] && index > 0) {
                            const prevInput = document.querySelector(`input[data-pin-index="${index - 1}"]`) as HTMLInputElement;
                            prevInput?.focus();
                          }
                          // Manejar tecla Enter
                          if (e.key === 'Enter' && pin.length === 4) {
                            handleSubmit();
                          }
                          // Manejar Escape
                          if (e.key === 'Escape') {
                            onClose();
                          }
                        }}
                        onKeyPress={(e) => {
                          // Solo permitir números
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
                  
                  {/* Input oculto para manejar el valor completo */}
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    className="sr-only"
                    maxLength={4}
                    autoComplete="off"
                  />
                </div>

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

                {/* Advertencia */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 mb-6">
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
                </div>

                {/* Botones */}
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
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
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
