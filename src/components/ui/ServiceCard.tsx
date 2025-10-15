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

const STATUS: Record<NonNullable<Service['status']>, { pct: number; label: string; cls: string }> = {
  active:      { pct: 25,  label: 'Contratando',  cls: 'text-blue-600 bg-blue-50 border-blue-200' },
  in_progress: { pct: 75,  label: 'En Progreso',  cls: 'text-purple-600 bg-purple-50 border-purple-200' },
  completed:   { pct: 100, label: 'Completado',   cls: 'text-green-600 bg-green-50 border-green-200' },
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
    const d = new Date(s.date_available);
    const dd = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    return `${dd} ${s.start_time}-${s.end_time}`;
  }).join(', ');
}

const ServiceCard = memo(function ServiceCard({
  service,
  categories,
  hasReviewed = false,
  onViewDetails,
  onDelete,
  onLeaveReview,
}: Props) {

  const categoryName = service.category?.name?.toLowerCase() || 'otros';

  const categoryColor = useMemo(() => {
    const c = categories.find(cat => cat.name.toLowerCase() === categoryName);
    return c?.color || '#743fc6';
  }, [categories, categoryName]);

  const icon = NAME_ICON[categoryName] ?? <Wrench size={18} className="text-white" />;

  const statusInfo = STATUS[service.status ?? 'active'];

  const scheduleText = formatSchedules(service.schedules) ?? formatRelative(service.created_at);

  const canDelete = service.status === 'active' || service.status === 'completed';

  const pct = statusInfo.pct; // 0–100 for the ring

  return (
    <div
      role="article"
      className={`bg-white border rounded-2xl transition-all duration-200 relative overflow-hidden ${
        service.status === 'in_progress' ? 'border-purple-200 shadow-sm shadow-purple-100' : 'border-gray-200'
      }`}
    >
      {service.status === 'in_progress' && <div className="h-0.5 bg-gradient-to-r from-purple-500 to-purple-600" />}


      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
             <div
               className="w-9 h-9 rounded-xl grid place-items-center bg-gradient-to-br from-purple-500 to-purple-600"
               aria-hidden
             >
               {icon}
             </div>
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
              >
                {service.category?.name || 'Sin categoría'}
              </span>
              {/* Delete button */}
              <button
                onClick={() => canDelete && onDelete(service.id)}
                disabled={!canDelete}
                aria-label="Eliminar servicio"
                title={
                  service.status === 'active' ? 'Eliminar servicio (contratando)' :
                  service.status === 'completed' ? 'Eliminar servicio completado' :
                  'No se puede eliminar en progreso'
                }
                className={`p-1 rounded-full ${
                  canDelete ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-200 cursor-not-allowed'
                }`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

           {/* Completion ring */}
           <div className="relative w-16 h-16 shrink-0" aria-label={`Completado ${pct}%`} title={`Completado ${pct}%`}>
             <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
               <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#E5E7EB" strokeWidth="3" />
               <circle
                 cx="18" cy="18" r="15.9155" fill="none"
                 stroke="#6A31FF" strokeWidth="3" strokeLinecap="round"
                 strokeDasharray={`${pct}, 100`}
               />
             </svg>
             <div className="absolute inset-0 grid place-items-center">
               <span className="text-xs font-bold text-purple-700">{pct}%</span>
             </div>
           </div>
        </div>

        {/* Title */}
        <div className="mt-2 mb-2.5">
          <h4 className="font-bold text-gray-900 text-base leading-tight truncate">{service.title}</h4>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span className="truncate">{scheduleText}</span>
          </div>
          {service.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              <span className="truncate">{service.location}</span>
            </div>
          )}
        </div>

         {/* Status + PIN */}
         <div className="mb-3">
           <div className="flex items-center justify-between">
             <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusInfo.cls}`}>
               {statusInfo.label}
             </span>
           </div>

           {service.status === 'in_progress' && service.completion_pin && (
             <div className="mt-2 flex items-center gap-2">
               <div className="flex gap-1.5">
                 {service.completion_pin.split('').map((d, i) => (
                   <div
                     key={i}
                     className="w-8 h-9 bg-white border border-purple-300 rounded-md grid place-items-center"
                   >
                     <span className="text-sm font-bold text-purple-800">{d}</span>
                   </div>
                 ))}
               </div>
               <div className="flex items-center gap-1">
                 <Key size={12} className="text-purple-600" />
                 <span className="text-xs font-semibold text-purple-800">PIN</span>
               </div>
             </div>
           )}
           
         </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onViewDetails(service.id); }}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            aria-label="Ver detalles del servicio"
          >
            Ver Detalles
          </button>

          {service.status === 'completed' && onLeaveReview && !hasReviewed && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLeaveReview(service); }}
              className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white py-3 rounded-xl hover:from-emerald-500 hover:to-teal-600 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              aria-label="Dejar reseña del servicio"
            >
              <Star size={16} />
              Reseñar
            </button>
          )}
          
          {service.status === 'completed' && hasReviewed && (
            <div className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
              <Star size={16} className="text-yellow-500" />
              Reseña Enviada
            </div>
          )}
        </div>
      </div>

    </div>
  );
});

export { ServiceCard };
