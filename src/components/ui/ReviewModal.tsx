'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MessageSquare, Send, Loader2, CheckCircle } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<boolean>;
  professionalName: string;
  serviceTitle: string;
}

export const ReviewModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  professionalName,
  serviceTitle 
}: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmit(rating, comment);
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
          setRating(0);
          setComment('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const getStarColor = (starIndex: number) => {
    if (starIndex <= rating) {
      return 'text-yellow-400';
    }
    return 'text-gray-300';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Star size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Dejar Reseña</h2>
                    <p className="text-white/80 text-sm">Califica el trabajo realizado</p>
                  </div>
                </div>
                {!isSuccess && (
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
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
                  ¡Reseña Enviada!
                </h3>
                <p className="text-gray-600">
                  Gracias por tu feedback. Tu reseña ayudará a otros usuarios.
                </p>
              </motion.div>
            ) : (
              <>
                {/* Información del servicio */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">Servicio completado</h3>
                  <p className="text-sm text-purple-700 mb-1">{serviceTitle}</p>
                  <p className="text-sm text-purple-600">Trabajador: {professionalName}</p>
                </div>

                {/* Calificación */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    ¿Cómo calificarías el trabajo realizado?
                  </label>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((starIndex) => (
                      <button
                        key={starIndex}
                        onClick={() => handleStarClick(starIndex)}
                        className="transition-transform duration-200 hover:scale-110"
                      >
                        <Star
                          size={32}
                          className={`cursor-pointer ${
                            getStarColor(starIndex)
                          } ${rating >= starIndex ? 'fill-current' : ''}`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-sm text-gray-600 mt-2">
                      {rating === 1 && 'Muy malo'}
                      {rating === 2 && 'Malo'}
                      {rating === 3 && 'Regular'}
                      {rating === 4 && 'Bueno'}
                      {rating === 5 && 'Excelente'}
                    </p>
                  )}
                </div>

                {/* Comentario */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentario (opcional)
                  </label>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Comparte tu experiencia con este profesional..."
                      rows={4}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Enviar Reseña</span>
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
