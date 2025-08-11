import { MapPin, Clock, Users, Calendar, X } from 'lucide-react';

interface Servicio {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  fechaPublicacion: string;
  fechaLimite: string;
  estado: 'activo' | 'en_proceso' | 'completado';
  postulantes: number;
  progreso: number;
  etapa: string;
  horariosDisponibilidad: string[];
}

interface ServiceDetailsProps {
  servicio: Servicio;
  getEstadoColor: (estado: string) => string;
  onCancelService?: () => void;
}

export const ServiceDetails = ({ servicio, getEstadoColor, onCancelService }: ServiceDetailsProps) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(116,63,198,0.08)] border border-white/30 p-6 mb-6">
      {/* Header del servicio */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{servicio.titulo}</h2>
            <p className="text-base text-gray-600 leading-relaxed mb-3">{servicio.descripcion}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${getEstadoColor(servicio.estado)}`}>
              {servicio.estado === 'activo' ? 'Activo' : servicio.estado === 'en_proceso' ? 'En Proceso' : 'Completado'}
            </div>
            {onCancelService && servicio.estado === 'activo' && (
              <button
                onClick={onCancelService}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 border-2 border-red-200 hover:border-red-300 hover:shadow-lg"
              >
                <X size={14} />
                <span>Cancelar Servicio</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Información principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 rounded-xl p-3 border border-purple-200/30">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Ubicación</p>
              <p className="text-sm font-semibold text-gray-800">{servicio.ubicacion}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 rounded-xl p-3 border border-blue-200/30">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Postulantes</p>
              <p className="text-sm font-semibold text-gray-800">{servicio.postulantes}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50/80 to-blue-50/80 rounded-xl p-3 border border-green-200/30">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Calendar size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Publicado</p>
              <p className="text-sm font-semibold text-gray-800">{servicio.fechaPublicacion}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50/80 to-pink-50/80 rounded-xl p-3 border border-orange-200/30">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Límite</p>
              <p className="text-sm font-semibold text-gray-800">{servicio.fechaLimite}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progreso y etapa */}
      <div className="bg-gradient-to-r from-purple-100/60 to-pink-100/60 rounded-xl p-4 border border-purple-200/30 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800">Progreso del Servicio</h3>
          <span className="text-base font-semibold text-purple-600">{servicio.progreso}%</span>
        </div>
        <div className="w-full bg-white/60 rounded-xl h-2.5 mb-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-xl transition-all duration-500"
            style={{ width: `${servicio.progreso}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 font-medium">Etapa: {servicio.etapa}</p>
      </div>

      {/* Horarios de disponibilidad */}
      <div className="bg-gradient-to-r from-blue-50/60 to-purple-50/60 rounded-xl p-4 border border-blue-200/30">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Horarios de Disponibilidad</h3>
        <div className="space-y-2">
          {servicio.horariosDisponibilidad.map((horario, index) => (
            <div key={index} className="flex items-center space-x-2 bg-white/60 rounded-lg p-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                <Clock size={12} className="text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">{horario}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 