'use client';
import { useEffect, useState } from 'react';
import { Clock, X } from 'lucide-react';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  paymentMethod: string;
  transactionRef: string;
}

export const PaymentSuccessModal = ({
  isOpen,
  onClose,
  amount,
  paymentMethod,
  transactionRef
}: PaymentSuccessModalProps) => {
  const [showCheck, setShowCheck] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset animations
      setShowCheck(false);
      setShowDetails(false);
      
      // Trigger animations with delays
      setTimeout(() => setShowCheck(true), 300);
      setTimeout(() => setShowDetails(true), 800);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-[0_20px_80px_rgba(0,0,0,0.3)] overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 p-8 text-white overflow-hidden">
          {/* Animated background circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 animate-pulse delay-300"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 z-10"
          >
            <X size={16} className="text-white" />
          </button>

          {/* Animated checkmark */}
          <div className="flex justify-center mb-4">
            <div className={`transform transition-all duration-700 ${
              showCheck ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-180 opacity-0'
            }`}>
              <div className="relative">
                {/* Animated ring */}
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
                {/* Clock container */}
                <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                  <Clock size={48} className="text-blue-500" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          {/* Success message */}
          <div className={`text-center transition-all duration-700 delay-300 ${
            showCheck ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h2 className="text-2xl font-bold mb-2">¡Transacción Procesada!</h2>
            <p className="text-white/90 text-sm">Tu solicitud está siendo verificada</p>
          </div>
        </div>

        {/* Transaction details */}
        <div className={`p-8 transition-all duration-700 delay-500 ${
          showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
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
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-purple-100 rounded-xl p-4 mb-6">
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
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Entendido
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
};

