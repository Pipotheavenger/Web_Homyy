interface UserTypeSelectorProps {
  selectedType: 'user' | 'worker';
  onSelect: (type: 'user' | 'worker') => void;
}

export const UserTypeSelector = ({ selectedType, onSelect }: UserTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¿Cómo quieres usar Hommy?
        </h2>
        <p className="text-gray-600">
          Selecciona el tipo de cuenta que mejor se adapte a tus necesidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Usuario */}
        <button
          onClick={() => onSelect('user')}
          className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
            selectedType === 'user'
              ? 'border-[#743fc6] bg-[#743fc6]/5 shadow-lg'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
              selectedType === 'user'
                ? 'bg-[#743fc6] text-white'
                : 'bg-gray-100 text-gray-600 group-hover:bg-[#743fc6]/10 group-hover:text-[#743fc6]'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Usuario
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Publica servicios y encuentra profesionales para resolver tus necesidades
              </p>
              <ul className="mt-3 space-y-1 text-xs text-gray-500">
                <li className="flex items-center">
                  <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Publicar servicios
                </li>
                <li className="flex items-center">
                  <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Encontrar profesionales
                </li>
                <li className="flex items-center">
                  <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Gestionar pagos
                </li>
              </ul>
            </div>
          </div>
        </button>

        {/* Worker */}
        <button
          onClick={() => onSelect('worker')}
          className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
            selectedType === 'worker'
              ? 'border-[#743fc6] bg-[#743fc6]/5 shadow-lg'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
              selectedType === 'worker'
                ? 'bg-[#743fc6] text-white'
                : 'bg-gray-100 text-gray-600 group-hover:bg-[#743fc6]/10 group-hover:text-[#743fc6]'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Profesional
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Ofrece tus servicios y gana dinero resolviendo necesidades de usuarios
              </p>
              <ul className="mt-3 space-y-1 text-xs text-gray-500">
                <li className="flex items-center">
                  <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Recibir solicitudes
                </li>
                <li className="flex items-center">
                  <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Gestionar trabajos
                </li>
                <li className="flex items-center">
                  <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Recibir pagos
                </li>
              </ul>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};







