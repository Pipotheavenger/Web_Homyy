import { ReactNode, useId } from 'react';
import { capitalizeText, capitalizeFirstLetter, capitalizeProperName } from '@/lib/utils';

interface FormInputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  error?: string;
  isFocused: boolean;
  /** Icono a la izquierda (omitir si usas `leftAddon`). */
  icon?: ReactNode;
  /** Prefijo fijo a la izquierda (p. ej. bandera + código país). */
  leftAddon?: ReactNode;
  /** Etiqueta visible encima del campo (p. ej. login). */
  label?: string;
  /** Clases extra para la etiqueta (p. ej. estilo sin mayúsculas). */
  labelClassName?: string;
  /** Texto de ayuda bajo el campo (se oculta si hay `error`). */
  helperText?: string;
  autoComplete?: string;
  rightElement?: ReactNode;
  capitalizeType?: 'all' | 'first' | 'proper' | 'none';
}

export const FormInput = ({
  type,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  isFocused,
  icon,
  leftAddon,
  label,
  labelClassName,
  helperText,
  autoComplete,
  rightElement,
  capitalizeType = 'none'
}: FormInputProps) => {
  const inputId = useId();

  const handleInputChange = (inputValue: string) => {
    let processedValue = inputValue;

    // Aplicar capitalización según el tipo
    if (capitalizeType !== 'none') {
      switch (capitalizeType) {
        case 'all':
          processedValue = capitalizeText(inputValue);
          break;
        case 'first':
          processedValue = capitalizeFirstLetter(inputValue);
          break;
        case 'proper':
          processedValue = capitalizeProperName(inputValue);
          break;
        default:
          processedValue = inputValue;
      }
    }

    onChange(processedValue);
  };

  const paddingLeft = leftAddon ? 'pl-[6.75rem] sm:pl-28' : icon ? 'pl-10' : 'pl-4';

  const defaultLabelClass =
    'block text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5';

  const phoneField = Boolean(leftAddon);

  return (
    <div className="space-y-1">
      {label ? (
        <label
          htmlFor={inputId}
          className={labelClassName ?? defaultLabelClass}
        >
          {label}
        </label>
      ) : null}
      <div className="relative group">
        {leftAddon ? (
          <div
            className="absolute left-3 top-1/2 z-[1] -translate-y-1/2 flex items-center gap-2.5 pr-3 border-r border-gray-200 pointer-events-none"
            aria-hidden
          >
            {leftAddon}
          </div>
        ) : icon ? (
          <div
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${
              isFocused ? 'text-[#743fc6] scale-110' : 'text-gray-400'
            }`}
          >
            {icon}
          </div>
        ) : null}

        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          className={
            phoneField
              ? `w-full ${paddingLeft} pr-4 py-3.5 rounded-2xl border transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 text-sm sm:text-base ${
                  error
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/15'
                    : isFocused
                      ? 'border-[#743fc6] shadow-[0_0_0_3px_rgba(116,63,198,0.12)]'
                      : 'border-slate-200/90 hover:border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-[#743fc6]/25`
              : `w-full ${paddingLeft} pr-12 py-3 rounded-xl border-2 transition-all duration-300 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-400 font-medium text-sm sm:text-base ${
                  error
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : isFocused
                      ? 'border-[#743fc6] focus:border-[#743fc6] focus:ring-[#743fc6]/20'
                      : 'border-gray-200 hover:border-gray-300'
                } focus:ring-4 focus:outline-none hover:bg-white/80 focus:bg-white/90 hover:shadow-md focus:shadow-lg transform hover:scale-[1.01] focus:scale-[1.01]`
          }
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      
      {error ? (
        <p className="text-red-500 text-xs ml-0.5 animate-shake font-medium leading-tight">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 leading-snug mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}; 