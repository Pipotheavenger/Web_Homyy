'use client';

import { Suspense } from 'react';
import { X } from 'lucide-react';
import { ModalStreaming } from './ModalStreaming';
import { QRModalContent } from './QRModalContent';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  metodoPago: string;
  monto: number;
  onConfirmPayment?: () => void;
}

export const QRModal = ({ isOpen, onClose, metodoPago, monto, onConfirmPayment }: QRModalProps) => {
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

  const header = (
    <div className="flex items-center space-x-2">
      <div className={`w-10 h-10 bg-gradient-to-br ${getMetodoColor(metodoPago)} rounded-xl flex items-center justify-center shadow-lg`}>
        <span className="text-xl">{getMetodoIcon(metodoPago)}</span>
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-800">Pago con {metodoPago}</h3>
        <p className="text-[10px] text-gray-500 font-medium">Escanea el código QR</p>
      </div>
    </div>
  );

  return (
    <ModalStreaming
      isOpen={isOpen}
      onClose={onClose}
      header={header}
      maxWidth="md:max-w-md"
    >
      <Suspense fallback={
        <div className="p-4 space-y-3">
          <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      }>
        <QRModalContent
          metodoPago={metodoPago}
          monto={monto}
          onConfirmPayment={onConfirmPayment || (() => {})}
          onClose={onClose}
        />
      </Suspense>
    </ModalStreaming>
  );
};