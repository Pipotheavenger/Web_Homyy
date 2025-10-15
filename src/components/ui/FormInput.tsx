import { ReactNode } from 'react';
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
  icon: ReactNode;
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
  autoComplete,
  rightElement,
  capitalizeType = 'none'
}: FormInputProps) => {
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
  return (
    <div className="space-y-1">
      <label className="block relative group">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${
          isFocused ? 'text-[#743fc6] scale-110' : 'text-gray-400'
        }`}>
          {icon}
        </div>
        
        <input
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 font-medium text-sm sm:text-base ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
              : isFocused
              ? 'border-[#743fc6] focus:border-[#743fc6] focus:ring-[#743fc6]/20'
              : 'border-gray-200 hover:border-gray-300'
          } focus:ring-4 focus:outline-none hover:bg-white/80 focus:bg-white/90 hover:shadow-md focus:shadow-lg transform hover:scale-[1.01] focus:scale-[1.01]`}
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </label>
      
      {error && (
        <p className="text-red-500 text-xs ml-2 animate-shake font-medium leading-tight">{error}</p>
      )}
    </div>
  );
}; 