'use client';

interface RoleSelectionProps {
  onSelectRole: (role: 'user' | 'worker') => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Título */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-black">
          ¿Cómo quieres usar Hommy?
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Selecciona la opción que mejor se adapte a ti
        </p>
      </div>

      {/* Tarjetas de selección */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta Buscar servicios */}
        <div 
          onClick={() => onSelectRole('user')}
          className="group bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-5 sm:p-8 cursor-pointer transition-all duration-300 hover:bg-white hover:scale-105 hover:shadow-purple-500/20 hover:border-purple-300/50 hover:bg-purple-50/30 transform"
        >
          <div className="text-center space-y-6">
            {/* Icono */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:from-purple-200/80 group-hover:to-pink-200/80 transition-all duration-300">
              <svg className="w-10 h-10 text-purple-600 group-hover:text-purple-700 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            
            {/* Contenido */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                Buscar servicios
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Encuentra profesionales confiables para tu hogar. Desde limpieza hasta reparaciones.
              </p>
            </div>

            {/* Características */}
            <ul className="text-left space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Contrata servicios de calidad
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Profesionales verificados
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Pagos seguros
              </li>
            </ul>
          </div>
        </div>

        {/* Tarjeta Vender servicios */}
        <div 
          onClick={() => onSelectRole('worker')}
          className="group bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-5 sm:p-8 cursor-pointer transition-all duration-300 hover:bg-white hover:scale-105 hover:shadow-orange-500/20 hover:border-orange-300/50 hover:bg-orange-50/30 transform"
        >
          <div className="text-center space-y-6">
            {/* Icono */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:from-orange-200/80 group-hover:to-orange-300/80 transition-all duration-300">
              <svg className="w-10 h-10 text-purple-600 group-hover:text-orange-600 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            
            {/* Contenido */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-700 transition-colors">
                Vender servicios
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Ofrece tus habilidades y genera ingresos. Conecta con clientes que necesitan tu experiencia.
              </p>
            </div>

            {/* Características */}
            <ul className="text-left space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Genera ingresos extras
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Horarios flexibles
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Clientes cerca de ti
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Indicador de paso */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-2 bg-white/40 rounded-full">
            <div className="w-4 h-2 bg-white rounded-full"></div>
          </div>
          <div className="w-2 h-2 bg-white/30 rounded-full"></div>
          <div className="w-2 h-2 bg-white/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
