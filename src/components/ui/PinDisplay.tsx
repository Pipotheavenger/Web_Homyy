import React from 'react';

interface PinDisplayProps {
  pin: string;
  className?: string;
}

export const PinDisplay: React.FC<PinDisplayProps> = ({ pin, className = '' }) => {
  // Asegurar que el PIN tenga exactamente 4 dígitos
  const paddedPin = pin.padStart(4, '0').slice(0, 4);
  const digits = paddedPin.split('');

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {digits.map((digit, index) => (
        <div
          key={index}
          className="w-12 h-12 bg-white rounded-lg shadow-sm border-2 border-gray-200 flex items-center justify-center relative overflow-hidden"
        >
          {/* Efecto de brillo sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50 opacity-30"></div>
          <span className="text-xl font-bold text-gray-800 select-none relative z-10">
            {digit}
          </span>
        </div>
      ))}
    </div>
  );
};
