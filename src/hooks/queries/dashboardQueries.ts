import { useQuery, useQueryClient } from '@tanstack/react-query';
import { serviceService, statsService, categoryService, workerService } from '@/lib/services';
import type { Service, Category } from '@/types/database';
import { useAuth } from '../useAuth';
import { getCachedData, setCachedData } from '@/lib/cache-utils';

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
 * OPTIMIZADO: Caché local + query rápida sin joins
 */
export function useUserServices(userId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: dashboardKeys.services(userId || ''),
    queryFn: async () => {
      if (!userId) return null;
      
      // Intentar obtener del caché local primero (instantáneo)
      const cacheKey = `user_services_${userId}`;
      const cached = getCachedData<Service[]>(cacheKey, 1 * 60 * 1000); // 1 minuto TTL
      if (cached) {
        // Retornar datos en caché inmediatamente, pero actualizar en background
        setTimeout(() => {
          serviceService.getUserServices({
            includeCategories: false,
            includeEscrow: false,
            userId,
          }).then(response => {
            if (response.success && response.data) {
              setCachedData(cacheKey, response.data);
            }
          }).catch(() => {}); // Ignorar errores en background update
        }, 0);
        return cached;
      }
      
      // Si no hay caché, cargar desde Supabase
      const response = await serviceService.getUserServices({
        includeCategories: false,
        includeEscrow: false,
        userId,
      });
      if (!response.success) throw new Error(response.error || 'Error al cargar servicios');
      
      const data = response.data || [];
      // Guardar en caché
      setCachedData(cacheKey, data);
      return data;
    },
    enabled: enabled && !!userId,
    staleTime: 1 * 60 * 1000, // 1 minuto - datos más frescos
    gcTime: 5 * 60 * 1000,
    // Mostrar datos en caché mientras se actualiza
    placeholderData: (previousData) => previousData,
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
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Query para obtener categorías
 * OPTIMIZADO: Caché local + caché largo (categorías raramente cambian)
 */
export function useCategories(enabled: boolean = true) {
  return useQuery({
    queryKey: dashboardKeys.categories(),
    queryFn: async () => {
      // Intentar obtener del caché local primero
      const cached = getCachedData<Category[]>('categories', 30 * 60 * 1000); // 30 minutos TTL
      if (cached) {
        return cached;
      }
      
      const response = await categoryService.getAll();
      if (!response.success) throw new Error(response.error || 'Error al cargar categorías');
      const data = response.data || [];
      
      // Guardar en caché local
      setCachedData('categories', data);
      return data;
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutos - categorías raramente cambian
    gcTime: 60 * 60 * 1000, // 1 hora en caché
    // Mostrar datos en caché mientras se actualiza
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Query para obtener top workers
 * OPTIMIZADO: Caché local + solo los primeros 5
 */
export function useTopWorkers(enabled: boolean = true) {
  return useQuery({
    queryKey: dashboardKeys.topWorkers(),
    queryFn: async () => {
      // Intentar obtener del caché local primero
      const cached = getCachedData<any[]>('top_workers', 5 * 60 * 1000); // 5 minutos TTL
      if (cached) {
        return cached;
      }
      
      const response = await workerService.getAll({ is_available: true, limit: 5 });
      if (!response.success) throw new Error(response.error || 'Error al cargar profesionales');
      const data = Array.isArray(response.data) ? response.data.slice(0, 5) : [];
      
      // Guardar en caché local
      setCachedData('top_workers', data);
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000,
    // Mostrar datos en caché mientras se actualiza
    placeholderData: (previousData) => previousData,
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

