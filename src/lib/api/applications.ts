import { supabase } from '../supabase';
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
    email: string;
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
        .select('user_id, status')
        .eq('id', data.service_id)
        .single();

      if (serviceError) throw new Error('Servicio no encontrado');
      if (service.user_id === user.id) {
        throw new Error('No puedes postularte a tu propio servicio');
      }
      if (service.status !== 'active') {
        throw new Error('Este servicio ya no está disponible');
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

      const { data: application, error } = await supabase
        .from('applications')
        .insert(applicationData)
        .select('*')
        .single();

      if (error) {
        console.error('Error al insertar aplicación:', error);
        if (error.code === '23505') {
          throw new Error('Ya te has postulado a este servicio');
        }
        throw error;
      }

      if (!application) {
        throw new Error('No se pudo crear la aplicación');
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
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('user_id')
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

      // Cargar datos del trabajador para cada aplicación
      const applicationsWithData = await Promise.all(
        (apps || []).map(async (app) => {
          // Cargar perfil de usuario
          const { data: workerUser } = await supabase
            .from('user_profiles')
            .select('id, name, email, phone, profile_picture_url')
            .eq('user_id', app.worker_id)
            .single();

          // Cargar perfil de trabajador
          const { data: workerProfile } = await supabase
            .from('worker_profiles')
            .select('profession, experience_years, rating, total_services, bio, location, is_verified, is_available')
            .eq('user_id', app.worker_id)
            .single();

          return {
            ...app,
            worker: workerUser,
            worker_profile: workerProfile
          };
        })
      );

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
   */
  async getMyApplications(): Promise<ApiResponse<Application[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
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
          worker:user_profiles!applications_worker_id_fkey(id, name, email, profile_picture_url),
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
          worker:user_profiles!applications_worker_id_fkey(id, name, email, profile_picture_url),
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

