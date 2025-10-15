import { useState, useEffect } from 'react';
import { profileService, applicationsService, workerStatsService } from '@/lib/services';
import { formatPrice, formatDate } from '@/lib/utils/empty-state-helpers';

export const useWorkerDashboard = () => {
  const [userName, setUserName] = useState<string>('');
  const [applications, setApplications] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    balance: 0,
    completedServices: 0,
    averageRating: 0,
    totalEarnings: 0,
    pendingApplications: 0,
    activeServices: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar datos en paralelo
      const [profileResponse, applicationsResponse, statsResponse] = await Promise.all([
        profileService.getProfile(),
        applicationsService.getMyApplications(),
        workerStatsService.getWorkerStats()
      ]);

      // Procesar perfil del usuario
      if (profileResponse.success && profileResponse.data) {
        const firstName = profileResponse.data.name?.split(' ')[0] || 'Profesional';
        setUserName(firstName);
      }

      // Procesar aplicaciones de forma optimizada
      if (applicationsResponse.success && applicationsResponse.data) {
        await loadApplicationsWithServices(applicationsResponse.data);
      } else {
        setApplications([]);
      }

      // Procesar estadísticas reales
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        // Valores por defecto si hay error
        setStats({
          balance: 0,
          completedServices: 0,
          averageRating: 0,
          totalEarnings: 0,
          pendingApplications: 0,
          activeServices: 0
        });
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationsWithServices = async (applications: any[]) => {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // Obtener todos los IDs de servicios de las aplicaciones
      const serviceIds = applications.map(app => app.service_id);
      
      // Cargar todos los servicios en una sola consulta
      const { data: services } = await supabase
        .from('services')
        .select('id, title, description, location, status, created_at')
        .in('id', serviceIds);

      // Combinar aplicaciones con servicios
      const applicationsWithServices = applications.map(app => {
        const service = services?.find(s => s.id === app.service_id);
        return {
          ...app,
          service: service || null
        };
      });
      
      // Filtrar solo aplicaciones de servicios que no estén completados
      const activeApplications = applicationsWithServices.filter(app => 
        app.service && app.service.status !== 'completed'
      );
      
      setApplications(activeApplications);

    } catch (error) {
      console.error('Error loading applications with services:', error);
      setApplications([]);
    }
  };

  const withdrawApplication = async (applicationId: string) => {
    const response = await applicationsService.withdraw(applicationId);
    if (response.success) {
      // Recargar aplicaciones
      loadDashboardData();
    }
    return response;
  };

  return {
    userName,
    applications,
    myBookings,
    stats,
    loading,
    error,
    formatPrice,
    formatDate,
    withdrawApplication
  };
};

