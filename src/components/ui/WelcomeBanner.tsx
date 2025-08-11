import { Plus } from 'lucide-react';

interface WelcomeBannerProps {
  userName: string;
  onCreateService: () => void;
}

export const WelcomeBanner = ({ userName, onCreateService }: WelcomeBannerProps) => {
  return (
    <div className="bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-2xl mb-6 text-white relative overflow-hidden h-48 md:h-56 lg:h-64">
      <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8 lg:p-10 h-full relative z-10">
        <div className="flex-1 mb-6 md:mb-0">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">¡Hola, {userName}!</h2>
          <p className="text-purple-100 mb-4 text-sm md:text-base lg:text-lg">Buscas servicios para tu hogar?</p>
          <button 
            onClick={onCreateService}
            className="bg-[#fbbc6c] text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium hover:bg-[#f9b055] transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 text-sm md:text-base"
          >
            <Plus size={18} className="md:w-5 md:h-5" />
            <span>Crear Nuevo Servicio</span>
          </button>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 h-full flex items-end">
        <img 
          src="/Banner.png" 
          alt="Banner" 
          className="h-full w-auto object-contain" 
        />
      </div>
      <div className="absolute top-0 right-0 w-full h-full opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-4 right-8 w-24 h-24 bg-white/20 rounded-full"></div>
      </div>
    </div>
  );
}; 