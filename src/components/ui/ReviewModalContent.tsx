'use client';

import { useState } from 'react';
import { Star, MessageSquare, Send, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReviewModalContentProps {
  onSubmit: (rating: number, comment: string) => Promise<boolean>;
  professionalName: string;
  serviceTitle: string;
  onSuccess: () => void;
}

// Componente de información del servicio - Carga inmediata
export const ServiceInfo = ({ serviceTitle, professionalName }: { serviceTitle: string; professionalName: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-200"
  >
    <h3 className="font-semibold text-purple-900 mb-2">Servicio completado</h3>
    <p className="text-sm text-purple-700 mb-1">{serviceTitle}</p>
    <p className="text-sm text-purple-600">Trabajador: {professionalName}</p>
  </motion.div>
);

// Componente de calificación - Carga después
export const RatingSection = ({ rating, onRatingChange }: { rating: number; onRatingChange: (r: number) => void }) => {
  const getStarColor = (starIndex: number) => {
    if (starIndex <= rating) {
      return 'text-yellow-400';
    }
    return 'text-gray-300';
  };

  const ratingLabels: { [key: number]: string } = {
    1: 'Muy malo',
    2: 'Malo',
    3: 'Regular',
    4: 'Bueno',
    5: 'Excelente'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-6"
    >
      <label className="block text-sm font-medium text-gray-700 mb-3">
        ¿Cómo calificarías el trabajo realizado?
      </label>
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <button
            key={starIndex}
            onClick={() => onRatingChange(starIndex)}
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
          {ratingLabels[rating]}
        </p>
      )}
    </motion.div>
  );
};

// Componente de comentario - Carga después
export const CommentSection = ({ comment, onCommentChange }: { comment: string; onCommentChange: (c: string) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="mb-6"
  >
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Comentario (opcional)
    </label>
    <div className="relative">
      <MessageSquare size={16} className="absolute left-3 top-3 text-gray-400" />
      <textarea
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Comparte tu experiencia con este profesional..."
        rows={4}
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none placeholder-gray-500"
      />
    </div>
  </motion.div>
);

// Contenido principal del modal
export const ReviewModalContent = ({
  onSubmit,
  professionalName,
  serviceTitle,
  onSuccess
}: ReviewModalContentProps) => {
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
          onSuccess();
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

  if (isSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-8 p-6"
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
    );
  }

  return (
    <div className="p-6">
      {/* Información del servicio - Carga inmediata */}
      <ServiceInfo serviceTitle={serviceTitle} professionalName={professionalName} />

      {/* Calificación - Carga progresiva */}
      <RatingSection rating={rating} onRatingChange={setRating} />

      {/* Comentario - Carga progresiva */}
      <CommentSection comment={comment} onCommentChange={setComment} />

      {/* Botones - Carga inmediata */}
      <div className="flex space-x-3">
        <button
          onClick={() => onSuccess()}
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
    </div>
  );
};

