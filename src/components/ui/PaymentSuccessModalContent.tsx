'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface PaymentSuccessModalContentProps {
  amount: number;
  paymentMethod: string;
  transactionRef: string;
  onClose?: () => void;
}

// Componente de checkmark animado - Carga inmediata
export const SuccessCheckmark = () => (
  <motion.div
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ duration: 0.7, type: 'spring' }}
    className="flex justify-center mb-4"
  >
    <div className="relative">
      <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
      <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
        <Clock size={48} className="text-blue-500" strokeWidth={2.5} />
      </div>
    </div>
  </motion.div>
);

// Componente de mensaje de éxito - Carga después
export const SuccessMessage = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="text-center"
  >
    <h2 className="text-2xl font-bold mb-2">¡Transacción Procesada!</h2>
    <p className="text-white/90 text-sm">Tu solicitud está siendo verificada</p>
  </motion.div>
);

// Componente de detalles de transacción - Carga después
export const TransactionDetails = ({ amount, paymentMethod, transactionRef, onClose }: PaymentSuccessModalContentProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getPaymentMethodName = (method: string) => {
    const methods: { [key: string]: string } = {
      nequi: 'Nequi',
      daviplata: 'DaviPlata',
      pse: 'PSE',
      bancolombia: 'Bancolombia',
      bancodebogota: 'Banco de Bogotá'
    };
    return methods[method] || method;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="p-8"
    >
      {/* Amount */}
      <div className="text-center mb-6 pb-6 border-b border-gray-100">
        <p className="text-sm text-gray-500 mb-1">Monto</p>
        <p className="text-4xl font-bold text-gray-800">{formatPrice(amount)}</p>
      </div>

      {/* Transaction info */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Método de pago</span>
          <span className="text-sm font-semibold text-gray-800">{getPaymentMethodName(paymentMethod)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Referencia</span>
          <span className="text-sm font-mono font-semibold text-gray-800">{transactionRef}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Estado</span>
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-semibold">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span>Pendiente</span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Fecha</span>
          <span className="text-sm font-semibold text-gray-800">
            {new Date().toLocaleString('es-CO', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* Info box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-blue-50 to-purple-50 border border-purple-100 rounded-xl p-4 mb-6"
      >
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 mb-1">
              Tu transacción está siendo procesada
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              En 5-10 minutos se verificará y se actualizará el saldo en la app. 
              Te notificaremos cuando esté listo.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Close button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        onClick={onClose}
        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        Entendido
      </motion.button>
    </motion.div>
  );
};

// Header component para el modal
export const PaymentSuccessHeader = () => (
  <div className="relative p-8 text-white overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 animate-pulse"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 animate-pulse delay-300"></div>
    
    <SuccessCheckmark />
    <SuccessMessage />
  </div>
);

// Contenido principal del modal
export const PaymentSuccessModalContent = ({
  amount,
  paymentMethod,
  transactionRef,
  onClose
}: PaymentSuccessModalContentProps) => {
  return (
    <TransactionDetails
      amount={amount}
      paymentMethod={paymentMethod}
      transactionRef={transactionRef}
      onClose={onClose}
    />
  );
};

