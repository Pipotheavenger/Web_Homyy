'use client';
import { useState } from 'react';
import { X, DollarSign, CheckCircle, Loader2 } from 'lucide-react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  trabajo: {
    titulo: string;
    descripcion: string;
  };
  onSubmit: (precio: number) => void;
}

export const ApplicationModal = ({ isOpen, onClose, trabajo, onSubmit }: ApplicationModalProps) => {
  const [precio, setPrecio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!precio || isNaN(Number(precio))) return;
    
    setIsSubmitting(true);
    
    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Simular éxito y cerrar
    setTimeout(() => {
      setIsSuccess(false);
      onSubmit(Number(precio));
      onClose();
      setPrecio('');
    }, 2000);
  };

  const formatPrice = (price: string) => {
    if (!price) return '';
    const numPrice = Number(price);
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(numPrice);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Establecer Precio</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="space-y-6">
          {/* Información del trabajo */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2">{trabajo.titulo}</h3>
            <p className="text-sm text-gray-600">{trabajo.descripcion}</p>
          </div>

          {/* Input de precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Cuál es tu precio para este trabajo?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 outline-none"
                min="0"
              />
            </div>
            {precio && (
              <p className="text-sm text-gray-500 mt-2">
                Precio formateado: {formatPrice(precio)}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!precio || isNaN(Number(precio)) || isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle size={16} />
                  <span>¡Enviado!</span>
                </>
              ) : (
                <span>Aplicar</span>
              )}
            </button>
          </div>
        </div>

        {/* Animación de éxito */}
        {isSuccess && (
          <div className="absolute inset-0 bg-white/95 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                ¡Aplicación Enviada!
              </h3>
              <p className="text-gray-600">
                Tu aplicación ha sido enviada exitosamente al cliente
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
