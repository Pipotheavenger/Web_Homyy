import { useQuery, useQueryClient } from '@tanstack/react-query';
import { applicationsService } from '@/lib/services';

export const workerDashboardKeys = {
  all: ['workerDashboard'] as const,
  applications: (userId: string) => [...workerDashboardKeys.all, 'applications', userId] as const,
};

/**
 * Query para obtener aplicaciones del trabajador
 * Siempre refresca datos frescos desde la base de datos
 */
export function useWorkerApplications(userId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: workerDashboardKeys.applications(userId || ''),
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      
      try {
        // Cargar siempre desde la base de datos (sin caché manual)
        const response = await applicationsService.getMyApplications({
          includeService: true,
          limit: 25,
          userId,
        });
        
        if (!response.success) {
          const errorMessage = response.error || 'Error al cargar aplicaciones';
          throw new Error(errorMessage);
        }
        
        return response.data || [];
      } catch (error) {
        console.error('Error en useWorkerApplications:', error);
        throw error;
      }
    },
    enabled: enabled && !!userId,
    staleTime: 0, // Siempre considerar datos como obsoletos
    gcTime: 1 * 60 * 1000, // Mantener en memoria solo 1 minuto
    retry: 1,
    refetchOnMount: true, // Siempre refrescar al montar
    refetchOnWindowFocus: true, // Refrescar cuando la ventana recupera el foco
  });
}

