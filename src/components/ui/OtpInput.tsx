'use client';

import { useRef, useCallback } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export default function OtpInput({ value, onChange, disabled, error }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const focusInput = useCallback((index: number) => {
    if (index >= 0 && index < 6) {
      inputsRef.current[index]?.focus();
    }
  }, []);

  const handleChange = (index: number, char: string) => {
    if (disabled) return;

    // Solo aceptar dígitos
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    const newValue = newDigits.join('').replace(/\s/g, '');
    onChange(newValue);

    // Auto-avance al siguiente campo
    if (char && index < 5) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index]) {
        // Si hay un dígito en el campo actual, eliminarlo
        handleChange(index, '');
      } else if (index > 0) {
        // Si el campo está vacío, ir al anterior y eliminarlo
        handleChange(index - 1, '');
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < 5) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (disabled) return;

    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      onChange(pastedData);
      // Enfocar el siguiente campo vacío o el último
      focusInput(Math.min(pastedData.length, 5));
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputsRef.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value.slice(-1))}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className={`w-10 h-12 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${
            error
              ? 'border-red-300 bg-red-50 text-red-600'
              : digit
                ? 'border-purple-400 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-white text-gray-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={`Dígito ${index + 1}`}
        />
      ))}
    </div>
  );
}
