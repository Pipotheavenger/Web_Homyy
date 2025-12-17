import { useMemo, useCallback } from 'react';
import type { Service, Category } from '@/types/database';
import { useAuth } from './useAuth';
import { serviceService } from '@/lib/services';
import {
  useUserServices,
  useDashboardStats,
  useCategories,
  useTopWorkers,
  useReviewedServices,
} from './queries/dashboardQueries';
import { useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from './queries/dashboardQueries';

export const useDashboard = () => {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  
  // Determinar userType
  const userType = useMemo(() => {
    if (!authProfile) return null;
    return (authProfile.user_type as 'client' | 'worker' | 'admin') || null;
  }, [authProfile]);

  // Query para servicios - CRÍTICO, carga primero
  const {
    data: allServicesData,
    isLoading: servicesLoading,
    error: servicesError,
  } = useUserServices(userId, !authLoading && !!userId);

  // Normalizar datos de servicios
  const allServices: Service[] = useMemo(() => {
    return allServicesData || [];
  }, [allServicesData]);

  // Filtrar servicios activos
  const services = useMemo(() => {
    return allServices.filter(
      (service: Service) =>
        service.status === 'active' ||
        service.status === 'in_progress' ||
        service.status === 'completed' ||
        service.status === 'hired'
    );
  }, [allServices]);

  // Query para estadísticas - usa datos de servicios cuando es cliente
  const {
    data: stats,
    isLoading: statsLoading,
  } = useDashboardStats(userId, userType, allServices.length > 0 ? allServices : undefined, !authLoading && !!userId && !!userType);

  // Query para categorías - SECUNDARIO, carga después (con caché local)
  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useCategories(!authLoading && !!userId && !servicesLoading);

  // Query para top workers - SECUNDARIO, carga después (con caché local)
  const {
    data: topWorkers = [],
    isLoading: workersLoading,
  } = useTopWorkers(!authLoading && !!userId && userType !== 'worker' && !servicesLoading);

  // Query para servicios revisados - SECUNDARIO, carga en background (solo cuando hay servicios)
  const serviceIds = useMemo(() => services.map(s => s.id), [services]);
  const {
    data: reviewedServices = {},
    isLoading: reviewedLoading,
  } = useReviewedServices(userId, serviceIds, !authLoading && !!userId && serviceIds.length > 0 && !servicesLoading);

  // Calcular userName
  const userName = useMemo(() => {
    if (authProfile?.name) {
      return authProfile.name.split(' ')[0] || 'Usuario';
    }
    return 'Usuario';
  }, [authProfile]);

  // Estado de loading combinado - solo crítico para UI inicial
  // Mostrar loading solo si no hay datos en caché
  const loading = authLoading || (servicesLoading && allServices.length === 0);
  const initialLoadComplete = !authLoading && !servicesLoading && !!userId;

  // Error combinado
  const error = servicesError ? (servicesError as Error).message : null;

  // Función para eliminar servicio - mantiene la misma lógica
  const handleDeleteService = useCallback(async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    // Permitir eliminar solo servicios activos (contratando) o completados
    if (service.status !== 'active' && service.status !== 'completed') {
      if (service.status === 'in_progress') {
        alert('No se puede eliminar un servicio que está en progreso. Debe completarse primero.');
      } else {
        alert('Solo se pueden eliminar servicios en fase contratando o completados');
      }
      return;
    }

    const confirmMessage = service.status === 'active' 
      ? '¿Estás seguro de que quieres eliminar este servicio en fase contratando? Esta acción no se puede deshacer.'
      : '¿Estás seguro de que quieres eliminar este servicio completado?';

    if (confirm(confirmMessage)) {
      try {
        const response = await serviceService.delete(serviceId);
        if (response.success && userId) {
          // Invalidar y refetch servicios
          queryClient.invalidateQueries({ queryKey: dashboardKeys.services(userId) });
          
          // También invalidar stats si es necesario
          if (userType !== 'worker') {
            queryClient.invalidateQueries({ queryKey: dashboardKeys.stats(userId, userType || '') });
          }
        }
      } catch (error) {
        alert('Error al eliminar el servicio');
      }
    }
  }, [services, userId, userType, queryClient]);

  // Memoizar servicios filtrados
  const filteredServices = useMemo(() => {
    return services.filter(
      service => service.status === 'active' || service.status === 'in_progress' || service.status === 'completed' || service.status === 'hired'
    );
  }, [services]);

  return {
    services: filteredServices,
    categories,
    stats: stats || null,
    topWorkers,
    userName,
    userType,
    reviewedServices,
    loading,
    error,
    initialLoadComplete,
    handleDeleteService,
  };
};
