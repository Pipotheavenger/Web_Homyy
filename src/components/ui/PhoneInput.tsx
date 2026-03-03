'use client';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  error?: string;
  isFocused?: boolean;
  placeholder?: string;
  className?: string;
}

export default function PhoneInput({
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  isFocused,
  placeholder = "300 123 4567",
  className = ""
}: PhoneInputProps) {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números y formatear automáticamente
    const inputValue = e.target.value.replace(/\D/g, '');
    
    // Limitar a 10 dígitos (número colombiano sin código de país)
    if (inputValue.length <= 10) {
      // Formatear el número: XXX XXX XXXX
      let formattedValue = inputValue;
      if (inputValue.length >= 3) {
        formattedValue = inputValue.slice(0, 3);
        if (inputValue.length >= 6) {
          formattedValue += ' ' + inputValue.slice(3, 6);
          if (inputValue.length > 6) {
            formattedValue += ' ' + inputValue.slice(6);
          }
        } else if (inputValue.length > 3) {
          formattedValue += ' ' + inputValue.slice(3);
        }
      }
      onChange(formattedValue);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        Número de teléfono *
      </label>
      <div className="relative">
        {/* Prefijo con bandera de Colombia */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
            {/* Bandera de Colombia SVG */}
            <svg className="w-5 h-4" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="20" height="15" rx="2" fill="#FDD835"/>
              <rect y="5" width="20" height="5" fill="#1976D2"/>
              <rect y="10" width="20" height="5" rx="0 0 2 2" fill="#D32F2F"/>
            </svg>
            <span className="text-gray-600 font-medium text-sm">+57</span>
          </div>
        </div>

        <input
          type="tel"
          value={value}
          onChange={handleInputChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full pl-24 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-200'
          } ${isFocused ? 'ring-2 ring-purple-500 border-transparent' : ''} ${className}`}
        />
      </div>

      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : (
        <p className="mt-1 text-xs text-gray-500">Número de 10 dígitos (ej: 300 123 4567)</p>
      )}
    </div>
  );
}
