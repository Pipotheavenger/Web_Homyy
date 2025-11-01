import { X, CheckCircle, Clock } from 'lucide-react';
import Image from 'next/image';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  metodoPago: string;
  monto: number;
  onConfirmPayment?: () => void;
}

export const QRModal = ({ isOpen, onClose, metodoPago, monto, onConfirmPayment }: QRModalProps) => {
  if (!isOpen) return null;

  console.log('QRModal recibió monto:', monto, 'Tipo:', typeof monto, 'Método:', metodoPago);
  console.log('¿Es Nequi?', metodoPago.toLowerCase() === 'nequi');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getMetodoColor = (metodo: string) => {
    switch (metodo.toLowerCase()) {
      case 'pse':
        return 'from-blue-500 to-blue-600';
      case 'nequi':
        return 'from-purple-500 to-purple-600';
      case 'daviplata':
        return 'from-green-500 to-green-600';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  const getMetodoIcon = (metodo: string) => {
    switch (metodo.toLowerCase()) {
      case 'pse':
        return '🏦';
      case 'nequi':
        return '📱';
      case 'daviplata':
        return '⚡';
      default:
        return '💳';
    }
  };

  const handleConfirmPayment = () => {
    if (onConfirmPayment) {
      onConfirmPayment();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-md w-full shadow-[0_20px_60px_rgba(116,63,198,0.15)] border border-white/40 my-8 max-h-[90vh] flex flex-col">
        <div className="p-4 overflow-y-auto flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 bg-gradient-to-br ${getMetodoColor(metodoPago)} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-xl">{getMetodoIcon(metodoPago)}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Pago con {metodoPago}</h3>
                <p className="text-[10px] text-gray-500 font-medium">Escanea el código QR</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100/60 hover:bg-gray-200/60 rounded-lg flex items-center justify-center transition-all duration-300"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Contenido principal */}
          <div className="space-y-3">
            {/* Monto destacado */}
            <div className="bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-blue-100/80 rounded-xl p-3 border border-purple-200/30">
              <div className="text-center">
                <span className="text-xl font-bold text-purple-600 block">
                  {formatPrice(monto)}
                </span>
                <p className="text-[10px] text-gray-600 font-medium mt-0.5">
                  Monto a pagar
                </p>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-gradient-to-r from-gray-50/80 to-purple-50/80 border border-gray-200/30 rounded-xl p-4">
              <div className="text-center">
                <div className="w-40 h-40 bg-white rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg border-2 border-gray-200 overflow-hidden">
                   <div className="w-full h-full flex items-center justify-center p-1">
                     {/* QR real de Nequi para todos los métodos */}
                     <Image
                       src="/nequi.jpg"
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
                  {/* Información específica según el método de pago */}
                  <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 border border-purple-200/30 rounded-lg p-2 mt-2">
                    <p className="text-[10px] text-purple-700 font-medium mb-1">
                      Información del pago: Sebastián Valencia - 3212681034
                    </p>
                    {metodoPago.toLowerCase() === 'nequi' && (
                      <>
                        <p className="text-[10px] text-purple-600">
                          Número: <strong>321-268-1034</strong>
                        </p>
                        <p className="text-[10px] text-purple-600">
                          Nombre: <strong>Sebastián Valencia</strong>
                        </p>
                      </>
                    )}
                    {metodoPago.toLowerCase() === 'daviplata' && (
                      <>
                        <p className="text-[10px] text-purple-600">
                          Número: <strong>300-123-4567</strong>
                        </p>
                        <p className="text-[10px] text-purple-600">
                          Nombre: <strong>Sebastián Valencia</strong>
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
                  </div>
                </div>
              </div>
            </div>

            {/* Información de tiempo de procesamiento */}
            <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/30 rounded-xl p-3">
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
            </div>

            {/* Información adicional */}
            <div className="bg-gradient-to-r from-green-50/80 to-blue-50/80 border border-green-200/30 rounded-xl p-2">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] text-white">⏱️</span>
                </div>
                <p className="text-[10px] text-green-800 font-medium">
                  Tienes 5 minutos para completar el pago
                </p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex space-x-2 mt-4">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2.5 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 border-2 border-gray-200 flex items-center justify-center space-x-1.5 text-xs"
            >
              <X size={12} />
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
      </div>
    </div>
  );
}; 