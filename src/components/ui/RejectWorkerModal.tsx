import { X, UserMinus } from 'lucide-react';

interface RejectWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  workerName: string;
  loading?: boolean;
}

export const RejectWorkerModal = ({
  isOpen,
  onClose,
  onConfirm,
  workerName,
  loading = false
}: RejectWorkerModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-t-3xl md:rounded-2xl md:max-w-sm w-full md:w-auto shadow-[0_20px_60px_rgba(239,68,68,0.15)] border border-white/40 m-0 md:m-4">
        <div className="p-6">
          {/* Close button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-6 h-6 bg-gray-100/60 hover:bg-gray-200/60 rounded-lg flex items-center justify-center transition-all duration-300"
            >
              <X size={12} className="text-gray-500" />
            </button>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center shadow-lg">
              <UserMinus size={36} className="text-red-500" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-3">
            {`\u00BFRechazar a ${workerName}?`}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-center text-sm mb-6 leading-relaxed">
            Esta acci&oacute;n no se puede deshacer y el profesional dejar&aacute; de aparecer en tus postulantes.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Rechazar</span>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full px-4 py-3 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 border-2 border-gray-200 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
