import { useMemo, useCallback } from 'react';
import { applicationsService } from '@/lib/services';
import { formatPrice, formatDate } from '@/lib/utils/empty-state-helpers';
import { useAuth } from './useAuth';
import { useWorkerApplications } from './queries/workerDashboardQueries';
import { workerDashboardKeys } from './queries/workerDashboardQueries';
import { useQueryClient } from '@tanstack/react-query';

export const useWorkerDashboard = () => {
  const { user, loading: authLoading, profile: authProfile } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? undefined;
  const authProfileName = authProfile?.name ?? null;

  // Determinar si la query debe estar habilitada
  const queryEnabled = !authLoading && !!userId;

  // Query para aplicaciones - solo se ejecuta cuando hay userId y auth ha terminado
  const {
    data: rawApplications = [],
    isLoading: applicationsLoading,
    error: applicationsError,
  } = useWorkerApplications(userId, queryEnabled);

  // Procesar aplicaciones
  const applications = useMemo(() => {
    return transformApplications(rawApplications);
  }, [rawApplications]);

  // Calcular estadísticas generales
  const stats = useMemo(() => {
    return calculateWorkerStats({
      profile: authProfile && authProfile.user_type === 'worker' ? authProfile : null,
      applications: rawApplications,
      workerProfile: authProfile && authProfile.user_type === 'worker' ? authProfile : null,
    });
  }, [authProfile, rawApplications]);


  // Calcular userName
  const userName = useMemo(() => {
    const nombreBase = authProfileName || user?.email || 'Profesional';
    return nombreBase.split(' ')[0] || 'Profesional';
  }, [authProfileName, user?.email]);

  // Estados combinados
  // Mostrar loading solo durante la carga inicial
  // Si hay datos en caché, no mostrar loading (mejor UX)
  const loading = authLoading || (queryEnabled && applicationsLoading && rawApplications.length === 0);
  const error = applicationsError ? (applicationsError as Error).message : null;

  // Función para retirar aplicación
  const withdrawApplication = useCallback(async (applicationId: string) => {
    const response = await applicationsService.withdraw(applicationId);
    if (response.success && userId) {
      // Invalidar y refetch aplicaciones
      queryClient.invalidateQueries({ queryKey: workerDashboardKeys.applications(userId) });
    }
    return response;
  }, [userId, queryClient]);

  // Función para recargar datos (mantiene compatibilidad)
  const loadDashboardData = useCallback(() => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: workerDashboardKeys.applications(userId) });
    }
  }, [userId, queryClient]);

  return {
    userName,
    applications,
    stats,
    loading,
    error,
    formatPrice,
    formatDate,
    withdrawApplication,
    loadDashboardData,
  };
};

function transformApplications(applications: any[]) {
  if (!applications || applications.length === 0) {
    return [];
  }

  const withServices = applications.map(app => ({
    ...app,
    service: app.service || null,
  }));

  return withServices.filter(app => 
    app.service &&
    app.service.status !== 'completed' &&
    app.service.status !== 'deleted' && // Excluir servicios eliminados del frontend
    app.status !== 'withdrawn' &&
    app.status !== 'rejected'
  );
}

function calculateWorkerStats({
  profile,
  applications,
  workerProfile,
}: {
  profile: any | null;
  applications: any[];
  workerProfile: any | null;
}) {
  const balance = Number(profile?.balance || 0);

  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const acceptedApplications = applications.filter(app => app.status === 'accepted');

  const activeServices = acceptedApplications.filter(app => app.service?.status === 'in_progress').length;
  const completedServices = acceptedApplications.filter(app => app.service?.status === 'completed').length;

  const totalEarnings = acceptedApplications
    .filter(app => app.service?.status === 'completed')
    .reduce((sum, app) => {
      const service = app.service || {};
      const amount = service.worker_final_amount ?? service.escrow_amount ?? 0;
      return sum + Number(amount);
    }, 0);

  const averageRating = Number(workerProfile?.rating || 0);

  return {
    balance,
    completedServices,
    averageRating: Math.round(averageRating * 10) / 10,
    totalEarnings,
    pendingApplications,
    activeServices,
  };
}
