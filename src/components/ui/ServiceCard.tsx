// ServiceCardCompact.tsx
import React, { memo, useMemo } from 'react';
import { Calendar, MapPin, Trash2, Wrench, Sparkles, Palette, Monitor, Zap, Hammer, Heart, Plus, Leaf, Package, Star, Key } from 'lucide-react';
import type { Service, Category, ServiceSchedule } from '@/types/database';

type Props = {
  service: Service;
  categories: Category[];
  hasReviewed?: boolean;
  onViewDetails: (serviceId: string) => void;
  onDelete: (serviceId: string) => void;
  onLeaveReview?: (service: Service) => void;
};

const NAME_ICON: Record<string, React.ReactElement> = {
  'plomería': <Wrench size={18} className="text-white" />,
  'limpieza': <Sparkles size={18} className="text-white" />,
  'diseño': <Palette size={18} className="text-white" />,
  'tecnología': <Monitor size={18} className="text-white" />,
  'electricidad': <Zap size={18} className="text-white" />,
  'carpintería': <Hammer size={18} className="text-white" />,
  'mascotas': <Heart size={18} className="text-white" />,
  'pintura': <Palette size={18} className="text-white" />,
  'jardinería': <Leaf size={18} className="text-white" />,
  'organización': <Package size={18} className="text-white" />,
  'otros': <Plus size={18} className="text-white" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  'plomería': 'from-blue-500 to-blue-600',
  'limpieza': 'from-emerald-500 to-emerald-600',
  'diseño': 'from-purple-500 to-purple-600',
  'tecnología': 'from-indigo-500 to-indigo-600',
  'electricidad': 'from-yellow-500 to-orange-500',
  'carpintería': 'from-amber-500 to-amber-600',
  'mascotas': 'from-pink-500 to-pink-600',
  'pintura': 'from-rose-500 to-rose-600',
  'jardinería': 'from-green-500 to-green-600',
  'organización': 'from-slate-500 to-slate-600',
  'otros': 'from-gray-500 to-gray-600',
};

const STATUS: Record<NonNullable<Service['status']>, { pct: number; label: string; cls: string }> = {
  active:      { pct: 25,  label: 'Contratando',  cls: 'text-blue-600 bg-blue-50 border-blue-200' },
  in_progress: { pct: 75,  label: 'En Progreso',  cls: 'text-purple-600 bg-purple-50 border-purple-200' },
  completed:   { pct: 100, label: 'Completado',   cls: 'text-green-600 bg-green-50 border-green-200' },
  hired:       { pct: 50,  label: 'Contratado',   cls: 'text-orange-600 bg-orange-50 border-orange-200' },
};

function formatRelative(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const ms = Math.abs(now.getTime() - date.getTime());
  const days = Math.floor(ms / 86400000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

function formatSchedules(schedules: ServiceSchedule[] | undefined) {
  if (!schedules?.length) return null;
  
  const sorted = [...schedules].sort((a, b) =>
    new Date(a.date_available).getTime() - new Date(b.date_available).getTime()
  );
  
  return sorted.slice(0, 2).map(s => {
    const date = new Date(s.date_available);
    const startTime = (s as any).start_time;
    const endTime = (s as any).end_time;
    
    let timeText = 'Todo el día';
    if (startTime && endTime) {
      // Convertir formato 24h a 12h
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(endTime.split(':')[0]);
      const startPeriod = startHour >= 12 ? 'PM' : 'AM';
      const endPeriod = endHour >= 12 ? 'PM' : 'AM';
      const startHour12 = startHour > 12 ? startHour - 12 : (startHour === 0 ? 12 : startHour);
      const endHour12 = endHour > 12 ? endHour - 12 : (endHour === 0 ? 12 : endHour);
      
      timeText = `${startHour12}:00 ${startPeriod} - ${endHour12}:00 ${endPeriod}`;
    } else if (startTime) {
      const hour = parseInt(startTime.split(':')[0]);
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      timeText = `Desde ${hour12}:00 ${period}`;
    }
    
    return `${date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} ${timeText}`;
  }).join(', ');
}

// Componente de progreso circular
const CircularProgress = ({ percentage, size = 60 }: { percentage: number; size?: number }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Fondo del círculo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgb(229, 231, 235)"
          strokeWidth="6"
          fill="transparent"
        />
        {/* Progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" />
            <stop offset="100%" stopColor="rgb(147, 51, 234)" />
          </linearGradient>
        </defs>
      </svg>
      {/* Porcentaje en el centro */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-700">{percentage}%</span>
      </div>
    </div>
  );
};

const ServiceCard = memo(({ service, categories, hasReviewed, onViewDetails, onDelete, onLeaveReview }: Props) => {
  const category = categories.find(c => c.id === service.category_id);
  const categoryName = category?.name?.toLowerCase() || 'otros';
  const icon = NAME_ICON[categoryName] || NAME_ICON['otros'];
  const categoryColor = CATEGORY_COLORS[categoryName] || CATEGORY_COLORS['otros'];
  const statusInfo = STATUS[service.status] || { pct: 0, label: 'Desconocido', cls: 'text-gray-600 bg-gray-50 border-gray-200' };

  // Debug log para ver los datos del servicio
  if (service.status === 'hired') {
    console.log('🔍 Servicio contratado:', {
      id: service.id,
      status: service.status,
      completion_pin: (service as any).completion_pin,
      escrow_pin: (service as any).escrow_pin,
      service: service
    });
  }




  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      onDelete(service.id);
    }
  };

  const handleLeaveReview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLeaveReview?.(service);
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 cursor-pointer group w-full max-w-full overflow-hidden"
      onClick={() => onViewDetails(service.id)}
    >
      {/* Header con categoría, título y botón de eliminar */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1">
          {/* Icono de categoría con background colorido */}
          <div className={`w-12 h-12 bg-gradient-to-br ${categoryColor} rounded-xl flex items-center justify-center shadow-md`}>
            {icon}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-base md:text-lg group-hover:text-blue-600 transition-colors break-words">
                {service.title}
              </h3>
              <button
                onClick={handleDelete}
                className="w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={12} className="text-red-500" />
              </button>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${categoryColor}`}>
              {category?.name || 'Sin categoría'}
            </div>
          </div>
        </div>
        
        {/* Progreso circular */}
        <div className="flex-shrink-0">
          <CircularProgress percentage={statusInfo.pct} size={60} />
        </div>
      </div>

      {/* Estado */}
      <div className="mb-4">
        {(service.status === 'in_progress' || service.status === 'hired') ? (
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              service.status === 'in_progress' ? 'bg-purple-600' : 'bg-orange-600'
            }`} />
            <span className={`text-xs font-medium ${
              service.status === 'in_progress' ? 'text-purple-600' : 'text-orange-600'
            }`}>
              {service.status === 'in_progress' ? 'En Progreso' : 'Contratado'}
            </span>
            {service.status === 'hired' && (
              <>
                {console.log('🎯 Verificando PIN para servicio contratado:', {
                  id: service.id,
                  title: service.title,
                  completion_pin: (service as any).completion_pin,
                  escrow_pin: (service as any).escrow_pin,
                  hasPin: !!(service as any).completion_pin || !!(service as any).escrow_pin
                })}
                {((service as any).completion_pin || (service as any).escrow_pin) ? (
                  <div className="bg-orange-100 border border-orange-200 rounded-lg px-2 py-1">
                    <span className="text-xs font-mono font-bold text-orange-700">
                      PIN: {(service as any).completion_pin || (service as any).escrow_pin}
                    </span>
                  </div>
                ) : (
                  <div className="bg-red-100 border border-red-200 rounded-lg px-2 py-1">
                    <span className="text-xs font-mono font-bold text-red-700">
                      SIN PIN
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.cls}`}>
            {statusInfo.label}
          </span>
        )}
      </div>

      {/* Descripción */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {service.description}
      </p>

      {/* Información adicional */}
      <div className="space-y-2 mb-4">
        {/* Ubicación */}
        {service.location && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <MapPin size={14} />
            <span>{service.location}</span>
          </div>
        )}

        {/* Horarios disponibles */}
        {service.schedules && service.schedules.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar size={14} />
            <span>{formatSchedules(service.schedules)}</span>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(service.id);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
          >
            Ver Detalles
          </button>
          
          {/* Botón de reseña para servicios completados */}
          {service.status === 'completed' && !hasReviewed && onLeaveReview && (
            <button
              onClick={handleLeaveReview}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm flex items-center space-x-1"
            >
              <Star size={14} />
              <span>Reseñar</span>
            </button>
          )}
        </div>

        {/* Fecha de creación */}
        <div className="text-xs text-gray-400">
          {formatRelative(service.created_at)}
        </div>
      </div>
    </div>
  );
});

ServiceCard.displayName = 'ServiceCard';

export default ServiceCard;