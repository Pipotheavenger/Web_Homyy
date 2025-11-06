'use client';

import { Suspense, lazy, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

interface ModalStreamingProps {
  isOpen: boolean;
  onClose: () => void;
  header: ReactNode;
  headerGradient?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
}

// Skeleton para el contenido del modal
const ModalContentSkeleton = () => (
  <div className="p-6 space-y-4">
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
    </div>
    <div className="space-y-2">
      <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
    <div className="flex justify-center py-4">
      <Loader2 size={24} className="text-purple-500 animate-spin" />
    </div>
  </div>
);

export const ModalStreaming = ({
  isOpen,
  onClose,
  header,
  headerGradient = 'from-purple-500 via-pink-500 to-purple-600',
  children,
  footer,
  maxWidth = 'md:max-w-md',
  showCloseButton = true
}: ModalStreamingProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-white rounded-t-3xl md:rounded-2xl ${maxWidth} w-full md:w-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden m-0 md:m-4 flex flex-col max-h-[90vh]`}
        >
          {/* Header - Carga inmediata */}
          <div className={`bg-gradient-to-r ${headerGradient} p-6 text-white relative overflow-hidden flex-shrink-0`}>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex-1">{header}</div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors ml-4 flex-shrink-0"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content - Streaming con Suspense */}
          <div className="flex-1 overflow-y-auto">
            <Suspense fallback={<ModalContentSkeleton />}>
              {children}
            </Suspense>
          </div>

          {/* Footer - Si existe */}
          {footer && (
            <div className="border-t border-gray-200 p-4 flex-shrink-0">
              {footer}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Componente helper para cargar contenido lazy
export const createLazyModalContent = (importFn: () => Promise<any>) => {
  return lazy(importFn);
};

