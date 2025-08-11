import { 
  CalendarDays, 
  Users, 
  Star, 
  Eye, 
  CheckCircle,
  UserCheck,
  DollarSign
} from 'lucide-react';

interface Postulante {
  id: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  experiencia: number;
  calificacion: number;
  serviciosCompletados: number;
  ubicacion: string;
  disponibilidad: string;
  foto: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fechaPostulacion: string;
  telefono: string;
  email: string;
  precio: number;
}

interface PostulanteCardProps {
  postulante: Postulante;
  onVerPerfil: (id: string) => void;
  onSelectCandidate: (id: string) => void;
  isSelected: boolean;
}

export const PostulanteCard = ({ 
  postulante, 
  onVerPerfil, 
  onSelectCandidate,
  isSelected 
}: PostulanteCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={`${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-200'
        }`}
      />
    ));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-[0_8px_32px_rgba(116,63,198,0.06)] border border-white/30 p-4 hover:shadow-[0_12px_40px_rgba(116,63,198,0.12)] transition-all duration-500 ${
      isSelected ? 'ring-2 ring-purple-300 bg-gradient-to-br from-purple-50/80 to-pink-50/80' : 'hover:border-purple-200/50'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-start space-y-3 lg:space-y-0 lg:space-x-4">
        {/* Foto del postulante más compacta */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-xl overflow-hidden flex items-center justify-center shadow-lg">
              {postulante.foto ? (
                <img
                  src={postulante.foto}
                  alt={`${postulante.nombre} ${postulante.apellido}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {postulante.nombre[0]}{postulante.apellido[0]}
                </span>
              )}
            </div>
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg animate-pulse">
                <CheckCircle size={12} className="text-white" />
              </div>
            )}
            {/* Badge de experiencia más compacto */}
            <div className="absolute -bottom-1 -left-1 bg-gradient-to-r from-orange-400 to-pink-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg shadow-md">
              {postulante.experiencia} años
            </div>
          </div>
        </div>

        {/* Información del postulante más compacta */}
        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {postulante.nombre} {postulante.apellido}
                </h3>
                <p className="text-sm text-purple-600 font-semibold">{postulante.especialidad}</p>
              </div>
              
              {/* Precio en la esquina superior derecha */}
              <div className="bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-blue-100/80 rounded-lg p-2.5 border border-purple-200/30 ml-3 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <DollarSign size={12} className="text-white" />
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-purple-600 block">
                      {formatPrice(postulante.precio)}
                    </span>
                    <span className="text-xs text-gray-600 font-medium">
                      por servicio
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-2">
              <div className="flex items-center space-x-1 bg-blue-50/60 px-2 py-1 rounded-lg">
                <Users size={12} className="text-blue-500" />
                <span className="font-medium">{postulante.serviciosCompletados} servicios</span>
              </div>
            </div>

            {/* Calificación más compacta */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center space-x-1">
                {renderStars(postulante.calificacion)}
              </div>
              <span className="text-sm font-bold text-gray-700">{postulante.calificacion}</span>
              <span className="text-xs text-gray-500 bg-gray-100/60 px-1.5 py-0.5 rounded-lg">({postulante.serviciosCompletados} reseñas)</span>
            </div>
          </div>

          {/* Acciones más compactas */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-xs text-gray-500 bg-gray-100/60 px-2 py-1 rounded-lg">
              Postulado {postulante.fechaPostulacion}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onVerPerfil(postulante.id)}
                className="flex items-center space-x-1.5 px-3 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300 border-2 border-purple-200 hover:border-purple-300 hover:shadow-lg"
              >
                <Eye size={14} />
                <span>Ver Perfil</span>
              </button>
              
              <button
                onClick={() => onSelectCandidate(postulante.id)}
                className={`flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border-2 border-gray-200'
                }`}
              >
                <UserCheck size={14} />
                <span>{isSelected ? 'Seleccionado' : 'Seleccionar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 