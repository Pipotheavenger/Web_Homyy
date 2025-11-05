import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface CancelServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  serviceTitle: string;
}

export const CancelServiceModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  serviceTitle 
}: CancelServiceModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-t-3xl md:rounded-2xl md:max-w-sm w-full md:w-auto shadow-[0_20px_60px_rgba(239,68,68,0.15)] border border-white/40 m-0 md:m-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Cancelar Servicio</h3>
                <p className="text-xs text-gray-500 font-medium">¿Estás seguro?</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 bg-gray-100/60 hover:bg-gray-200/60 rounded-lg flex items-center justify-center transition-all duration-300"
            >
              <X size={12} className="text-gray-500" />
            </button>
          </div>

          {/* Contenido */}
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-gray-600 mb-2 text-sm">
                ¿Estás seguro de que quieres cancelar el servicio:
              </p>
              <h4 className="text-base font-semibold text-gray-800 mb-3">
                "{serviceTitle}"
              </h4>
            </div>

            {/* Advertencia */}
            <div className="bg-gradient-to-r from-red-50/80 to-pink-50/80 border border-red-200/30 rounded-xl p-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-pink-400 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={12} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-red-800 font-medium mb-0.5">
                    Esta acción no se puede deshacer
                  </p>
                  <p className="text-xs text-red-600">
                    Se notificará a todos los postulantes sobre la cancelación
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 border-2 border-gray-200"
            >
              Mantener Servicio
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-1.5"
            >
              <Trash2 size={12} />
              <span>Cancelar Servicio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 