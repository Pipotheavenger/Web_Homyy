import { supabase } from '../supabase';
import type { PostgrestError } from '@supabase/supabase-js';
import type { ApiResponse } from '@/types/database';

// =====================================================
// TIPOS PARA APLICACIONES
// =====================================================

export interface Application {
  id: string;
  service_id: string;
  worker_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  proposed_price: number | null;
  cover_letter: string | null;
  estimated_duration: string | null;
  created_at: string;
  updated_at: string;
  // Relaciones
  worker?: {
    id: string;
    name: string;
    phone: string | null;
    profile_picture_url: string | null;
  };
  worker_profile?: {
    profession: string;
    experience_years: number;
    rating: number;
    total_services: number;
    bio: string | null;
    location: string | null;
    is_verified: boolean;
    is_available: boolean;
  };
  service?: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
  };
}

export interface CreateApplicationData {
  service_id: string;
  proposed_price?: number;
  cover_letter?: string;
  estimated_duration?: string;
}

export interface UpdateApplicationData {
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  proposed_price?: number;
  cover_letter?: string;
  estimated_duration?: string;
}

// =====================================================
// SERVICIO DE APLICACIONES
// =====================================================

export const applicationsService = {
  /**
   * Crear una nueva aplicación (postularse a un servicio)
   */
  async create(data: CreateApplicationData): Promise<ApiResponse<Application>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Verificar que el usuario sea un trabajador
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();

      if (profile?.user_type !== 'worker') {
        throw new Error('Solo los trabajadores pueden postularse a servicios');
      }

      // Verificar que el servicio existe y no es del mismo usuario
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('user_id, status, title')
        .eq('id', data.service_id)
        .neq('status', 'deleted') // Excluir servicios eliminados
        .single();

      if (serviceError) throw new Error('Servicio no encontrado');
      if (service.user_id === user.id) {
        throw new Error('No puedes postularte a tu propio servicio');
      }
      if (service.status !== 'active') {
        throw new Error('Este servicio ya no está disponible');
      }

      // Verificar si ya existe una aplicación activa (no retirada) para este servicio
      const { data: existingApplications } = await supabase
        .from('applications')
        .select('id, status')
        .eq('service_id', data.service_id)
        .eq('worker_id', user.id)
        .neq('status', 'withdrawn'); // Excluir aplicaciones retiradas

      if (existingApplications && existingApplications.length > 0) {
        // Verificar si hay alguna aplicación que no esté retirada
        const hasActiveApplication = existingApplications.some(
          app => app.status !== 'withdrawn'
        );
        
        if (hasActiveApplication) {
          throw new Error('Ya te has postulado a este servicio');
        }
      }

      // Crear la aplicación (INSERT simple sin joins)
      const applicationData = {
        service_id: data.service_id,
        worker_id: user.id,
        proposed_price: data.proposed_price || null,
        cover_letter: data.cover_letter || null,
        estimated_duration: data.estimated_duration || null,
        status: 'pending' as const
      };

      console.log('📝 Intentando crear aplicación con datos:', applicationData);

      const { data: application, error } = await supabase
        .from('applications')
        .insert([applicationData])
        .select('*')
        .maybeSingle();

      if (error) {
        // Capturar información completa del error
        const postgrestError = error as PostgrestError;
        const errorInfo = {
          message: postgrestError.message || error.message || 'Error desconocido',
          code: postgrestError.code || (error as any)?.code,
          details: postgrestError.details || (error as any)?.details,
          hint: postgrestError.hint || (error as any)?.hint,
        };
        
        console.error('Error al insertar aplicación:', {
          message: errorInfo.message,
          code: errorInfo.code,
          details: errorInfo.details,
          hint: errorInfo.hint,
        });
        
        // Verificar si es un error de duplicado (restricción única)
        const duplicate =
          errorInfo.code === '23505' ||
          errorInfo.message?.includes('duplicate key value') ||
          errorInfo.message?.includes('duplicate key value violates unique') ||
          errorInfo.message?.includes('unique constraint') ||
          errorInfo.message?.includes('applications_service_id_worker_id_active_key');
        
        if (duplicate) {
          throw new Error('Ya te has postulado a este servicio');
        }
        
        // Verificar si es un error de RLS
        if (errorInfo.code === '42501' || errorInfo.message?.includes('row-level security') || errorInfo.message?.includes('policy')) {
          throw new Error('No tienes permiso para crear esta aplicación. Por favor, contacta al soporte.');
        }
        
        // Lanzar error con mensaje descriptivo
        throw new Error(errorInfo.message || 'No se pudo crear la aplicación');
      }

      if (!application) {
        throw new Error('No se pudo crear la aplicación');
      }

      // Enviar notificación al cliente cuando un profesional aplica
      try {
        // Obtener el nombre del trabajador
        const { data: workerProfile } = await supabase
          .from('user_profiles')
          .select('name')
          .eq('user_id', user.id)
          .single();

        const professionalName = workerProfile?.name || 'Un profesional';
        const serviceTitle = service.title || 'tu servicio';

        const { notifyNewProfessionalApplication } = await import('@/lib/utils/notificationHelpers');
        await notifyNewProfessionalApplication(
          service.user_id, // clientId
          professionalName,
          serviceTitle,
          application.id
        );
      } catch (notifError) {
        // No fallar la creación de la aplicación si la notificación falla
        console.warn('⚠️ Error enviando notificación de nueva aplicación:', notifError);
      }

      return {
        data: application,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al crear aplicación',
        success: false
      };
    }
  },

  /**
   * Obtener aplicaciones de un servicio (para el dueño del servicio)
   */
  async getByService(serviceId: string): Promise<ApiResponse<Application[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Verificar que el usuario es dueño del servicio
      // Excluir servicios eliminados (aunque el dueño los puede ver para historial)
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('user_id, status')
        .eq('id', serviceId)
        .single();

      if (serviceError) throw new Error('Servicio no encontrado');
      if (service.user_id !== user.id) {
        throw new Error('No tienes permiso para ver estas aplicaciones');
      }

      // Cargar aplicaciones
      const { data: apps, error } = await supabase
        .from('applications')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!apps || apps.length === 0) {
        return { data: [], error: null, success: true };
      }

      // Batch: obtener todos los worker_ids unicos
      const workerIds = [...new Set(apps.map(a => a.worker_id).filter(Boolean))];

      // 2 queries batch en paralelo
      const [usersResult, workerProfilesResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('user_id, id, name, phone, profile_picture_url')
          .in('user_id', workerIds),
        supabase
          .from('worker_profiles')
          .select('user_id, profession, experience_years, rating, total_services, bio, location, is_verified, is_available')
          .in('user_id', workerIds),
      ]);

      // Mapas de lookup por user_id
      const usersMap = new Map(
        (usersResult.data || []).map(u => [u.user_id, u])
      );
      const workerProfilesMap = new Map(
        (workerProfilesResult.data || []).map(w => [w.user_id, w])
      );

      // Ensamblar resultados
      const applicationsWithData = apps.map(app => {
        const workerUser = usersMap.get(app.worker_id) || null;
        const workerProfile = workerProfilesMap.get(app.worker_id) || null;

        return {
          ...app,
          worker: workerUser,
          worker_profile: workerProfile,
        };
      });

      return {
        data: applicationsWithData,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Error al obtener aplicaciones',
        success: false
      };
    }
  },

  /**
   * Obtener aplicaciones del trabajador actual
   * OPTIMIZADO: Carga aplicaciones primero, luego servicios en paralelo (más rápido)
   */
  async getMyApplications(options?: { includeService?: boolean; limit?: number; userId?: string }): Promise<ApiResponse<Application[]>> {
    try {
      let userId = options?.userId;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');
        userId = user.id;
      }

      const { includeService = true, limit = 25 } = options ?? {};

      // FASE 1: Cargar aplicaciones básicas primero (sin join - más rápido)
      const applicationsQuery = supabase
        .from('applications')
        .select('id, service_id, worker_id, status, proposed_price, cover_letter, estimated_duration, created_at, updated_at')
        .eq('worker_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data: applications, error: applicationsError } = await applicationsQuery;

      if (applicationsError) throw applicationsError;

      if (!applications || applications.length === 0) {
        return {
          data: [],
          error: null,
          success: true
        };
      }

      // Si no se necesitan datos del servicio, retornar inmediatamente
      if (!includeService) {
        return {
          data: applications as Application[],
          error: null,
          success: true
        };
      }

      // FASE 2: Cargar datos de servicios en una sola query optimizada (en paralelo)
      const serviceIds = [...new Set(applications.map(app => app.service_id).filter(Boolean))];
      
      if (serviceIds.length === 0) {
        return {
          data: applications as Application[],
          error: null,
          success: true
        };
      }

      // Query optimizada: solo campos necesarios, sin joins anidados
      // Excluir servicios eliminados (eliminación lógica - status 'deleted')
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, title, description, location, status, created_at, worker_final_amount, escrow_amount')
        .in('id', serviceIds)
        .neq('status', 'deleted'); // Excluir servicios eliminados del frontend

      if (servicesError) {
        console.warn('Error cargando servicios para aplicaciones:', servicesError);
        // Continuar sin datos de servicio si falla
      }

      // Crear mapa de servicios para acceso rápido
      const servicesMap = new Map((services || []).map(s => [s.id, s]));

      // Combinar aplicaciones con servicios
      const applicationsWithServices = applications.map(app => ({
        ...app,
        service: app.service_id ? servicesMap.get(app.service_id) || null : null,
      }));

      return {
        data: applicationsWithServices as Application[],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener aplicaciones',
        success: false
      };
    }
  },

  /**
   * Obtener una aplicación por ID
   */
  async getById(id: string): Promise<ApiResponse<Application>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          worker:user_profiles!applications_worker_id_fkey(id, name, phone, profile_picture_url),
          worker_profile:worker_profiles!worker_profiles_user_id_fkey(
            profession,
            experience_years,
            rating,
            total_services,
            bio,
            location,
            is_verified,
            is_available
          ),
          service:services(id, title, description, location, user_id)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Verificar permisos: solo el trabajador o el dueño del servicio pueden ver
      if (data.worker_id !== user.id && data.service.user_id !== user.id) {
        throw new Error('No tienes permiso para ver esta aplicación');
      }

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener aplicación',
        success: false
      };
    }
  },

  /**
   * Actualizar estado de una aplicación (aceptar/rechazar)
   */
  async updateStatus(id: string, status: 'accepted' | 'rejected'): Promise<ApiResponse<Application>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener la aplicación para verificar permisos
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select('*, service:services(user_id)')
        .eq('id', id)
        .single();

      if (appError) throw new Error('Aplicación no encontrada');

      // Solo el dueño del servicio puede cambiar el estado
      if (application.service.user_id !== user.id) {
        throw new Error('No tienes permiso para actualizar esta aplicación');
      }

      // Actualizar el estado
      const { data, error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          worker:user_profiles!applications_worker_id_fkey(id, name, phone, profile_picture_url),
          worker_profile:worker_profiles!worker_profiles_user_id_fkey(
            profession,
            experience_years,
            rating,
            total_services,
            bio,
            location,
            is_verified,
            is_available
          )
        `)
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al actualizar aplicación',
        success: false
      };
    }
  },

  /**
   * Rechazar una aplicación (solo el dueño del servicio)
   */
  async reject(id: string): Promise<ApiResponse<Application>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener la aplicación para verificar permisos
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select('*, service:services(user_id)')
        .eq('id', id)
        .single();

      if (appError) throw new Error('Aplicación no encontrada');

      if (application.service.user_id !== user.id) {
        throw new Error('No tienes permiso para actualizar esta aplicación');
      }

      // Actualizar el estado
      const { data, error } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al rechazar aplicación',
        success: false
      };
    }
  },

  /**
   * Retirar una aplicación (solo el trabajador)
   */
  async withdraw(id: string): Promise<ApiResponse<Application>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Verificar que la aplicación pertenece al usuario
      const { data: application } = await supabase
        .from('applications')
        .select('worker_id, status')
        .eq('id', id)
        .single();

      if (!application) throw new Error('Aplicación no encontrada');
      if (application.worker_id !== user.id) {
        throw new Error('No tienes permiso para retirar esta aplicación');
      }
      if (application.status !== 'pending') {
        throw new Error('Solo puedes retirar aplicaciones pendientes');
      }

      const { data, error } = await supabase
        .from('applications')
        .update({ status: 'withdrawn' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al retirar aplicación',
        success: false
      };
    }
  },

  /**
   * Eliminar una aplicación
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)
        .eq('worker_id', user.id);

      if (error) throw error;

      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al eliminar aplicación',
        success: false
      };
    }
  },

  /**
   * Contar aplicaciones por servicio
   */
  async countByService(serviceId: string): Promise<ApiResponse<number>> {
    try {
      const { count, error } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('service_id', serviceId);

      if (error) throw error;

      return {
        data: count || 0,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al contar aplicaciones',
        success: false
      };
    }
  }
};

