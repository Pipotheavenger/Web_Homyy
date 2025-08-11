import { X, CheckCircle, Clock } from 'lucide-react';

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

  // QR base64 simple como fallback
  const qrBase64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjE2MCIgeT0iMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSIwIiB5PSIxNjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iNDAiIHk9IjQwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iNjAiIHk9IjYwIiB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IndoaXRlIi8+CjxyZWN0IHg9IjgwIiB5PSI4MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4K";

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-md w-full shadow-[0_20px_60px_rgba(116,63,198,0.15)] border border-white/40">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${getMetodoColor(metodoPago)} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-2xl">{getMetodoIcon(metodoPago)}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Pago con {metodoPago}</h3>
                <p className="text-xs text-gray-500 font-medium">Escanea el código QR</p>
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
          <div className="space-y-4">
            {/* Monto destacado */}
            <div className="bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-blue-100/80 rounded-xl p-4 border border-purple-200/30">
              <div className="text-center">
                <span className="text-2xl font-bold text-purple-600 block">
                  {formatPrice(monto)}
                </span>
                <p className="text-xs text-gray-600 font-medium mt-1">
                  Monto a pagar
                </p>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-gradient-to-r from-gray-50/80 to-purple-50/80 border border-gray-200/30 rounded-xl p-6">
              <div className="text-center">
                <div className="w-48 h-48 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg border-2 border-gray-200 overflow-hidden">
                  {metodoPago.toLowerCase() === 'nequi' ? (
                    <div className="w-full h-full flex items-center justify-center">
                      {/* QR CSS que se ve real */}
                      <div className="w-40 h-40 bg-white p-2 rounded-lg">
                        <div className="w-full h-full bg-black grid grid-cols-11 grid-rows-11 gap-0.5">
                          {/* Patrón de QR más realista */}
                          {Array.from({ length: 121 }, (_, i) => {
                            const row = Math.floor(i / 11);
                            const col = i % 11;
                            
                            // Patrón de QR más complejo
                            let isWhite = false;
                            
                            // Esquinas (finder patterns)
                            if ((row < 3 && col < 3) || 
                                (row < 3 && col > 7) || 
                                (row > 7 && col < 3)) {
                              isWhite = (row === 1 && col === 1) || 
                                       (row === 1 && col === 9) || 
                                       (row === 9 && col === 1);
                            }
                            // Patrón central
                            else if (row >= 4 && row <= 6 && col >= 4 && col <= 6) {
                              isWhite = (row === 5 && col === 5);
                            }
                            // Patrón fijo para el resto
                            else {
                              isWhite = (row + col) % 2 === 0;
                            }
                            
                            return (
                              <div 
                                key={i} 
                                className={`w-full h-full ${isWhite ? 'bg-white' : 'bg-black'}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-2">
                        <span className="text-4xl">📱</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Código QR</p>
                      <p className="text-xs text-gray-400">Escanea con tu app</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-800">
                    Escanea el código QR con tu aplicación {metodoPago}
                  </p>
                  <p className="text-xs text-gray-600">
                    El pago se procesará automáticamente
                  </p>
                  {metodoPago.toLowerCase() === 'nequi' && (
                    <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 border border-purple-200/30 rounded-lg p-3 mt-3">
                      <p className="text-xs text-purple-700 font-medium mb-1">
                        Información del pago:
                      </p>
                      <p className="text-xs text-purple-600">
                        Número: <strong>321-268-1034</strong>
                      </p>
                      <p className="text-xs text-purple-600">
                        Nombre: <strong>Sebastián Valencia</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información de tiempo de procesamiento */}
            <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800 mb-1">
                    Tiempo de procesamiento
                  </p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    La recarga se verá reflejada en tu saldo de la aplicación entre <strong>5 y 10 minutos</strong> después de completar el pago.
                  </p>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gradient-to-r from-green-50/80 to-blue-50/80 border border-green-200/30 rounded-xl p-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-white">⏱️</span>
                </div>
                <p className="text-xs text-green-800 font-medium">
                  Tienes 5 minutos para completar el pago
                </p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 border-2 border-gray-200 flex items-center justify-center space-x-2"
            >
              <X size={14} />
              <span>Cancelar</span>
            </button>
            <button
              onClick={handleConfirmPayment}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <CheckCircle size={14} />
              <span>Listo, ya hice el pago</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 