import { useQuery, useQueryClient } from '@tanstack/react-query';
import { applicationsService } from '@/lib/services';
import { getCachedData, setCachedData } from '@/lib/cache-utils';

export const workerDashboardKeys = {
  all: ['workerDashboard'] as const,
  applications: (userId: string) => [...workerDashboardKeys.all, 'applications', userId] as const,
};

/**
 * Query para obtener aplicaciones del trabajador
 * OPTIMIZADO: Caché local + consultas separadas + select específicos
 */
export function useWorkerApplications(userId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: workerDashboardKeys.applications(userId || ''),
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      
      // Intentar obtener del caché local primero (instantáneo)
      const cacheKey = `worker_applications_${userId}`;
      const cached = getCachedData<any[]>(cacheKey, 1 * 60 * 1000); // 1 minuto TTL
      if (cached) {
        // Retornar datos en caché inmediatamente, pero actualizar en background
        setTimeout(() => {
          applicationsService.getMyApplications({
            includeService: true,
            limit: 25,
            userId,
          }).then(response => {
            if (response.success && response.data) {
              setCachedData(cacheKey, response.data);
            }
          }).catch(() => {}); // Ignorar errores en background update
        }, 0);
        return cached;
      }
      
      try {
        // Usar la versión optimizada que carga aplicaciones y servicios por separado
        const response = await applicationsService.getMyApplications({
          includeService: true,
          limit: 25,
          userId,
        });
        
        if (!response.success) {
          const errorMessage = response.error || 'Error al cargar aplicaciones';
          throw new Error(errorMessage);
        }
        
        const data = response.data || [];
        // Guardar en caché local
        setCachedData(cacheKey, data);
        return data;
      } catch (error) {
        console.error('Error en useWorkerApplications:', error);
        throw error;
      }
    },
    enabled: enabled && !!userId,
    staleTime: 1 * 60 * 1000, // 1 minuto - datos más frescos
    gcTime: 5 * 60 * 1000,
    retry: 1,
    // Mostrar datos en caché inmediatamente mientras se actualiza
    placeholderData: (previousData) => previousData,
  });
}

