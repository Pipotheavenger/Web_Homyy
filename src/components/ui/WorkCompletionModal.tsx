'use client';

import { Suspense } from 'react';
import { Shield } from 'lucide-react';
import { ModalStreaming } from './ModalStreaming';
import { WorkCompletionModalContent } from './WorkCompletionModalContent';

interface WorkCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<boolean>;
  serviceTitle: string;
}

export const WorkCompletionModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  serviceTitle 
}: WorkCompletionModalProps) => {
  const header = (
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
        <Shield size={24} />
      </div>
      <div>
        <h2 className="text-xl font-bold">Finalizar Trabajo</h2>
        <p className="text-white/80 text-sm">Ingresa el PIN para completar</p>
      </div>
    </div>
  );

  return (
    <ModalStreaming
      isOpen={isOpen}
      onClose={onClose}
      header={header}
      headerGradient="from-emerald-500 via-green-500 to-emerald-600"
    >
      <Suspense fallback={
        <div className="p-6 space-y-4">
          <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      }>
        <WorkCompletionModalContent
          onSubmit={onSubmit}
          serviceTitle={serviceTitle}
          onSuccess={onClose}
        />
      </Suspense>
    </ModalStreaming>
  );
};
