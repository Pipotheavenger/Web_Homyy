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
  const { calculateInflatedPrice, calculateCommissionAmount, formatPrice, commissionPercentage } = useCommission();

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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 p-4 text-white relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Confirmar Selección</h2>
                    <p className="text-white/80 text-xs">Elegir trabajador</p>
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
          <div className="p-4 overflow-y-auto flex-1">
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
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 mb-4 border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-1 text-sm">Servicio</h3>
                  <p className="text-xs text-purple-700">{serviceTitle}</p>
                </div>

                {/* Información del trabajador */}
                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-xl overflow-hidden flex items-center justify-center shadow-lg flex-shrink-0">
                    {postulante.foto ? (
                      <img
                        src={postulante.foto}
                        alt={`${postulante.nombre} ${postulante.apellido}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {postulante.nombre[0]}{postulante.apellido[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm truncate">
                      {postulante.nombre} {postulante.apellido}
                    </h4>
                    <p className="text-xs text-purple-600 truncate">{postulante.especialidad}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="flex items-center space-x-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full ${
                              i < Math.floor(postulante.calificacion)
                                ? 'bg-yellow-400'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {postulante.calificacion} ({postulante.serviciosCompletados})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desglose de precios */}
                <div className="bg-white border-2 border-purple-200 rounded-xl p-3 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2 text-sm">
                    <DollarSign size={14} className="text-purple-600" />
                    <span>Desglose de Precios</span>
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precio del trabajador:</span>
                      <span className="font-medium">{formatPrice(originalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Comisión plataforma:</span>
                      <span className="font-medium text-purple-600">+{formatPrice(commissionAmount)}</span>
                    </div>
                    <hr className="border-purple-200" />
                    <div className="flex justify-between font-bold text-sm">
                      <span className="text-gray-800">Total a pagar:</span>
                      <span className="text-purple-600">{formatPrice(inflatedPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Advertencia de escrow */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 mb-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield size={12} className="text-white" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-blue-900 mb-0.5 text-xs">Protección de Escrow</h5>
                      <p className="text-[10px] text-blue-700 leading-tight">
                        Los fondos serán transferidos a una cuenta segura. Solo se liberarán al trabajador 
                        cuando complete el trabajo correctamente.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advertencia final */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle size={12} className="text-white" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-orange-900 mb-0.5 text-xs">¿Estás seguro?</h5>
                      <p className="text-[10px] text-orange-700 leading-tight">
                        Se transferirán fondos como pago adelantado. No te preocupes: si algo sale mal, 
                        este saldo será reversado automáticamente.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={onClose}
                    disabled={isConfirming}
                    className="flex-1 px-3 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="flex-1 px-3 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-1.5 text-sm"
                  >
                    {isConfirming ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} />
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
