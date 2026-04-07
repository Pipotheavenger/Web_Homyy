import Image from 'next/image';
import {
  CalendarDays,
  Users,
  Star,
  Eye,
  CheckCircle,
  UserCheck,
  UserMinus,
  DollarSign,
  Clock,
  MessageSquare
} from 'lucide-react';
import { useCommission } from '@/hooks/useCommission';

interface Postulante {
  id: string;
  workerId: string; // ID del trabajador (user_id)
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
  coverLetter?: string;
  estimatedDuration?: string;
}

interface PostulanteCardProps {
  postulante: Postulante;
  onVerPerfil: (id: string) => void;
  onSelectCandidate: (id: string) => void;
  onRejectCandidate: (id: string) => void;
  isSelected: boolean;
}

export const PostulanteCard = ({
  postulante,
  onVerPerfil,
  onSelectCandidate,
  onRejectCandidate,
  isSelected
}: PostulanteCardProps) => {
  const { calculateInflatedPrice, formatPrice: formatPriceWithCommission } = useCommission();

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
    const inflatedPrice = calculateInflatedPrice(price);
    return formatPriceWithCommission(inflatedPrice);
  };

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-[0_8px_32px_rgba(116,63,198,0.06)] border border-white/30 p-6 hover:shadow-[0_12px_40px_rgba(116,63,198,0.12)] transition-all duration-500 ${
      isSelected ? 'ring-2 ring-emerald-300 bg-gradient-to-br from-emerald-50/80 to-green-50/80' : 'hover:border-emerald-200/50'
    }`}>
      
      {/* Header con foto, info básica y precio */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Foto del postulante */}
          <div className="relative">
            <div className="relative w-16 h-16 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-xl overflow-hidden flex items-center justify-center shadow-lg">
              {postulante.foto ? (
                <Image
                  src={postulante.foto}
                  alt={`${postulante.nombre} ${postulante.apellido}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {postulante.nombre[0]}{postulante.apellido[0]}
                </span>
              )}
            </div>
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center shadow-lg animate-pulse">
                <CheckCircle size={12} className="text-white" />
              </div>
            )}
            {/* Badge de experiencia */}
            <div className="absolute -bottom-1 -left-1 bg-gradient-to-r from-orange-400 to-pink-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg shadow-md">
              {postulante.experiencia} años
            </div>
          </div>

          {/* Información básica */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              {postulante.nombre} {postulante.apellido}
            </h3>
            <p className="text-sm text-purple-600 font-semibold mb-2">{postulante.especialidad}</p>
            
            {/* Calificación */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(postulante.calificacion)}
              </div>
              <span className="text-sm font-bold text-gray-700">{postulante.calificacion}</span>
              <span className="text-xs text-gray-500 bg-gray-100/60 px-2 py-1 rounded-lg">
                {postulante.serviciosCompletados} servicios
              </span>
            </div>
          </div>
        </div>

        {/* Precio */}
        <div className="text-right">
          <div className="bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-blue-100/80 rounded-lg p-3 border border-purple-200/30">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign size={16} className="text-purple-600" />
              <span className="text-lg font-bold text-purple-600">
                {formatPrice(postulante.precio)}
              </span>
            </div>
            <span className="text-xs text-gray-600 font-medium">por servicio</span>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-4">
        {postulante.estimatedDuration && (
          <div className="flex items-center space-x-1 bg-orange-50/60 px-3 py-1.5 rounded-lg">
            <Clock size={14} className="text-orange-500" />
            <span className="font-medium">{postulante.estimatedDuration}</span>
          </div>
        )}
        <div className="flex items-center space-x-1 bg-blue-50/60 px-3 py-1.5 rounded-lg">
          <Users size={14} className="text-blue-500" />
          <span className="font-medium">{postulante.serviciosCompletados} servicios completados</span>
        </div>
        <div className="flex items-center space-x-1 bg-gray-50/60 px-3 py-1.5 rounded-lg">
          <span className="text-gray-500">Postulado {postulante.fechaPostulacion}</span>
        </div>
      </div>

      {/* Cover Letter */}
      {postulante.coverLetter && (
        <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 rounded-xl p-4 mb-4 border border-purple-200/30">
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare size={16} className="text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">Mensaje del profesional</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {postulante.coverLetter}
          </p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {isSelected && (
            <span className="inline-flex items-center space-x-1 text-emerald-600 font-medium">
              <CheckCircle size={14} />
              <span>Profesional seleccionado</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isSelected && (
            <button
              onClick={() => onRejectCandidate(postulante.id)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 border border-red-200 hover:border-red-300 hover:shadow-md"
            >
              <UserMinus size={16} />
              <span>Rechazar</span>
            </button>
          )}
          <button
            onClick={() => onVerPerfil(postulante.workerId)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300 border border-purple-200 hover:border-purple-300 hover:shadow-md"
          >
            <Eye size={16} />
            <span>Ver Perfil</span>
          </button>

           <button
             onClick={() => onSelectCandidate(postulante.id)}
             className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 ${
               isSelected
                 ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-black shadow-lg hover:shadow-xl shadow-emerald-500/25'
                 : 'bg-gradient-to-r from-emerald-400 to-green-400 text-black hover:from-emerald-500 hover:to-green-500 hover:text-black shadow-lg hover:shadow-xl shadow-emerald-400/25'
             }`}
           >
            <UserCheck size={16} />
            <span>{isSelected ? 'Seleccionado' : 'Seleccionar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 