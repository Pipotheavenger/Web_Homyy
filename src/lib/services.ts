import { supabase } from './supabase';
import type {
  Service,
  Category,
  CreateServiceData,
  UpdateServiceData,
  ServiceFilters,
  ApiResponse
} from '@/types/database';

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
  async getUserServices(): Promise<ApiResponse<Service[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener servicios sin relaciones para evitar problemas con RLS
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;

      if (!services || services.length === 0) {
        return { data: [], error: null, success: true };
      }

      // Obtener categorías por separado
      const categoryIds = [...new Set(services.map(s => s.category_id).filter(Boolean))];
      
      let categories = [];
      if (categoryIds.length > 0) {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .in('id', categoryIds);

        if (categoriesError) {
          console.warn('Error obteniendo categorías:', categoriesError);
        } else {
          categories = categoriesData || [];
        }
      }

      // Obtener datos de escrow_transactions para servicios contratados
      const serviceIds = services.map(s => s.id);
      let escrowData: Array<{ service_id: string; completion_pin: string; amount: number }> = [];
      if (serviceIds.length > 0) {
        const { data: escrowDataResponse, error: escrowError } = await supabase
          .from('escrow_transactions')
          .select('service_id, completion_pin, amount')
          .in('service_id', serviceIds);

        if (escrowError) {
          console.warn('Error obteniendo datos de escrow:', escrowError);
        } else {
          escrowData = escrowDataResponse || [];
        }
      }

      // Combinar servicios con sus categorías y datos de escrow
      const servicesWithCategories = services.map(service => {
        const category = categories.find(c => c.id === service.category_id);
        const escrow = escrowData.find(e => e.service_id === service.id);
        return {
          ...service,
          category: category || null,
          escrow_pin: escrow?.completion_pin || null,
          budget: escrow?.amount || service.escrow_amount || 0
        };
      });

      // Debug log para verificar PINs
      console.log('🔧 getUserServices - Servicios con escrow:', servicesWithCategories.map(s => ({
        id: s.id,
        title: s.title,
        status: s.status,
        escrow_pin: s.escrow_pin
      })));

      return { data: servicesWithCategories, error: null, success: true };
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
      // Primero obtenemos los servicios
      const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!services || services.length === 0) {
        return { data: [], error: null, success: true };
      }

      // Ahora enriquecemos cada servicio con sus relaciones
      const enrichedServices = await Promise.all(
        services.map(async (service) => {
          // Obtener categoría
          let category = null;
          if (service.category_id) {
            const { data: cat } = await supabase
              .from('categories')
              .select('*')
              .eq('id', service.category_id)
              .single();
            category = cat;
          }

          // Obtener schedules
          const { data: schedules } = await supabase
            .from('service_schedules')
            .select('*')
            .eq('service_id', service.id);


          // Obtener info del cliente
          let client = null;
          if (service.user_id) {
            const { data: userProfile } = await supabase
              .from('user_profiles')
              .select('name, profile_picture_url')
              .eq('user_id', service.user_id)
              .single();
            client = userProfile;
          }

          return {
            ...service,
            category,
            schedules: schedules || [],
            client
          };
        })
      );

      return { data: enrichedServices, error: null, success: true };
    } catch (error) {
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
          status: serviceData.status || 'active'
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

      // Primero eliminar todas las aplicaciones relacionadas al servicio
      const { error: applicationsError } = await supabase
        .from('applications')
        .delete()
        .eq('service_id', id);

      if (applicationsError) {
        console.warn('Error eliminando aplicaciones relacionadas:', applicationsError);
        // No fallar si hay error eliminando aplicaciones, continuar con el servicio
      }

      // Eliminar schedules relacionados
      const { error: schedulesError } = await supabase
        .from('service_schedules')
        .delete()
        .eq('service_id', id);

      if (schedulesError) {
        console.warn('Error eliminando horarios relacionados:', schedulesError);
        // No fallar si hay error eliminando schedules, continuar con el servicio
      }

      // Eliminar preguntas relacionadas
      const { error: questionsError } = await supabase
        .from('service_questions')
        .delete()
        .eq('service_id', id);

      if (questionsError) {
        console.warn('Error eliminando preguntas relacionadas:', questionsError);
        // No fallar si hay error eliminando preguntas, continuar con el servicio
      }

      // Finalmente eliminar el servicio
      const { error } = await supabase
        .from('services')
        .delete()
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
      let query = supabase
        .from('services')
        .select(`
          *,
          category:categories(*),
          client:user_profiles!services_user_id_fkey(name, profile_picture_url)
        `)
        .eq('status', 'active');

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
  async getAll(filters?: { is_available?: boolean; is_verified?: boolean }): Promise<ApiResponse<any[]>> {
    try {
      let query = supabase
        .from('worker_profiles')
        .select('*')
        .order('rating', { ascending: false });

      if (filters?.is_available !== undefined) {
        query = query.eq('is_available', filters.is_available);
      }
      if (filters?.is_verified !== undefined) {
        query = query.eq('is_verified', filters.is_verified);
      }

      const { data: workers, error } = await query;
      if (error) throw error;

      // Cargar información de usuario para cada trabajador
      if (workers && workers.length > 0) {
        const workersWithUsers = await Promise.all(
          workers.map(async (worker) => {
            const { data: userProfile } = await supabase
              .from('user_profiles')
              .select('name, email, phone, profile_picture_url')
              .eq('user_id', worker.user_id)
              .single();

            return {
              ...worker,
              user: userProfile
            };
          })
        );
        return { data: workersWithUsers, error: null, success: true };
      }

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
  async getProfile(): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
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
  async getDashboardStats(): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();

      if (profile?.user_type === 'worker') {
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*, service:services(title)')
          .eq('worker_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        const completed = bookings?.filter(b => b.status === 'completed').length || 0;
        const totalEarnings = bookings
          ?.filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + Number(b.total_price), 0) || 0;

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
      } else {
        const { data: services } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', user.id);

        const { data: bookings } = await supabase
          .from('bookings')
          .select('*')
          .eq('client_id', user.id)
          .limit(5);

        return {
          data: {
            total_services: services?.length || 0,
            active_services: services?.filter(s => s.status === 'active').length || 0,
            completed_services: services?.filter(s => s.status === 'completed').length || 0,
            recent_services: services?.slice(0, 5) || [],
            recent_bookings: bookings || []
          },
          error: null,
          success: true
        };
      }
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