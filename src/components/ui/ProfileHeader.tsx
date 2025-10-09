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
    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Foto de perfil */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-full flex items-center justify-center text-2xl text-white font-bold">
              {usuario.foto ? (
                <img
                  src={usuario.foto}
                  alt={`${usuario.nombre} ${usuario.apellido}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                `${usuario.nombre?.[0] || ''}${usuario.apellido?.[0] || ''}`
              )}
            </div>
          </div>

          {/* Información básica */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              {usuario.nombre} {usuario.apellido}
            </h1>
            
            {/* Calificación */}
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center space-x-1">
                {renderStars(usuario.calificacion)}
              </div>
              <span className="text-sm font-medium text-gray-700">{usuario.calificacion.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({usuario.serviciosCompletados} servicios)</span>
            </div>

            {/* Mensaje creativo de tiempo de cuenta */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/40 rounded-full w-fit">
              <Sparkles size={14} className="text-purple-500" />
              <span className="text-xs font-medium text-purple-700">
                {getCreativeMessage()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-[#743fc6]/10 to-[#8a5fd1]/10 rounded-xl p-4 border border-[#743fc6]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#743fc6] rounded-lg flex items-center justify-center">
              <Award size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Servicios Completados</p>
              <p className="text-xl font-bold text-gray-800">{usuario.serviciosCompletados}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#fbbc6c]/10 to-[#f9b055]/10 rounded-xl p-4 border border-[#fbbc6c]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#fbbc6c] rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Servicios Activos</p>
              <p className="text-xl font-bold text-gray-800">{usuario.serviciosActivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Balance</p>
              <p className="text-xl font-bold text-gray-800">{formatPrice(usuario.balance)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 