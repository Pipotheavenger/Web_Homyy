import { useState, useEffect } from 'react';
import { serviceService, statsService, categoryService, workerService, profileService, applicationsService } from '@/lib/services';
import type { Service, Category } from '@/types/database';

export const useDashboard = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [topWorkers, setTopWorkers] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [applicationsCount, setApplicationsCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Cargar perfil del usuario
        const profileResponse = await profileService.getProfile();
        if (profileResponse.success && profileResponse.data) {
          const firstName = profileResponse.data.name?.split(' ')[0] || 'Usuario';
          setUserName(firstName);
        }

        // Cargar servicios del usuario
        const servicesResponse = await serviceService.getUserServices();
        if (servicesResponse.success && servicesResponse.data) {
          setServices(servicesResponse.data);
          
          // Cargar conteos de aplicaciones para cada servicio
          const counts: Record<string, number> = {};
          await Promise.all(
            servicesResponse.data.map(async (service) => {
              const countResponse = await applicationsService.countByService(service.id);
              if (countResponse.success && countResponse.data !== null) {
                counts[service.id] = countResponse.data;
              } else {
                counts[service.id] = 0;
              }
            })
          );
          setApplicationsCount(counts);
        }

        // Cargar categorías
        const categoriesResponse = await categoryService.getAll();
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }

        // Cargar top trabajadores
        const workersResponse = await workerService.getAll({ is_available: true });
        if (workersResponse.success && workersResponse.data) {
          setTopWorkers(workersResponse.data.slice(0, 5));
        }

        // Cargar estadísticas
        const statsResponse = await statsService.getDashboardStats();
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

  const handleDeleteService = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    if (service.status !== 'completed') {
      alert('Solo se pueden eliminar servicios que estén completados');
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este servicio completado?')) {
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

  return {
    services,
    categories,
    stats,
    topWorkers,
    userName,
    applicationsCount,
    loading,
    error,
    handleDeleteService
  };
};
