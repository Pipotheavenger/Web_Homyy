import { useState, useEffect } from 'react';
import { profileService, bookingsService, applicationsService } from '@/lib/services';
import { formatPrice, formatDate } from '@/lib/utils/empty-state-helpers';

export const useWorkerDashboard = () => {
  const [userName, setUserName] = useState<string>('');
  const [applications, setApplications] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedBookings: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar perfil del usuario
      const profileResponse = await profileService.getProfile();
      if (profileResponse.success && profileResponse.data) {
        const firstName = profileResponse.data.name?.split(' ')[0] || 'Profesional';
        setUserName(firstName);
      }

      // Cargar mis aplicaciones
      const applicationsResponse = await applicationsService.getMyApplications();
      if (applicationsResponse.success && applicationsResponse.data) {
        // Cargar datos de servicios para cada aplicación
        const applicationsWithServices = await Promise.all(
          applicationsResponse.data.map(async (app: any) => {
            try {
              const { supabase } = await import('@/lib/supabase');
              const { data: service } = await supabase
                .from('services')
                .select('id, title, description, location, status, created_at')
                .eq('id', app.service_id)
                .single();
              
              return {
                ...app,
                service: service
              };
            } catch (error) {
              console.error('Error loading service for application:', app.id, error);
              return {
                ...app,
                service: null
              };
            }
          })
        );
        
        setApplications(applicationsWithServices);
      } else {
        setApplications([]);
      }

      // Cargar mis bookings como trabajador
      const bookingsResponse = await bookingsService.getMyBookingsAsWorker();
      if (bookingsResponse.success && bookingsResponse.data) {
        setMyBookings(bookingsResponse.data);

        // Calcular estadísticas
        const completed = bookingsResponse.data.filter((b: any) => b.status === 'completed');
        const totalEarnings = completed.reduce((sum: number, b: any) => sum + Number(b.total_price || 0), 0);
        
        setStats({
          totalEarnings,
          completedBookings: completed.length,
          averageRating: 0 // Se puede calcular desde reviews más adelante
        });
      }

    } catch (err) {
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
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

