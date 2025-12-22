import { supabase } from './supabase';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  Service,
  Category,
  CreateServiceData,
  UpdateServiceData,
  ServiceFilters,
  ApiResponse
} from '@/types/database';

type EscrowRecord = { service_id: string; completion_pin: string; amount: number };

// =====================================================
// SERVICIOS PARA CATEGORÍAS
// =====================================================

export const categoryService = {
  async getAll(): Promise<ApiResponse<Category[]>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return { data: data || [], error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener categorías',
        success: false
      };
    }
  },

  async getById(id: string): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener categoría',
        success: false
      };
    }
  }
};

// =====================================================
// SERVICIOS PARA SERVICIOS
// =====================================================

export const serviceService = {
  async getUserServices(options?: { includeCategories?: boolean; includeEscrow?: boolean; userId?: string }): Promise<ApiResponse<Service[]>> {
    try {
      let userId = options?.userId;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');
        userId = user.id;
      }

      const includeCategories = options?.includeCategories ?? false; // Por defecto false para velocidad
      const includeEscrow = options?.includeEscrow ?? false; // Por defecto false para velocidad

      // OPTIMIZADO: Query simple y rápida - solo servicios básicos
      // Excluir servicios con status 'deleted' (eliminación lógica - solo se ocultan del frontend)
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select(`
          id,
          user_id,
          title,
          description,
          category_id,
          location,
          status,
          images,
          created_at,
          updated_at,
          escrow_amount,
          worker_final_amount
        `)
        .eq('user_id', userId)
        .neq('status', 'deleted') // Excluir servicios eliminados del frontend
        .order('created_at', { ascending: false })
        .limit(50); // Limitar resultados para mejor rendimiento

      if (servicesError) throw servicesError;

      if (!services || services.length === 0) {
        return { data: [], error: null, success: true };
      }

      // Detectar si hay servicios que necesitan escrow (hired o in_progress)
      const needsEscrow = services.some(s => s.status === 'hired' || s.status === 'in_progress');
      const shouldIncludeEscrow = includeEscrow || needsEscrow;

      // Si no se necesitan categorías ni escrow, retornar inmediatamente (más rápido)
      if (!includeCategories && !shouldIncludeEscrow) {
        return {
          data: services.map(s => ({ ...s, category: null, escrow_pin: null, budget: s.escrow_amount || 0 })),
          error: null,
          success: true
        };
      }

      // Cargar datos adicionales solo si se solicitan (en paralelo)
      const promises: Promise<any>[] = [];
      
      if (includeCategories) {
        const categoryIds = [...new Set(services.map(s => s.category_id).filter(Boolean))];
        if (categoryIds.length > 0) {
          promises.push(
            supabase
              .from('categories')
              .select('id, name, icon, color')
              .in('id', categoryIds)
              .then(({ data, error }) => ({ type: 'categories', data: error ? [] : (data || []), error }))
          );
        } else {
          promises.push(Promise.resolve({ type: 'categories', data: [] }));
        }
      }

      if (shouldIncludeEscrow) {
        const serviceIds = services.map(s => s.id);
        if (serviceIds.length > 0) {
          promises.push(
            supabase
              .from('escrow_transactions')
              .select('service_id, completion_pin, amount')
              .in('service_id', serviceIds)
              .then(({ data, error }) => ({ type: 'escrow', data: error ? [] : (data || []), error }))
          );
        } else {
          promises.push(Promise.resolve({ type: 'escrow', data: [] }));
        }
      }

      // Ejecutar todas las queries en paralelo
      const results = await Promise.allSettled(promises);
      
      let categories: Category[] = [];
      let escrowData: EscrowRecord[] = [];

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          if (result.value.type === 'categories') {
            categories = result.value.data;
          } else if (result.value.type === 'escrow') {
            escrowData = result.value.data;
          }
        }
      });

      // Combinar datos
      const servicesWithExtras = services.map(service => {
        const category = includeCategories
          ? categories.find(c => c.id === service.category_id)
          : null;
        const escrow = shouldIncludeEscrow
          ? escrowData.find(e => e.service_id === service.id)
          : null;

        return {
          ...service,
          category: category || null,
          escrow_pin: escrow?.completion_pin || null,
          budget: escrow?.amount || service.escrow_amount || 0
        };
      });

      return { data: servicesWithExtras, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener servicios',
        success: false
      };
    }
  },

  async getAvailableServices(): Promise<ApiResponse<Service[]>> {
    try {
      // Consulta simple y rápida: solo servicios básicos primero
      // Excluir servicios eliminados (eliminación lógica)
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select(`
          id,
          user_id,
          title,
          description,
          category_id,
          location,
          status,
          images,
          created_at,
          updated_at,
          escrow_amount,
          worker_final_amount
        `)
        .eq('status', 'active')
        .neq('status', 'deleted') // Excluir servicios eliminados del frontend
        .order('created_at', { ascending: false })
        .limit(50);

      if (servicesError) {
        console.error('Error obteniendo servicios:', servicesError);
        throw servicesError;
      }

      if (!services || services.length === 0) {
        return { data: [], error: null, success: true };
      }

      // Retornar servicios básicos primero (sin relaciones)
      // Las relaciones se pueden cargar después si es necesario
      const basicServices = services.map(service => ({
        ...service,
        category: null,
        client: null,
        schedules: []
      }));

      return { data: basicServices, error: null, success: true };
    } catch (error) {
      console.error('Error en getAvailableServices:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener servicios',
        success: false
      };
    }
  },

  async getById(id: string): Promise<ApiResponse<Service>> {
    try {
      // Consulta simple del servicio
      const { data: service, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!service) throw new Error('Servicio no encontrado');

      // Obtener categoría separadamente
      let category = null;
      if (service.category_id) {
        const { data: cat } = await supabase
          .from('categories')
          .select('*')
          .eq('id', service.category_id)
          .single();
        category = cat;
      }

      // Obtener schedules separadamente
      const { data: schedules } = await supabase
        .from('service_schedules')
        .select('*')
        .eq('service_id', id);

      // Obtener info del cliente separadamente
      let client = null;
      if (service.user_id) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('name, email, phone, profile_picture_url')
          .eq('user_id', service.user_id)
          .single();
        client = userProfile;
      }

      // Combinar todo
      const enrichedService = {
        ...service,
        category,
        schedules: schedules || [],
        client
      };

      return { data: enrichedService, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener servicio',
        success: false
      };
    }
  },

  async create(serviceData: CreateServiceData): Promise<ApiResponse<Service>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('services')
        .insert({
          user_id: user.id,
          title: serviceData.title,
          description: serviceData.description,
          category_id: serviceData.category_id,
          location: serviceData.location || null,
          status: serviceData.status || 'active',
          images: serviceData.images || []
        })
        .select()
        .single();

      if (error) throw error;

      if (serviceData.schedules?.length) {
        const schedules = serviceData.schedules.map(s => ({
          service_id: data.id,
          date_available: s.date,
          start_time: s.start_time,
          end_time: s.end_time
        }));

        const { error: scheduleError } = await supabase
          .from('service_schedules')
          .insert(schedules);

        if (scheduleError) throw scheduleError;
      }

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al crear servicio',
        success: false
      };
    }
  },

  async update(id: string, serviceData: UpdateServiceData): Promise<ApiResponse<Service>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al actualizar servicio',
        success: false
      };
    }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Eliminación lógica: solo cambiar el status a 'deleted' para ocultarlo del frontend
      // NO eliminamos aplicaciones, schedules, preguntas ni el servicio de la base de datos
      const { error } = await supabase
        .from('services')
        .update({ status: 'deleted' })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { data: null, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al eliminar servicio',
        success: false
      };
    }
  },

  async search(filters: ServiceFilters): Promise<ApiResponse<Service[]>> {
    try {
      // Excluir servicios eliminados del frontend (eliminación lógica)
      let query = supabase
        .from('services')
        .select(`
          *,
          category:categories(*),
          client:user_profiles!services_user_id_fkey(name, profile_picture_url)
        `)
        .eq('status', 'active')
        .neq('status', 'deleted'); // Excluir servicios eliminados

      if (filters.category_id) query = query.eq('category_id', filters.category_id);
      if (filters.location) query = query.ilike('location', `%${filters.location}%`);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      return { data: data || [], error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al buscar servicios',
        success: false
      };
    }
  }
};

// =====================================================
// SERVICIOS PARA PERFILES DE TRABAJADORES
// =====================================================

export const workerService = {
  async getAll(filters?: { is_available?: boolean; is_verified?: boolean; limit?: number }): Promise<ApiResponse<any[]>> {
    try {
      let query = supabase
        .from('worker_profiles')
        .select(`
          *,
          user:user_profiles!worker_profiles_user_id_fkey(
            name,
            email,
            phone,
            profile_picture_url
          )
        `)
        .order('rating', { ascending: false });

      if (filters?.is_available !== undefined) {
        query = query.eq('is_available', filters.is_available);
      }
      if (filters?.is_verified !== undefined) {
        query = query.eq('is_verified', filters.is_verified);
      }
      if (filters?.limit !== undefined) {
        query = query.limit(filters.limit);
      }

      const { data: workers, error } = await query;
      if (error) throw error;

      return { data: workers || [], error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener trabajadores',
        success: false
      };
    }
  },

  async getByUserId(userId: string): Promise<ApiResponse<any>> {
    try {
      const { data: worker, error } = await supabase
        .from('worker_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Usar maybeSingle() en lugar de single()

      // Si no hay perfil de trabajador, no es un error, simplemente no existe
      if (error && error.message && error.message.length > 0) {
        throw error;
      }

      // Si no hay worker, retornar sin éxito
      if (!worker) {
        return {
          data: null,
          error: null,
          success: false
        };
      }

      // Cargar información de usuario
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('name, email, phone, profile_picture_url, created_at')
        .eq('user_id', userId)
        .maybeSingle();

      return { 
        data: { ...worker, user: userProfile }, 
        error: null, 
        success: true 
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener trabajador',
        success: false
      };
    }
  },

  async updateProfile(updates: any): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('worker_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al actualizar perfil',
        success: false
      };
    }
  }
};

// =====================================================
// SERVICIOS PARA PERFIL DE USUARIO
// =====================================================

export const profileService = {
  async getProfile(userId?: string): Promise<ApiResponse<any>> {
    try {
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error) throw error;
      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener perfil',
        success: false
      };
    }
  },

  async updateProfile(updates: any): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al actualizar perfil',
        success: false
      };
    }
  }
};

// =====================================================
// SERVICIOS PARA ESTADÍSTICAS
// =====================================================

export const statsService = {
  async getDashboardStats(options?: { userTypeOverride?: 'client' | 'worker' | 'admin'; userId?: string }): Promise<ApiResponse<any>> {
    try {
      let userId = options?.userId;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');
        userId = user.id;
      }

      let userType = options?.userTypeOverride;
      if (!userType) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', userId)
          .single();
        userType = profile?.user_type || 'client';
      }

      if (userType === 'worker') {
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('id, status, total_price, created_at, service:services(title)')
          .eq('worker_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.warn('Error obteniendo reservas para estadísticas de trabajador:', error);
          return {
            data: {
              total_bookings: 0,
              completed_bookings: 0,
              total_earnings: 0,
              recent_bookings: []
            },
            error: null,
            success: true
          };
        }

        const completed = bookings?.filter(b => b.status === 'completed').length || 0;
        const totalEarnings = bookings
          ?.filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + Number(b.total_price || 0), 0) || 0;

        return {
          data: {
            total_bookings: bookings?.length || 0,
            completed_bookings: completed,
            total_earnings: totalEarnings,
            recent_bookings: bookings || []
          },
          error: null,
          success: true
        };
      }

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id, status, created_at, total_price')
        .eq('client_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.warn('Error obteniendo reservas para estadísticas de cliente:', error);
      }

      return {
        data: {
          total_services: 0,
          active_services: 0,
          completed_services: 0,
          recent_services: [],
          recent_bookings: bookings || []
        },
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

// Exportar servicios de API adicionales
export * from './api/applications';
export * from './api/bookings';
export * from './api/reviews';
export * from './api/questions';
export * from './api/transactions';
export * from './api/admin';
export * from './api/escrow';
export * from './api/workerStats'; 