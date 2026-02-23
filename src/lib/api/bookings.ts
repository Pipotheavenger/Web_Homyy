import { supabase } from '../supabase';
import type { ApiResponse } from '@/types/database';

// =====================================================
// TIPOS PARA RESERVAS
// =====================================================

export interface Booking {
  id: string;
  service_id: string;
  client_id: string;
  worker_id: string;
  application_id: string | null;
  schedule_id: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  total_price: number;
  start_date: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  cancellation_reason: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Relaciones
  service?: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
  };
  client?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    profile_picture_url: string | null;
  };
  worker?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    profile_picture_url: string | null;
  };
  worker_profile?: {
    profession: string;
    rating: number;
    total_services: number;
  };
}

export interface CreateBookingData {
  service_id: string;
  worker_id: string;
  application_id?: string;
  schedule_id?: string;
  total_price: number;
  start_date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface UpdateBookingData {
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'refunded';
  notes?: string;
  cancellation_reason?: string;
  completed_at?: string;
}

// =====================================================
// SERVICIO DE RESERVAS
// =====================================================

export const bookingsService = {
  /**
   * Crear una nueva reserva (cuando se acepta un trabajador)
   */
  async create(data: CreateBookingData): Promise<ApiResponse<Booking>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Verificar que el usuario es dueño del servicio
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('user_id, status')
        .eq('id', data.service_id)
        .single();

      if (serviceError) throw new Error('Servicio no encontrado');
      if (service.user_id !== user.id) {
        throw new Error('No tienes permiso para crear reservas en este servicio');
      }

      // Crear la reserva
      const bookingData = {
        service_id: data.service_id,
        client_id: user.id,
        worker_id: data.worker_id,
        application_id: data.application_id || null,
        schedule_id: data.schedule_id || null,
        total_price: data.total_price,
        start_date: data.start_date,
        start_time: data.start_time,
        end_time: data.end_time,
        notes: data.notes || null,
        status: 'scheduled' as const,
        payment_status: 'pending' as const
      };

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select(`
          *,
          service:services(id, title, description, location),
          client:user_profiles!bookings_client_id_fkey(id, name, email, phone, profile_picture_url),
          worker:user_profiles!bookings_worker_id_fkey(id, name, email, phone, profile_picture_url),
          worker_profile:worker_profiles!worker_profiles_user_id_fkey(profession, rating, total_services)
        `)
        .single();

      if (error) throw error;

      // Actualizar el estado del servicio a 'hired'
      await supabase
        .from('services')
        .update({ status: 'hired' })
        .eq('id', data.service_id);

      // Enviar notificación al trabajador cuando es seleccionado
      try {
        const serviceTitle = booking.service?.title || 'el servicio';
        const clientName = booking.client?.name || 'Un cliente';
        
        const { notifyClientSelectedYou } = await import('@/lib/utils/notificationHelpers');
        await notifyClientSelectedYou(
          data.worker_id,
          clientName,
          serviceTitle,
          booking.id
        );
      } catch (notifError) {
        // No fallar la creación del booking si la notificación falla
        console.warn('⚠️ Error enviando notificación de selección:', notifError);
      }

      return {
        data: booking,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al crear reserva',
        success: false
      };
    }
  },

  /**
   * Obtener reservas del cliente actual
   */
  async getMyBookingsAsClient(): Promise<ApiResponse<Booking[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Cargar bookings - usar left join para incluir servicios incluso si están deleted
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(id, title, description, location, status),
          worker:user_profiles!bookings_worker_id_fkey(id, name, email, phone, profile_picture_url),
          worker_profile:worker_profiles!worker_profiles_user_id_fkey(profession, rating, total_services)
        `)
        .eq('client_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener reservas',
        success: false
      };
    }
  },

  /**
   * Obtener reservas del trabajador actual
   */
  async getMyBookingsAsWorker(): Promise<ApiResponse<Booking[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(id, title, description, location),
          client:user_profiles!bookings_client_id_fkey(id, name, email, phone, profile_picture_url)
        `)
        .eq('worker_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener reservas',
        success: false
      };
    }
  },

  /**
   * Obtener una reserva por ID
   */
  async getById(id: string): Promise<ApiResponse<Booking>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(id, title, description, location),
          client:user_profiles!bookings_client_id_fkey(id, name, email, phone, profile_picture_url),
          worker:user_profiles!bookings_worker_id_fkey(id, name, email, phone, profile_picture_url),
          worker_profile:worker_profiles!worker_profiles_user_id_fkey(profession, rating, total_services)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Verificar permisos: solo el cliente o el trabajador pueden ver
      if (data.client_id !== user.id && data.worker_id !== user.id) {
        throw new Error('No tienes permiso para ver esta reserva');
      }

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener reserva',
        success: false
      };
    }
  },

  /**
   * Actualizar estado de una reserva
   */
  async updateStatus(id: string, updates: UpdateBookingData): Promise<ApiResponse<Booking>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Verificar permisos
      const { data: booking } = await supabase
        .from('bookings')
        .select('client_id, worker_id')
        .eq('id', id)
        .single();

      if (!booking) throw new Error('Reserva no encontrada');
      if (booking.client_id !== user.id && booking.worker_id !== user.id) {
        throw new Error('No tienes permiso para actualizar esta reserva');
      }

      // Si se marca como completada, agregar timestamp
      const updateData = { ...updates };
      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          service:services(id, title, description, location),
          client:user_profiles!bookings_client_id_fkey(id, name, email, phone, profile_picture_url),
          worker:user_profiles!bookings_worker_id_fkey(id, name, email, phone, profile_picture_url),
          worker_profile:worker_profiles!worker_profiles_user_id_fkey(profession, rating, total_services)
        `)
        .single();

      if (error) throw error;

      // Si se completó, actualizar el contador del trabajador
      if (updates.status === 'completed') {
        await supabase.rpc('increment_worker_services', {
          worker_user_id: booking.worker_id
        });

        // Actualizar estado del servicio a completado
        await supabase
          .from('services')
          .update({ status: 'completed' })
          .eq('id', data.service_id);
      }

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al actualizar reserva',
        success: false
      };
    }
  },

  /**
   * Cancelar una reserva
   */
  async cancel(id: string, reason: string): Promise<ApiResponse<Booking>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: booking } = await supabase
        .from('bookings')
        .select('client_id, worker_id, status, service_id')
        .eq('id', id)
        .single();

      if (!booking) throw new Error('Reserva no encontrada');
      if (booking.client_id !== user.id && booking.worker_id !== user.id) {
        throw new Error('No tienes permiso para cancelar esta reserva');
      }
      if (booking.status === 'completed' || booking.status === 'cancelled') {
        throw new Error('No se puede cancelar una reserva completada o ya cancelada');
      }

      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: reason
        })
        .eq('id', id)
        .select(`
          *,
          service:services(id, title, description, location),
          client:user_profiles!bookings_client_id_fkey(id, name, email, phone, profile_picture_url),
          worker:user_profiles!bookings_worker_id_fkey(id, name, email, phone, profile_picture_url)
        `)
        .single();

      if (error) throw error;

      // Actualizar el estado del servicio de vuelta a active
      await supabase
        .from('services')
        .update({ status: 'active' })
        .eq('id', booking.service_id);

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al cancelar reserva',
        success: false
      };
    }
  },

  /**
   * Obtener estadísticas de reservas
   */
  async getStats(): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener perfil para saber si es cliente o trabajador
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();

      let query = supabase.from('bookings').select('*');

      if (profile?.user_type === 'worker') {
        query = query.eq('worker_id', user.id);
      } else {
        query = query.eq('client_id', user.id);
      }

      const { data: bookings, error } = await query;
      if (error) throw error;

      const stats = {
        total: bookings?.length || 0,
        scheduled: bookings?.filter(b => b.status === 'scheduled').length || 0,
        in_progress: bookings?.filter(b => b.status === 'in_progress').length || 0,
        completed: bookings?.filter(b => b.status === 'completed').length || 0,
        cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0,
        total_earnings: bookings
          ?.filter(b => b.status === 'completed' && b.payment_status === 'paid')
          .reduce((sum, b) => sum + Number(b.total_price), 0) || 0
      };

      return {
        data: stats,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas',
        success: false
      };
    }
  }
};

