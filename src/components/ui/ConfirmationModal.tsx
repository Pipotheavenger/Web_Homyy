import { X, UserCheck, DollarSign, Sparkles } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  candidateName: string;
  candidateSpecialty: string;
  candidatePrice: number;
}

export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  candidateName, 
  candidateSpecialty,
  candidatePrice 
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-t-3xl md:rounded-2xl md:max-w-md w-full md:w-auto shadow-[0_20px_60px_rgba(116,63,198,0.15)] border border-white/40 m-0 md:m-4">
        <div className="p-6">
          {/* Header moderno */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shadow-lg">
                <UserCheck size={24} className="text-purple-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Confirmar Selección</h3>
                <p className="text-xs text-gray-500 font-medium">¿Estás seguro de tu elección?</p>
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
            <div className="text-center">
              <p className="text-gray-600 mb-2 text-base">
                ¿Estás seguro de que quieres seleccionar a:
              </p>
              <h4 className="text-xl font-bold text-gray-800 mb-1.5">
                {candidateName}
              </h4>
              <p className="text-sm text-purple-600 font-semibold mb-4">
                {candidateSpecialty}
              </p>
            </div>

            {/* Precio destacado con diseño moderno */}
            <div className="bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-blue-100/80 rounded-xl p-4 border border-purple-200/30">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <DollarSign size={20} className="text-white" />
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-purple-600">
                    {formatPrice(candidatePrice)}
                  </span>
                  <p className="text-xs text-gray-600 font-medium mt-1">
                    Precio por servicio
                  </p>
                </div>
              </div>
            </div>

            {/* Mensaje informativo moderno */}
            <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/30 rounded-xl p-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <Sparkles size={12} className="text-white" />
                </div>
                <p className="text-xs text-blue-800 font-medium">
                  Al confirmar, se procederá con la contratación de este profesional.
                </p>
              </div>
            </div>
          </div>

          {/* Acciones modernas */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 border-2 border-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Confirmar Selección
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 