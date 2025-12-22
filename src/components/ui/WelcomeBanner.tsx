import { Plus } from 'lucide-react';
import { ASSETS_CONFIG } from '@/lib/assets-config';

interface WelcomeBannerProps {
  userName: string;
  onCreateService: () => void;
}

export const WelcomeBanner = ({ userName, onCreateService }: WelcomeBannerProps) => {
  return (
    <div className="bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-2xl mb-4 md:mb-6 text-white relative overflow-hidden min-h-[380px] sm:min-h-[400px] md:min-h-[380px] lg:h-64 w-full max-w-full">
      {/* Contenido principal - Layout vertical para <1024px (que cubre 890px), horizontal para pantallas más grandes */}
      <div className="flex flex-col lg:flex-row items-center justify-between p-4 md:p-6 lg:p-10 h-full relative z-10 min-h-[380px] sm:min-h-[400px] md:min-h-[380px] lg:min-h-0 lg:h-full">
        {/* Texto y botón - Centrado en <1024px (que cubre 890px), alineado a la izquierda en pantallas más grandes */}
        <div className="flex-1 mb-6 sm:mb-8 md:mb-12 lg:mb-0 text-center lg:text-left w-full lg:w-auto px-2 lg:px-0 z-20 relative">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 lg:mb-2 break-words">¡Hola, {userName}!</h2>
          <p className="text-purple-100 mb-4 sm:mb-6 md:mb-8 lg:mb-4 text-sm md:text-base lg:text-lg break-words">Buscas servicios para tu hogar?</p>
          <button 
            onClick={onCreateService}
            className="bg-emerald-400 text-black px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-medium hover:bg-emerald-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm md:text-base w-full sm:w-auto mx-auto lg:mx-0 relative"
          >
            <Plus size={18} className="md:w-5 md:h-5" />
            <span>Crear Nuevo Servicio</span>
          </button>
        </div>
      </div>
      
      {/* Imagen - Posicionada debajo del contenido en <1024px (que cubre 890px), a la derecha en pantallas más grandes */}
      <div className="absolute bottom-0 left-1/2 lg:left-auto lg:right-0 -translate-x-1/2 lg:translate-x-0 h-auto lg:h-full flex items-end justify-center lg:justify-end w-full lg:w-auto z-0">
        <img 
          src={ASSETS_CONFIG.banner} 
          alt="Banner" 
          className="h-48 sm:h-56 md:h-52 lg:h-full w-auto object-contain max-h-[260px] sm:max-h-[300px] md:max-h-[280px] lg:max-h-none" 
        />
      </div>
      
      {/* Decoraciones de fondo */}
      <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none z-0">
        <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-4 right-8 w-24 h-24 bg-white/20 rounded-full"></div>
      </div>
    </div>
  );
}; 