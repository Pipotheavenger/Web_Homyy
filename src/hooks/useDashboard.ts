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

  // Cargar datos básicos optimizados
  const loadBasicData = useCallback(async () => {
    try {
      // Verificar caché para datos que no cambian frecuentemente
      const cachedCategories = getCachedData('categories');
      const cachedWorkers = getCachedData('topWorkers');
      
      const promises = [
        profileService.getProfile(),
        serviceService.getUserServices(),
        statsService.getDashboardStats()
      ];

      // Solo cargar categorías y trabajadores si no están en caché
      if (!cachedCategories) {
        promises.push(categoryService.getAll());
      }
      if (!cachedWorkers) {
        promises.push(workerService.getAll({ is_available: true }));
      }

      const results = await Promise.all(promises);
      
      return {
        profileResponse: results[0],
        servicesResponse: results[1],
        statsResponse: results[2],
        categoriesResponse: cachedCategories ? { success: true, data: cachedCategories } : results[3],
        workersResponse: cachedWorkers ? { success: true, data: cachedWorkers } : results[4]
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

        // Procesar perfil del usuario
        if (profileResponse.success && profileResponse.data) {
          const firstName = profileResponse.data.name?.split(' ')[0] || 'Usuario';
          setUserName(firstName);
        }

        // Procesar servicios
        if (servicesResponse.success && servicesResponse.data) {
          const activeServices = servicesResponse.data.filter(
            (service: Service) => service.status === 'active' || service.status === 'in_progress' || service.status === 'completed' || service.status === 'hired'
          );
          
          setServices(activeServices);
          
          // Marcar carga inicial como completa después de cargar servicios
          setInitialLoadComplete(true);
          
          // Cargar datos relacionados de forma asíncrona (no bloquea la UI)
          loadServiceRelatedData(activeServices);
        }

        // Procesar otros datos y guardar en caché
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
          setCachedData('categories', categoriesResponse.data);
        }

        if (workersResponse.success && workersResponse.data) {
          const topWorkersData = workersResponse.data.slice(0, 5);
          setTopWorkers(topWorkersData);
          setCachedData('topWorkers', workersResponse.data);
        }

        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }

      } catch (err) {
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const loadServiceRelatedData = useCallback(async (activeServices: Service[]) => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || activeServices.length === 0) return;

      // Obtener todos los IDs de servicios
      const serviceIds = activeServices.map(s => s.id);
      
      // Ejecutar todas las consultas en paralelo para máxima eficiencia
      const [applicationsResult, reviewsResult, professionalsResult] = await Promise.allSettled([
        // Cargar aplicaciones
        supabase
          .from('applications')
          .select(`
            service_id,
            status,
            worker_id
          `)
          .in('service_id', serviceIds),
        
        // Cargar reseñas solo para servicios completados
        (() => {
          const completedServiceIds = activeServices
            .filter(s => s.status === 'completed')
            .map(s => s.id);
          
          return completedServiceIds.length > 0 
            ? supabase
                .from('reviews')
                .select('service_id, professional_id')
                .in('service_id', completedServiceIds)
                .eq('reviewer_id', user.id)
            : Promise.resolve({ data: [] });
        })(),
        
        // Cargar profesionales (se ejecutará después de obtener worker_ids)
        Promise.resolve({ data: [] })
      ]);

      // Obtener datos de aplicaciones
      const allApplications = applicationsResult.status === 'fulfilled' 
        ? applicationsResult.value.data 
        : [];

      // Obtener datos de reseñas
      const existingReviews = reviewsResult.status === 'fulfilled' 
        ? reviewsResult.value.data 
        : [];

      // Obtener nombres de trabajadores por separado
      const workerIds = [...new Set(
        allApplications?.map(app => app.worker_id).filter(Boolean) || []
      )];

      let workers = [];
      if (workerIds.length > 0) {
        const { data: workersData, error: workersError } = await supabase
          .from('user_profiles')
          .select('user_id, name')
          .in('user_id', workerIds);

        if (workersError) {
          console.warn('Error obteniendo trabajadores:', workersError);
        } else {
          workers = workersData || [];
        }
      }

      // Obtener professional_ids para trabajadores (ya obtenidos arriba)

      // Cargar profesionales si hay worker_ids
      const { data: professionals } = workerIds.length > 0 
        ? await supabase
            .from('professionals')
            .select('id, user_id')
            .in('user_id', workerIds) 
        : { data: [] };

      // Procesar datos de forma optimizada
      const reviewed: Record<string, boolean> = {};

      activeServices.forEach(service => {
        const serviceApplications = allApplications?.filter(app => app.service_id === service.id) || [];
        
        if (service.status === 'completed') {
          // Verificar si ya tiene reseña (solo para completados)
          const acceptedApplication = serviceApplications.find(app => app.status === 'accepted');
          if (acceptedApplication) {
            const professional = professionals?.find(p => p.user_id === acceptedApplication.worker_id);
            if (professional) {
              const hasReview = existingReviews?.some(review => 
                review.service_id === service.id && review.professional_id === professional.id
              );
              reviewed[service.id] = !!hasReview;
            }
          }
        }
      });

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
