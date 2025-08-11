import { Star, MapPin, Clock, ChevronRight } from 'lucide-react';
import VerPerfilButton from '@/components/VerPerfilButton';

interface Profesional {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  calificacion: number;
  ubicacion: string;
  experiencia: number;
  serviciosCompletados: number;
  avatar: string;
  disponible: boolean;
}

interface ProfessionalCardProps {
  profesional: Profesional;
}

export const ProfessionalCard = ({ profesional }: ProfessionalCardProps) => {
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
              : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all duration-200">
      {/* Header del profesional */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-[#743fc6] to-[#8a5fd1] rounded-full flex items-center justify-center text-2xl">
            {profesional.avatar}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {profesional.nombre} {profesional.apellido}
            </h3>
            <p className="text-sm text-gray-600">{profesional.especialidad}</p>
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          profesional.disponible 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {profesional.disponible ? 'Disponible' : 'Ocupado'}
        </div>
      </div>

      {/* Información del profesional */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin size={14} />
          <span>{profesional.ubicacion}</span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{profesional.experiencia} años</span>
          </div>
          <div className="flex items-center space-x-1">
            <ChevronRight size={14} />
            <span>{profesional.serviciosCompletados} servicios</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {renderStars(profesional.calificacion)}
          </div>
          <span className="text-sm font-medium text-gray-700">{profesional.calificacion}</span>
        </div>
      </div>

      {/* Botón Ver Perfil */}
      <VerPerfilButton profesionalId={profesional.id.toString()} />
    </div>
  );
}; 