import React from 'react';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

interface SuccessApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRedirect: () => void;
  serviceTitle: string;
}

export const SuccessApplicationModal: React.FC<SuccessApplicationModalProps> = ({
  isOpen,
  onClose,
  onRedirect,
  serviceTitle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl md:max-w-md w-full md:w-auto overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300 m-0 md:m-4">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            {/* Icono de éxito con animación */}
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            
            {/* Efectos de sparkles */}
            <div className="absolute top-4 left-4">
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <div className="absolute top-6 right-6">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse delay-150" />
            </div>
            <div className="absolute bottom-4 left-8">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse delay-300" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              ¡Aplicación Enviada! 🎉
            </h2>
            <p className="text-green-100 text-sm">
              Tu postulación ha sido registrada exitosamente
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💼</span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ¡Excelente trabajo!
            </h3>
            
            <p className="text-gray-600 mb-1">
              Tu aplicación para <span className="font-semibold text-orange-600">"{serviceTitle}"</span> ha sido enviada correctamente.
            </p>
            
            <p className="text-sm text-gray-500">
              El cliente revisará tu propuesta y te contactará si está interesado en tus servicios.
            </p>
          </div>

          {/* Información adicional */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">📋</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  ¿Qué sigue ahora?
                </p>
                <p className="text-xs text-gray-600">
                  Puedes revisar el estado de tus aplicaciones en tu dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300"
            >
              Cerrar
            </button>
            <button
              onClick={onRedirect}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>Ir al Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
