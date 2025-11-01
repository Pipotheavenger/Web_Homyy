import { supabase } from '@/lib/supabase';

export interface WorkerStats {
  balance: number;
  completedServices: number;
  averageRating: number;
  totalEarnings: number;
  pendingApplications: number;
  activeServices: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export const workerStatsService = {
  /**
   * Obtener estadísticas completas del trabajador
   */
  async getWorkerStats(): Promise<ApiResponse<WorkerStats>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener perfil del trabajador
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw new Error('Error al obtener perfil del usuario');

      // Obtener ID del profesional
      const { data: professional, error: professionalError } = await supabase
        .from('professionals')
        .select('id, rating, total_services')
        .eq('user_id', user.id)
        .single();

      // Obtener servicios completados por este trabajador
      const { data: completedServices, error: servicesError } = await supabase
        .from('services')
        .select(`
          id,
          worker_final_amount,
          applications!inner(
            id,
            worker_id,
            status
          )
        `)
        .eq('status', 'completed')
        .eq('applications.worker_id', user.id)
        .eq('applications.status', 'accepted');

      if (servicesError) {
        console.error('Error fetching completed services:', servicesError);
      }

      // Calcular ganancias totales desde transacciones de pago
      const { data: earningsTransactions, error: earningsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'recarga')
        .like('description', '%Pago por completar servicio%')
        .in('status', ['completado', 'completada']);

      if (earningsError) {
        console.error('Error fetching earnings:', earningsError);
      }

      // Obtener aplicaciones pendientes
      const { data: pendingApplications, error: applicationsError } = await supabase
        .from('applications')
        .select('id')
        .eq('worker_id', user.id)
        .eq('status', 'pending');

      if (applicationsError) {
        console.error('Error fetching pending applications:', applicationsError);
      }

      // Obtener servicios activos (in_progress)
      const { data: activeServices, error: activeError } = await supabase
        .from('services')
        .select(`
          id,
          applications!inner(
            id,
            worker_id,
            status
          )
        `)
        .eq('status', 'in_progress')
        .eq('applications.worker_id', user.id)
        .eq('applications.status', 'accepted');

      if (activeError) {
        console.error('Error fetching active services:', activeError);
      }

      // Obtener calificación promedio desde reviews
      let reviews = null;
      let reviewsError = null;
      
      if (professional?.id) {
        const result = await supabase
          .from('reviews')
          .select('rating')
          .eq('professional_id', professional.id);
        
        reviews = result.data;
        reviewsError = result.error;
        
        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
        }
      }

      // Calcular estadísticas
      const balance = Number(userProfile?.balance || 0);
      const completedServicesCount = completedServices?.length || 0;
      const totalEarnings = earningsTransactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const pendingApplicationsCount = pendingApplications?.length || 0;
      const activeServicesCount = activeServices?.length || 0;

      // Calcular calificación promedio
      let averageRating = 0;
      if (professional?.rating) {
        averageRating = Number(professional.rating);
      } else if (reviews && reviews.length > 0) {
        const sum = reviews.reduce((acc, review) => acc + Number(review.rating), 0);
        averageRating = sum / reviews.length;
      }

      const stats: WorkerStats = {
        balance,
        completedServices: completedServicesCount,
        averageRating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
        totalEarnings,
        pendingApplications: pendingApplicationsCount,
        activeServices: activeServicesCount
      };

      return {
        data: stats,
        error: null,
        success: true
      };

    } catch (error) {
      console.error('Error getting worker stats:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas',
        success: false
      };
    }
  },

  /**
   * Obtener historial de pagos del trabajador
   */
  async getPaymentHistory(): Promise<ApiResponse<any[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: payments, error } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          description,
          status,
          created_at
        `)
        .eq('user_id', user.id)
        .eq('type', 'recarga')
        .like('description', '%Pago por completar servicio%')
        .in('status', ['completado', 'completada'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: payments || [],
        error: null,
        success: true
      };

    } catch (error) {
      console.error('Error getting payment history:', error);
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Error al obtener historial de pagos',
        success: false
      };
    }
  }
};
