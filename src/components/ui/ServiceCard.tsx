import { Calendar, MapPin, User, Trash2 } from 'lucide-react';
import type { Service, Category, ServiceSchedule } from '@/types/database';

interface ServiceCardProps {
  service: Service;
  categories: Category[];
  onViewDetails: (serviceId: string) => void;
  onDelete: (serviceId: string) => void;
}

export const ServiceCard = ({ service, categories, onViewDetails, onDelete }: ServiceCardProps) => {
  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (category?.icon) {
      if (category.icon.startsWith('🔧') || category.icon.startsWith('🧹') || category.icon.startsWith('🎨')) {
        return category.icon;
      }
      switch (category.icon.toLowerCase()) {
        case 'wrench':
        case 'plomeria':
        case 'plumbing':
          return '🔧';
        case 'cleaning':
        case 'limpieza':
          return '🧹';
        case 'design':
        case 'diseño':
          return '🎨';
        case 'development':
        case 'desarrollo':
          return '💻';
        case 'electricity':
        case 'electricidad':
          return '⚡';
        case 'carpentry':
        case 'carpinteria':
          return '🔨';
        default:
          return '📋';
      }
    }
    return '📋';
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
      case 'completado': return 100;
      default: return 25;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'contratando': return 'Contratando';
      case 'eligiendo': return 'Eligiendo';
      case 'contratado': return 'Contratado';
      case 'completado': return 'Completado';
      default: return 'Contratando';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'contratando': return 'text-blue-600 border-blue-400';
      case 'eligiendo': return 'text-orange-600 border-orange-400';
      case 'contratado': return 'text-purple-600 border-purple-400';
      case 'completado': return 'text-green-600 border-green-400';
      default: return 'text-blue-600 border-blue-400';
    }
  };

  return (
    <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-gray-50 to-white relative">
      <button
        onClick={() => onDelete(service.id)}
        disabled={service.status !== 'completado'}
        className={`absolute top-2 right-2 p-1 transition-colors ${
          service.status === 'completado'
            ? 'text-gray-400 hover:text-red-500 cursor-pointer'
            : 'text-gray-200 cursor-not-allowed'
        }`}
        title={service.status === 'completado' ? 'Eliminar servicio' : 'Solo se puede eliminar cuando esté completado'}
      >
        <Trash2 size={16} />
      </button>
      
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center text-2xl">
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
              0 postulantes
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
          <p className={`text-xs font-medium mt-1 border-b-2 pb-1 ${getStatusColor(service.status)}`}>
            {getStatusText(service.status)}
          </p>
        </div>
      </div>
      <button 
        onClick={() => onViewDetails(service.id)}
        className="mt-3 w-full bg-[#743fc6] text-white py-2 rounded-lg hover:bg-[#6a37b8] transition-colors text-sm font-medium"
      >
        Ver Detalles
      </button>
    </div>
  );
}; 