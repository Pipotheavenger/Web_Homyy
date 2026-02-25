'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { usePhoneVerificationStatus } from '@/hooks/usePhoneVerificationStatus';
import PhoneVerificationModal from './PhoneVerificationModal';

const DISMISS_KEY = 'hommy_phone_verify_dismissed';

export default function PhoneVerificationBar() {
  const { isVerified, phone, userId, loading } = usePhoneVerificationStatus();
  const [isDismissed, setIsDismissed] = useState(true); // Start true to avoid flash
  const [showModal, setShowModal] = useState(false);
  const [verifiedLocally, setVerifiedLocally] = useState(false);

  useEffect(() => {
    try {
      setIsDismissed(sessionStorage.getItem(DISMISS_KEY) === 'true');
    } catch {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    try { sessionStorage.setItem(DISMISS_KEY, 'true'); } catch {}
    setIsDismissed(true);
  };

  const handleVerified = () => {
    setVerifiedLocally(true);
    setShowModal(false);
    try { sessionStorage.removeItem(DISMISS_KEY); } catch {}
  };

  const shouldHideBar = loading || isVerified === true || isVerified === null || verifiedLocally || isDismissed;

  if (shouldHideBar) {
    // Keep the modal rendered if it was already open
    return showModal ? (
      <PhoneVerificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onVerified={handleVerified}
        initialPhone={phone?.replace(/\s/g, '') || ''}
        userId={userId || undefined}
      />
    ) : null;
  }

  return (
    <>
      <div className="px-3 sm:px-4 md:px-6 pt-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Alert icon */}
            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="text-orange-500" size={22} />
            </div>

            {/* Text */}
            <p className="text-sm">
              <span className="font-bold text-gray-900">Tu cuenta aún no está verificada. </span>
              <span className="text-gray-700">
                Verifica tu número de celular para recibir notificaciones por WhatsApp y acceder a todas las funciones.
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            {/* Verify button */}
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Verificar ahora
            </button>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} className="text-amber-700" />
            </button>
          </div>
        </div>
      </div>

      <PhoneVerificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onVerified={handleVerified}
        initialPhone={phone?.replace(/\s/g, '') || ''}
        userId={userId || undefined}
      />
    </>
  );
}
