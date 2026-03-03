import Image from 'next/image';
import { Camera, Award, Clock, DollarSign, Star, Sparkles } from 'lucide-react';

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ubicacion: string;
  fechaRegistro: string;
  foto: string;
  calificacion: number;
  serviciosCompletados: number;
  serviciosActivos: number;
  balance: number;
  preferencias: {
    notificaciones: boolean;
    emailMarketing: boolean;
    privacidad: boolean;
  };
}

interface ProfileHeaderProps {
  usuario: Usuario;
  formatPrice: (price: number) => string;
  createdAt?: string;
}

export const ProfileHeader = ({ 
  usuario, 
  formatPrice,
  createdAt
}: ProfileHeaderProps) => {
  const getDaysActive = () => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getCreativeMessage = () => {
    const days = getDaysActive();
    if (days === 0) return '¡Bienvenido! Comienza tu aventura hoy 🎉';
    if (days < 7) return `${days} ${days === 1 ? 'día' : 'días'} de aventura juntos 🌟`;
    if (days < 30) return `${Math.floor(days / 7)} ${Math.floor(days / 7) === 1 ? 'semana' : 'semanas'} construyendo confianza ✨`;
    if (days < 365) return `${Math.floor(days / 30)} ${Math.floor(days / 30) === 1 ? 'mes' : 'meses'} de experiencia compartida 🚀`;
    const years = Math.floor(days / 365);
    return `${years} ${years === 1 ? 'año' : 'años'} de trayectoria profesional 🏆`;
  };
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4 lg:p-6 mb-4 lg:mb-6 w-full max-w-full overflow-hidden">
      {/* Layout vertical para pantallas <830px, horizontal para pantallas más grandes */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 lg:mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4 w-full lg:w-auto mb-4 lg:mb-0">
          {/* Foto de perfil */}
          <div className="relative flex-shrink-0 self-center lg:self-auto">
            <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-full flex items-center justify-center text-xl lg:text-2xl text-white font-bold">
              {usuario.foto ? (
                <Image
                  src={usuario.foto}
                  alt={`${usuario.nombre} ${usuario.apellido}`}
                  fill
                  sizes="96px"
                  className="rounded-full object-cover"
                />
              ) : (
                `${usuario.nombre?.[0] || ''}${usuario.apellido?.[0] || ''}`
              )}
            </div>
          </div>

          {/* Información básica */}
          <div className="text-center lg:text-left flex-1 min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-1 break-words">
              {usuario.nombre} {usuario.apellido}
            </h1>
            
            {/* Calificación */}
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2 flex-wrap gap-1">
              <div className="flex items-center space-x-1">
                {renderStars(usuario.calificacion)}
              </div>
              <span className="text-xs lg:text-sm font-medium text-gray-700">{usuario.calificacion.toFixed(1)}</span>
              <span className="text-xs lg:text-sm text-gray-500 break-words">({usuario.serviciosCompletados} servicios)</span>
            </div>

            {/* Mensaje creativo de tiempo de cuenta */}
            <div className="flex items-center justify-center lg:justify-start space-x-2 px-2 lg:px-3 py-1 lg:py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/40 rounded-full w-full lg:w-fit">
              <Sparkles size={12} className="lg:w-3.5 lg:h-3.5 text-purple-500 flex-shrink-0" />
              <span className="text-xs font-medium text-purple-700 break-words text-center lg:text-left">
                {getCreativeMessage()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        <div className="bg-gradient-to-r from-[#743fc6]/10 to-[#8a5fd1]/10 rounded-xl p-3 lg:p-4 border border-[#743fc6]/20 w-full max-w-full overflow-hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#743fc6] rounded-lg flex items-center justify-center flex-shrink-0">
              <Award size={18} className="lg:w-5 lg:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm text-gray-600 break-words">Servicios Completados</p>
              <p className="text-lg lg:text-xl font-bold text-gray-800 break-words">{usuario.serviciosCompletados}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#fbbc6c]/10 to-[#f9b055]/10 rounded-xl p-3 lg:p-4 border border-[#fbbc6c]/20 w-full max-w-full overflow-hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#fbbc6c] rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="lg:w-5 lg:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm text-gray-600 break-words">Servicios Activos</p>
              <p className="text-lg lg:text-xl font-bold text-gray-800 break-words">{usuario.serviciosActivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-xl p-3 lg:p-4 border border-green-500/20 w-full max-w-full overflow-hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign size={18} className="lg:w-5 lg:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm text-gray-600 break-words">Balance</p>
              <p className="text-lg lg:text-xl font-bold text-gray-800 break-words">{formatPrice(usuario.balance)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 