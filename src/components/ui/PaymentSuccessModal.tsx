'use client';

import { Suspense } from 'react';
import { ModalStreaming } from './ModalStreaming';
import { PaymentSuccessModalContent, PaymentSuccessHeader } from './PaymentSuccessModalContent';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  paymentMethod: string;
  transactionRef: string;
}

export const PaymentSuccessModal = ({
  isOpen,
  onClose,
  amount,
  paymentMethod,
  transactionRef
}: PaymentSuccessModalProps) => {
  return (
    <ModalStreaming
      isOpen={isOpen}
      onClose={onClose}
      header={<PaymentSuccessHeader />}
      headerGradient="from-purple-500 via-pink-500 to-purple-600"
      showCloseButton={true}
    >
      <Suspense fallback={
        <div className="p-8 space-y-4">
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
      }>
        <PaymentSuccessModalContent
          amount={amount}
          paymentMethod={paymentMethod}
          transactionRef={transactionRef}
        />
      </Suspense>
    </ModalStreaming>
  );
};

