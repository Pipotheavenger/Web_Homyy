'use client';

import { Suspense } from 'react';
import { Star } from 'lucide-react';
import { ModalStreaming } from './ModalStreaming';
import { ReviewModalContent } from './ReviewModalContent';

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
  const header = (
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
        <Star size={24} />
      </div>
      <div>
        <h2 className="text-xl font-bold">Dejar Reseña</h2>
        <p className="text-white/80 text-sm">Califica el trabajo realizado</p>
      </div>
    </div>
  );

  return (
    <ModalStreaming
      isOpen={isOpen}
      onClose={onClose}
      header={header}
      headerGradient="from-purple-500 via-pink-500 to-purple-600"
    >
      <Suspense fallback={
        <div className="p-6 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      }>
        <ReviewModalContent
          onSubmit={onSubmit}
          professionalName={professionalName}
          serviceTitle={serviceTitle}
          onSuccess={onClose}
        />
      </Suspense>
    </ModalStreaming>
  );
};
