import { Calendar, MapPin, User, Trash2, Wrench, Sparkles, Palette, Code, Zap, Hammer, Heart, Plus, Monitor, Leaf, Package, Star, Key } from 'lucide-react';
import type { Service, Category, ServiceSchedule } from '@/types/database';
import { PinDisplay } from './PinDisplay';

interface ServiceCardProps {
  service: Service;
  categories: Category[];
  applicationsCount?: number;
  onViewDetails: (serviceId: string) => void;
  onDelete: (serviceId: string) => void;
  onLeaveReview?: (service: Service) => void;
}

export const ServiceCard = ({ service, categories, applicationsCount = 0, onViewDetails, onDelete, onLeaveReview }: ServiceCardProps) => {
  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    
    // Si no encontramos la categoría, usar icono por defecto
    if (!category) {
      return <Wrench size={20} className="text-white" />;
    }

    // Mapear por nombre de categoría (más confiable que el campo icon)
    switch (categoryName.toLowerCase()) {
      case 'plomería':
        return <Wrench size={20} className="text-white" />;
      case 'limpieza':
        return <Sparkles size={20} className="text-white" />;
      case 'diseño':
        return <Palette size={20} className="text-white" />;
      case 'tecnología':
        return <Monitor size={20} className="text-white" />;
      case 'electricidad':
        return <Zap size={20} className="text-white" />;
      case 'carpintería':
        return <Hammer size={20} className="text-white" />;
      case 'mascotas':
        return <Heart size={20} className="text-white" />;
      case 'pintura':
        return <Palette size={20} className="text-white" />;
      case 'jardinería':
        return <Leaf size={20} className="text-white" />;
      case 'organización':
        return <Package size={20} className="text-white" />;
      case 'otros':
        return <Plus size={20} className="text-white" />;
      default:
        // Si el campo icon contiene un nombre de icono de Lucide, usarlo
        if (category.icon && !category.icon.match(/[\u{1F300}-\u{1F9FF}]/u)) {
          switch (category.icon.toLowerCase()) {
            case 'hammer':
              return <Hammer size={20} className="text-white" />;
            case 'heart':
              return <Heart size={20} className="text-white" />;
            case 'plus':
              return <Plus size={20} className="text-white" />;
            case 'palette':
              return <Palette size={20} className="text-white" />;
            case 'computer':
              return <Monitor size={20} className="text-white" />;
            default:
              return <Wrench size={20} className="text-white" />;
          }
        }
        return <Wrench size={20} className="text-white" />;
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || '#743fc6';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-CO', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatScheduleDisplay = (schedules: ServiceSchedule[]) => {
    if (!schedules || schedules.length === 0) return 'Sin horarios';
    
    const sortedSchedules = [...schedules].sort((a, b) => 
      new Date(a.date_available).getTime() - new Date(b.date_available).getTime()
    );
    
    return sortedSchedules.slice(0, 2).map(schedule => {
      const date = new Date(schedule.date_available);
      const formattedDate = date.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short'
      });
      return `${formattedDate} ${schedule.start_time}-${schedule.end_time}`;
    }).join(', ');
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'contratando': return 25;
      case 'eligiendo': return 50;
      case 'contratado': return 75;
      case 'in_progress': return 85;
      case 'completed': return 100;
      default: return 25;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'contratando': return 'Contratando';
      case 'eligiendo': return 'Eligiendo';
      case 'contratado': return 'Contratado';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      default: return 'Contratando';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'contratando': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'eligiendo': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'contratado': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'in_progress': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-gray-50 to-white relative">
      <button
        onClick={() => onDelete(service.id)}
        disabled={service.status !== 'completed'}
        className={`absolute top-2 right-2 p-1 transition-colors ${
          service.status === 'completed'
            ? 'text-gray-400 hover:text-red-500 cursor-pointer'
            : 'text-gray-200 cursor-not-allowed'
        }`}
        title={service.status === 'completed' ? 'Eliminar servicio' : 'Solo se puede eliminar cuando esté completado'}
      >
        <Trash2 size={16} />
      </button>
      
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#743fc6] to-[#8a5fd1] rounded-xl flex items-center justify-center">
            {getCategoryIcon(service.category?.name || 'Otros')}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${getCategoryColor(service.category?.name || 'Otros')}20`,
                  color: getCategoryColor(service.category?.name || 'Otros')
                }}
              >
                {service.category?.name || 'Sin categoría'}
              </span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">{service.title}</h4>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{formatDate(service.created_at)}</span>
              </div>
              {service.location && (
                <div className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span>{service.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-right pr-6">
          <div className="flex items-center space-x-1 mb-2">
            <User size={14} className="text-[#743fc6]" />
            <span className="text-sm font-medium text-gray-700">
              {applicationsCount} postulante{applicationsCount !== 1 ? 's' : ''}
            </span>
          </div>
          
          {service.schedules && service.schedules.length > 0 && (
            <div className="text-xs text-gray-600 mb-2">
              {formatScheduleDisplay(service.schedules)}
            </div>
          )}
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#743fc6]"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${getProgressPercentage(service.status)}, 100`}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">
                {getProgressPercentage(service.status)}%
              </span>
            </div>
          </div>
          <div className="text-center mt-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(service.status)}`}>
              {getStatusText(service.status)}
            </span>
          </div>
          
          {/* Mostrar PIN cuando el servicio esté en progreso */}
          {service.status === 'in_progress' && service.completion_pin && (
            <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 shadow-sm">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <Key size={16} className="text-indigo-600" />
                  </div>
                  <span className="text-sm font-semibold text-indigo-800">PIN de Finalización</span>
                </div>
                
                <div className="mb-3">
                  <PinDisplay pin={service.completion_pin} />
                </div>
                
                <p className="text-xs text-indigo-600 leading-relaxed max-w-xs mx-auto">
                  Comparte este PIN con el trabajador para finalizar el servicio
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex space-x-3">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (service?.id) {
              onViewDetails(service.id);
            } else {
              alert('Error: El servicio no tiene ID');
            }
          }}
          className="flex-1 bg-[#743fc6] text-white py-2.5 rounded-lg hover:bg-[#6a37b8] transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
        >
          Ver Detalles
        </button>
        
        {service.status === 'completed' && onLeaveReview && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLeaveReview(service);
            }}
            className="px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 flex items-center space-x-1"
          >
            <Star size={16} />
            <span className="text-sm font-medium">Reseñar</span>
          </button>
        )}
      </div>
    </div>
  );
}; 