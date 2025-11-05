import { useState, useEffect, useCallback, useMemo } from 'react';
import { serviceService, statsService, categoryService, workerService, profileService, applicationsService } from '@/lib/services';
import type { Service, Category } from '@/types/database';

// Cache simple para datos que no cambian frecuentemente
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const useDashboard = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [topWorkers, setTopWorkers] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [reviewedServices, setReviewedServices] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Debug logs removidos para producción

  // Función para obtener datos del caché
  const getCachedData = useCallback((key: string) => {
    const cached = cache.get(key);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return cached.data;
    }
    return null;
  }, []);

  // Función para guardar datos en caché
  const setCachedData = useCallback((key: string, data: any) => {
    cache.set(key, { data, timestamp: Date.now() });
  }, []);

  // Cargar datos básicos optimizados - solo lo esencial
  const loadBasicData = useCallback(async () => {
    try {
      // Verificar caché para datos que no cambian frecuentemente
      const cachedCategories = getCachedData('categories');
      const cachedWorkers = getCachedData('topWorkers');
      
      // Cargar solo lo esencial primero: perfil y servicios
      const [profileResponse, servicesResponse] = await Promise.all([
        profileService.getProfile(),
        serviceService.getUserServices()
      ]);

      // Cargar stats y categorías/trabajadores en paralelo (no bloquean la UI)
      const secondaryPromises = [
        statsService.getDashboardStats()
      ];

      // Solo cargar categorías y trabajadores si no están en caché
      if (!cachedCategories) {
        secondaryPromises.push(categoryService.getAll());
      }
      if (!cachedWorkers) {
        secondaryPromises.push(workerService.getAll({ is_available: true, limit: 5 }));
      }

      const secondaryResults = await Promise.all(secondaryPromises);
      
      return {
        profileResponse,
        servicesResponse,
        statsResponse: secondaryResults[0],
        categoriesResponse: cachedCategories ? { success: true, data: cachedCategories } : secondaryResults[1],
        workersResponse: cachedWorkers ? { success: true, data: cachedWorkers } : secondaryResults[2]
      };
    } catch (error) {
      throw error;
    }
  }, [getCachedData]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Cargar datos básicos optimizados
        const { profileResponse, servicesResponse, categoriesResponse, workersResponse, statsResponse } = await loadBasicData();

        // Procesar perfil del usuario (crítico - mostrar nombre rápido)
        if (profileResponse.success && profileResponse.data) {
          const firstName = profileResponse.data.name?.split(' ')[0] || 'Usuario';
          setUserName(firstName);
        }

        // Procesar servicios (crítico - mostrar servicios rápido)
        if (servicesResponse.success && servicesResponse.data) {
          const activeServices = servicesResponse.data.filter(
            (service: Service) => service.status === 'active' || service.status === 'in_progress' || service.status === 'completed' || service.status === 'hired'
          );
          
          setServices(activeServices);
          
          // Marcar carga inicial como completa INMEDIATAMENTE después de servicios
          setInitialLoadComplete(true);
          setLoading(false); // ✅ Quitar loading temprano
          
          // Cargar datos relacionados de forma asíncrona (no bloquea la UI)
          loadServiceRelatedData(activeServices).catch(err => {
            console.error('Error cargando datos relacionados:', err);
          });
        }

        // Procesar otros datos en segundo plano (no bloquean)
        if (categoriesResponse?.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
          setCachedData('categories', categoriesResponse.data);
        }

        if (workersResponse?.success && workersResponse.data) {
          const topWorkersData = Array.isArray(workersResponse.data) 
            ? workersResponse.data.slice(0, 5)
            : [];
          setTopWorkers(topWorkersData);
          if (Array.isArray(workersResponse.data)) {
            setCachedData('topWorkers', workersResponse.data);
          }
        }

        if (statsResponse?.success && statsResponse.data) {
          setStats(statsResponse.data);
        }

      } catch (err) {
        setError('Error al cargar los datos del dashboard');
        setLoading(false);
      }
    };

    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadServiceRelatedData = useCallback(async (activeServices: Service[]) => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || activeServices.length === 0) return;

      // Limitar a solo los primeros servicios para evitar cargar demasiado
      const servicesToLoad = activeServices.slice(0, 10);
      const serviceIds = servicesToLoad.map(s => s.id);
      
      // Solo servicios completados necesitan verificar reseñas
      const completedServices = servicesToLoad.filter(s => s.status === 'completed');
      const completedServiceIds = completedServices.map(s => s.id);
      
      // Ejecutar consultas optimizadas en paralelo
      const [applicationsResult, reviewsResult] = await Promise.allSettled([
        // Cargar aplicaciones solo para servicios que necesitan verificación
        serviceIds.length > 0
          ? supabase
              .from('applications')
              .select('service_id, status, worker_id')
              .in('service_id', serviceIds)
              .limit(50) // Limitar resultados
          : Promise.resolve({ data: [] }),
        
        // Cargar reseñas solo para servicios completados
        completedServiceIds.length > 0
          ? supabase
              .from('reviews')
              .select('service_id, professional_id')
              .in('service_id', completedServiceIds)
              .eq('reviewer_id', user.id)
          : Promise.resolve({ data: [] })
      ]);

      // Obtener datos de aplicaciones
      const allApplications = applicationsResult.status === 'fulfilled' 
        ? applicationsResult.value.data 
        : [];

      // Obtener datos de reseñas
      const existingReviews = reviewsResult.status === 'fulfilled' 
        ? reviewsResult.value.data 
        : [];

      // Solo procesar servicios completados para verificar reseñas
      const reviewed: Record<string, boolean> = {};

      // Si hay servicios completados, cargar datos de profesionales de forma optimizada
      if (completedServices.length > 0) {
        // Obtener worker_ids únicos de aplicaciones aceptadas
        const acceptedApplications = allApplications?.filter(app => app.status === 'accepted') || [];
        const workerIds = [...new Set(
          acceptedApplications.map(app => app.worker_id).filter(Boolean)
        )];

        if (workerIds.length > 0) {
          // Cargar profesionales en una sola query optimizada
          const { data: professionals } = await supabase
            .from('professionals')
            .select('id, user_id')
            .in('user_id', workerIds);

          // Procesar solo servicios completados
          completedServices.forEach(service => {
            const serviceApplications = allApplications?.filter(app => app.service_id === service.id) || [];
            const acceptedApplication = serviceApplications.find(app => app.status === 'accepted');
            
            if (acceptedApplication && professionals) {
              const professional = professionals.find(p => p.user_id === acceptedApplication.worker_id);
              if (professional) {
                const hasReview = existingReviews?.some(review => 
                  review.service_id === service.id && review.professional_id === professional.id
                );
                reviewed[service.id] = !!hasReview;
              }
            }
          });
        }
      }

      setReviewedServices(reviewed);

    } catch (error) {
      console.error('Error loading service related data:', error);
      // Establecer valores por defecto
      const reviewed: Record<string, boolean> = {};
      
      activeServices.forEach(service => {
        reviewed[service.id] = false;
      });
      
      setReviewedServices(reviewed);
    }
  }, []);

  const handleDeleteService = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    // Permitir eliminar solo servicios activos (contratando) o completados
    // NO permitir eliminar servicios en progreso (in_progress)
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
        if (response.success) {
      const servicesResponse = await serviceService.getUserServices();
      if (servicesResponse.success && servicesResponse.data) {
        setServices(servicesResponse.data);
      }
        }
      } catch (error) {
        alert('Error al eliminar el servicio');
      }
    }
  };

  // Memoizar servicios filtrados para evitar re-renders innecesarios
  const filteredServices = useMemo(() => {
    return services.filter(
      service => service.status === 'active' || service.status === 'in_progress' || service.status === 'completed' || service.status === 'hired'
    );
  }, [services]);

  return {
    services: filteredServices,
    categories,
    stats,
    topWorkers,
    userName,
    reviewedServices,
    loading,
    error,
    initialLoadComplete,
    handleDeleteService
  };
};
