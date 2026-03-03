import { useQuery, useQueryClient } from '@tanstack/react-query';
import { serviceService, statsService, categoryService, workerService } from '@/lib/services';
import type { Service, Category } from '@/types/database';
import { useAuth } from '../useAuth';

// Query keys para organización
export const dashboardKeys = {
  all: ['dashboard'] as const,
  services: (userId: string) => [...dashboardKeys.all, 'services', userId] as const,
  stats: (userId: string, userType: string) => [...dashboardKeys.all, 'stats', userId, userType] as const,
  categories: () => [...dashboardKeys.all, 'categories'] as const,
  topWorkers: () => [...dashboardKeys.all, 'topWorkers'] as const,
  reviewedServices: (userId: string) => [...dashboardKeys.all, 'reviewedServices', userId] as const,
};

/**
 * Query para obtener servicios del usuario
 * Siempre refresca datos frescos desde la base de datos
 */
export function useUserServices(userId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: dashboardKeys.services(userId || ''),
    queryFn: async () => {
      if (!userId) return null;
      
      // Cargar siempre desde Supabase (sin caché manual)
      const response = await serviceService.getUserServices({
        includeCategories: false,
        includeEscrow: false,
        userId,
      });
      if (!response.success) throw new Error(response.error || 'Error al cargar servicios');
      
      return response.data || [];
    },
    enabled: enabled && !!userId,
    staleTime: 30 * 1000, // 30s - servicios cambian moderadamente
    gcTime: 2 * 60 * 1000,
  });
}

/**
 * Query para obtener estadísticas del dashboard
 * Optimizado: calcula stats localmente cuando es posible
 */
export function useDashboardStats(
  userId: string | undefined,
  userType: 'client' | 'worker' | 'admin' | null,
  services: Service[] | undefined,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: dashboardKeys.stats(userId || '', userType || ''),
    queryFn: async () => {
      if (!userId) return null;
      
      // Para clientes, calcular stats localmente (más rápido)
      if (userType === 'client' && services) {
        const totalServices = services.length;
        const activeCount = services.filter(s => s.status === 'active').length;
        const completedCount = services.filter(s => s.status === 'completed').length;
        return {
          total_services: totalServices,
          active_services: activeCount,
          completed_services: completedCount,
          recent_services: services.slice(0, 5),
          recent_bookings: [],
        };
      }
      
      // Para workers, usar el servicio
      if (userType === 'worker') {
        const response = await statsService.getDashboardStats({
          userTypeOverride: 'worker',
          userId,
        });
        if (!response.success) throw new Error(response.error || 'Error al cargar estadísticas');
        return response.data;
      }
      
      return null;
    },
    enabled: enabled && !!userId && !!userType,
    staleTime: 60 * 1000, // 1 min - stats calculados localmente
    gcTime: 2 * 60 * 1000,
  });
}

/**
 * Query para obtener categorías
 */
export function useCategories(enabled: boolean = true) {
  return useQuery({
    queryKey: dashboardKeys.categories(),
    queryFn: async () => {
      const response = await categoryService.getAll();
      if (!response.success) throw new Error(response.error || 'Error al cargar categorías');
      return response.data || [];
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 min - categorias casi nunca cambian
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * Query para obtener top workers
 */
export function useTopWorkers(enabled: boolean = true) {
  return useQuery({
    queryKey: dashboardKeys.topWorkers(),
    queryFn: async () => {
      const response = await workerService.getAll({ is_available: true, limit: 5 });
      if (!response.success) throw new Error(response.error || 'Error al cargar profesionales');
      return Array.isArray(response.data) ? response.data.slice(0, 5) : [];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 min - top workers cambian lento
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Query para verificar servicios revisados
 * Optimizado: carga solo cuando es necesario, en segundo plano
 */
export function useReviewedServices(
  userId: string | undefined,
  serviceIds: string[],
  enabled: boolean = true
) {
  return useQuery({
    queryKey: dashboardKeys.reviewedServices(userId || ''),
    queryFn: async () => {
      if (!userId || serviceIds.length === 0) return {};
      
      const { supabase } = await import('@/lib/supabase');
      
      // Solo verificar servicios completados
      const completedServiceIds = serviceIds.slice(0, 10); // Limitar a 10
      
      if (completedServiceIds.length === 0) return {};
      
      // Cargar aplicaciones y reviews en paralelo
      const [applicationsResult, reviewsResult] = await Promise.allSettled([
        supabase
          .from('applications')
          .select('service_id, status, worker_id')
          .in('service_id', completedServiceIds)
          .eq('status', 'accepted')
          .limit(50),
        supabase
          .from('reviews')
          .select('service_id, professional_id')
          .in('service_id', completedServiceIds)
          .eq('reviewer_id', userId),
      ]);
      
      const applications = applicationsResult.status === 'fulfilled' 
        ? applicationsResult.value.data || []
        : [];
      const reviews = reviewsResult.status === 'fulfilled'
        ? reviewsResult.value.data || []
        : [];
      
      // Obtener worker_ids únicos
      const workerIds = [...new Set(applications.map(a => a.worker_id).filter(Boolean))];
      
      if (workerIds.length === 0) return {};
      
      // Cargar profesionales
      const { data: professionals } = await supabase
        .from('professionals')
        .select('id, user_id')
        .in('user_id', workerIds);
      
      // Construir mapa de servicios revisados
      const reviewed: Record<string, boolean> = {};
      
      completedServiceIds.forEach(serviceId => {
        const application = applications.find(a => a.service_id === serviceId);
        if (application && professionals) {
          const professional = professionals.find(p => p.user_id === application.worker_id);
          if (professional) {
            const hasReview = reviews.some(
              r => r.service_id === serviceId && r.professional_id === professional.id
            );
            reviewed[serviceId] = !!hasReview;
          }
        }
      });
      
      return reviewed;
    },
    enabled: enabled && !!userId && serviceIds.length > 0,
    staleTime: 2 * 60 * 1000, // 2 min - reviews cambian poco
    gcTime: 5 * 60 * 1000,
  });
}

