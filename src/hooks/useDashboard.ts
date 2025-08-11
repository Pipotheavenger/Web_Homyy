import { useState, useEffect } from 'react';
import { serviceService, statsService, categoryService } from '@/lib/services';
import type { Service, Category } from '@/types/database';

export const useDashboard = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Cargar servicios del usuario
        const servicesResponse = await serviceService.getUserServices();
        if (servicesResponse.success && servicesResponse.data) {
          setServices(servicesResponse.data);
        } else {
          // Datos de ejemplo para pruebas
          setServices([
            {
              id: '1',
              user_id: 'user1',
              title: 'Reparar Fontaneria de la ducha',
              description: 'Necesito reparar la fontanería de la ducha que está goteando',
              category_id: '1',
              location: 'Bogotá, Chapinero alto',
              status: 'contratando',
              created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
              category: {
                id: '1',
                name: 'Plomería',
                icon: '🔧',
                color: '#10B981',
                created_at: new Date().toISOString()
              },
              schedules: [
                {
                  id: 'schedule-1',
                  service_id: '1',
                  date_available: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  start_time: '09:00',
                  end_time: '17:00',
                  created_at: new Date().toISOString()
                },
                {
                  id: 'schedule-2',
                  service_id: '1',
                  date_available: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  start_time: '14:00',
                  end_time: '18:00',
                  created_at: new Date().toISOString()
                }
              ]
            },
            {
              id: '2',
              user_id: 'user1',
              title: 'Limpieza general de casa',
              description: 'Limpieza completa de la casa incluyendo cocina, baños y habitaciones',
              category_id: '2',
              location: 'Bogotá, Usaquén',
              status: 'eligiendo',
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
              category: {
                id: '2',
                name: 'Limpieza',
                icon: '🧹',
                color: '#3B82F6',
                created_at: new Date().toISOString()
              },
              schedules: [
                {
                  id: 'schedule-3',
                  service_id: '2',
                  date_available: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  start_time: '08:00',
                  end_time: '16:00',
                  created_at: new Date().toISOString()
                }
              ]
            },
            {
              id: '3',
              user_id: 'user1',
              title: 'Diseño de logo corporativo',
              description: 'Necesito un logo moderno para mi empresa de tecnología',
              category_id: '3',
              location: 'Bogotá, Chapinero',
              status: 'completado',
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
              category: {
                id: '3',
                name: 'Diseño',
                icon: '🎨',
                color: '#8B5CF6',
                created_at: new Date().toISOString()
              },
              schedules: []
            }
          ]);
        }

        // Cargar categorías
        const categoriesResponse = await categoryService.getAll();
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        } else {
          // Categorías de ejemplo
          setCategories([
            {
              id: '1',
              name: 'Plomería',
              icon: '🔧',
              color: '#10B981',
              created_at: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Limpieza',
              icon: '🧹',
              color: '#3B82F6',
              created_at: new Date().toISOString()
            },
            {
              id: '3',
              name: 'Diseño',
              icon: '🎨',
              color: '#8B5CF6',
              created_at: new Date().toISOString()
            }
          ]);
        }

        // Cargar estadísticas
        const statsResponse = await statsService.getDashboardStats();
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }

      } catch (err) {
        setError('Error al cargar los datos del dashboard');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleDeleteService = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    if (service.status !== 'completado') {
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
        console.error('Error deleting service:', error);
      }
    }
  };

  return {
    services,
    categories,
    stats,
    loading,
    error,
    handleDeleteService
  };
}; 