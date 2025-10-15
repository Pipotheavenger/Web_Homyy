'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, DollarSign, Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useCommission } from '@/hooks/useCommission';

interface Postulante {
  id: string;
  workerId: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  experiencia: number;
  calificacion: number;
  serviciosCompletados: number;
  precio: number;
  foto?: string;
}

interface WorkerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>; // Cambiar para que retorne boolean indicando éxito
  postulante: Postulante | null;
  serviceTitle: string;
}

export const WorkerSelectionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  postulante, 
  serviceTitle 
}: WorkerSelectionModalProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { calculateInflatedPrice, calculateCommissionAmount, formatPrice } = useCommission();

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const success = await onConfirm();
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2000);
      } else {
        setIsConfirming(false);
        // El error se maneja en el componente padre
      }
    } catch (error) {
      setIsConfirming(false);
      // El error se maneja en el componente padre
    }
  };

  // Verificar que el postulante existe antes de acceder a sus propiedades
  if (!isOpen || !postulante) {
    console.log('🚫 Modal no abierto o postulante es null:', { isOpen, postulante });
    return null;
  }

  console.log('📝 Postulante recibido en modal:', postulante);

  const originalPrice = postulante.precio;
  const inflatedPrice = calculateInflatedPrice(originalPrice);
  const commissionAmount = calculateCommissionAmount(originalPrice);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Confirmar Selección</h2>
                    <p className="text-white/80 text-sm">Elegir trabajador para el servicio</p>
                  </div>
                </div>
                {!isSuccess && (
                  <button
                    onClick={onClose}
                    disabled={isConfirming}
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
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  ¡Trabajador Seleccionado!
                </h3>
                <p className="text-gray-600">
                  Los fondos han sido transferidos a escrow y se ha generado el PIN de finalización.
                </p>
              </motion.div>
            ) : (
              <>
                {/* Información del servicio */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">Servicio</h3>
                  <p className="text-sm text-purple-700">{serviceTitle}</p>
                </div>

                {/* Información del trabajador */}
                <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-xl overflow-hidden flex items-center justify-center shadow-lg">
                    {postulante.foto ? (
                      <img
                        src={postulante.foto}
                        alt={`${postulante.nombre} ${postulante.apellido}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {postulante.nombre[0]}{postulante.apellido[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      {postulante.nombre} {postulante.apellido}
                    </h4>
                    <p className="text-sm text-purple-600">{postulante.especialidad}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              i < Math.floor(postulante.calificacion)
                                ? 'bg-yellow-400'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {postulante.calificacion} ({postulante.serviciosCompletados} servicios)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desglose de precios */}
                <div className="bg-white border-2 border-purple-200 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                    <DollarSign size={16} className="text-purple-600" />
                    <span>Desglose de Precios</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precio del trabajador:</span>
                      <span className="font-medium">{formatPrice(originalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Comisión de la plataforma:</span>
                      <span className="font-medium text-purple-600">+{formatPrice(commissionAmount)}</span>
                    </div>
                    <hr className="border-purple-200" />
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-gray-800">Total a pagar:</span>
                      <span className="text-purple-600">{formatPrice(inflatedPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Advertencia de escrow */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield size={16} className="text-white" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-blue-900 mb-1">Protección de Escrow</h5>
                      <p className="text-sm text-blue-700">
                        Los fondos serán transferidos a una cuenta segura. Solo se liberarán al trabajador 
                        cuando complete el trabajo correctamente.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advertencia final */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle size={16} className="text-white" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-orange-900 mb-1">¿Estás seguro?</h5>
                      <p className="text-sm text-orange-700">
                        Se transferirán fondos como pago adelantado. No te preocupes: si algo sale mal, 
                        este saldo será reversado automáticamente.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    disabled={isConfirming}
                    className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isConfirming ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>Confirmar</span>
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
