'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock } from 'lucide-react';
import Image from 'next/image';
import { ASSETS_CONFIG } from '@/lib/assets-config';

interface QRModalContentProps {
  metodoPago: string;
  monto: number;
  onConfirmPayment: () => void;
  onClose: () => void;
}

// Componente de monto - Carga inmediata
export const AmountSection = ({ monto }: { monto: number }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-blue-100/80 rounded-xl p-3 border border-purple-200/30"
    >
      <div className="text-center">
        <span className="text-xl font-bold text-purple-600 block">
          {formatPrice(monto)}
        </span>
        <p className="text-[10px] text-gray-600 font-medium mt-0.5">
          Monto a pagar
        </p>
      </div>
    </motion.div>
  );
};

// Componente de QR - Carga después
export const QRCodeSection = ({ metodoPago }: { metodoPago: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-gradient-to-r from-gray-50/80 to-purple-50/80 border border-gray-200/30 rounded-xl p-4"
  >
    <div className="text-center">
      <div className="w-40 h-40 bg-white rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center p-1">
          <Image
            src={ASSETS_CONFIG.nequi}
            alt="Código QR para pago"
            width={140}
            height={140}
            className="w-36 h-36 object-contain rounded-lg"
            priority
          />
        </div>
      </div>
      
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-gray-800">
          Escanea el código QR con tu aplicación {metodoPago}
        </p>
        <p className="text-[10px] text-gray-600">
          El pago se procesará automáticamente
        </p>
        <PaymentInfo metodoPago={metodoPago} />
      </div>
    </div>
  </motion.div>
);

// Componente de información de pago - Carga después
const PaymentInfo = ({ metodoPago }: { metodoPago: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
    className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 border border-purple-200/30 rounded-lg p-2 mt-2"
  >
    <p className="text-[10px] text-purple-700 font-medium mb-1">
      Información del pago: Hommy - 0091102879
    </p>
    {metodoPago.toLowerCase() === 'nequi' && (
      <>
        <p className="text-[10px] text-purple-600">
          Llave BreB: <strong>0091102879</strong>
        </p>
        <p className="text-[10px] text-purple-600">
          Nombre: <strong>Paola Medina</strong>
        </p>
      </>
    )}
    {metodoPago.toLowerCase() === 'daviplata' && (
      <>
        <p className="text-[10px] text-purple-600">
          Llave BreB: <strong>0091102879</strong>
        </p>
        <p className="text-[10px] text-purple-600">
          Nombre: <strong>Paola Medina</strong>
        </p>
      </>
    )}
    {metodoPago.toLowerCase() === 'pse' && (
      <>
        <p className="text-[10px] text-purple-600">
          Referencia: <strong>REF-{Date.now().toString().slice(-6)}</strong>
        </p>
        <p className="text-[10px] text-purple-600">
          Banco: <strong>Bancolombia</strong>
        </p>
      </>
    )}
  </motion.div>
);

// Componente de tiempo de procesamiento - Carga después
export const ProcessingTimeSection = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/30 rounded-xl p-3"
  >
    <div className="flex items-start space-x-2">
      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Clock size={12} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold text-blue-800 mb-0.5">
          Tiempo de procesamiento
        </p>
        <p className="text-[10px] text-blue-700 leading-tight">
          La recarga se verá reflejada en tu saldo de la aplicación entre <strong>5 y 10 minutos</strong> después de completar el pago.
        </p>
      </div>
    </div>
  </motion.div>
);

// Contenido principal del modal
export const QRModalContent = ({
  metodoPago,
  monto,
  onConfirmPayment,
  onClose
}: QRModalContentProps) => {
  const handleConfirmPayment = () => {
    onConfirmPayment();
    onClose();
  };

  return (
    <div className="p-4 space-y-3">
      {/* Monto destacado - Carga inmediata */}
      <AmountSection monto={monto} />

      {/* QR Code - Carga progresiva */}
      <QRCodeSection metodoPago={metodoPago} />

      {/* Información de tiempo de procesamiento - Carga progresiva */}
      <ProcessingTimeSection />

      {/* Información adicional - Carga progresiva */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-green-50/80 to-blue-50/80 border border-green-200/30 rounded-xl p-2"
      >
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
            <span className="text-[10px] text-white">⏱️</span>
          </div>
          <p className="text-[10px] text-green-800 font-medium">
            Tienes 5 minutos para completar el pago
          </p>
        </div>
      </motion.div>

      {/* Acciones */}
      <div className="flex space-x-2 mt-4">
        <button
          onClick={onClose}
          className="flex-1 px-3 py-2.5 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 border-2 border-gray-200 flex items-center justify-center space-x-1.5 text-xs"
        >
          <span>Cancelar</span>
        </button>
        <button
          onClick={handleConfirmPayment}
          className="flex-1 px-3 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-1.5 text-xs"
        >
          <CheckCircle size={12} />
          <span>Listo, ya hice el pago</span>
        </button>
      </div>
    </div>
  );
};

