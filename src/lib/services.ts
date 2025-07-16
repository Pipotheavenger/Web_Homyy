import { supabase } from './supabase';
import type {
  Service,
  Category,
  ServiceSchedule,
  Professional,
  Transaction,
  CreateServiceData,
  UpdateServiceData,
  ServiceFilters,
  ApiResponse
} from '@/types/database';

// =====================================================
// SERVICIOS PARA CATEGORÍAS
// =====================================================

export const categoryService = {
  // Obtener todas las categorías
  async getAll(): Promise<ApiResponse<Category[]>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener categorías',
        success: false
      };
    }
  },

  // Obtener una categoría por ID
  async getById(id: string): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
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
  // Obtener servicios del usuario actual
  async getUserServices(): Promise<ApiResponse<Service[]>> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:categories(*),
          schedules:service_schedules(*)
        `)
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
        error: error instanceof Error ? error.message : 'Error al obtener servicios',
        success: false
      };
    }
  },

  // Obtener un servicio por ID
  async getById(id: string): Promise<ApiResponse<Service>> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:categories(*),
          schedules:service_schedules(*)
        `)
        .eq('id', id)
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
        error: error instanceof Error ? error.message : 'Error al obtener servicio',
        success: false
      };
    }
  },

  // Crear un nuevo servicio
  async create(serviceData: CreateServiceData): Promise<ApiResponse<Service>> {
    try {
      console.log('🔍 Verificando autenticación...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');
      console.log('✅ Usuario autenticado:', user.id);

      console.log('📝 Insertando servicio en la base de datos...');
      const serviceToInsert = {
        user_id: user.id,
        title: serviceData.title,
        description: serviceData.description,
        category_id: serviceData.category_id,
        location: serviceData.location || null,
        status: serviceData.status || 'active' // Usar 'active' como default según el esquema
        // No incluir price, applicants, created_at, updated_at - estos no existen o son automáticos
      };
      
      console.log('📤 Datos del servicio a insertar:', serviceToInsert);

      const { data, error } = await supabase
        .from('services')
        .insert(serviceToInsert)
        .select()
        .single();

      if (error) {
        console.error('❌ Error insertando servicio:', error);
        throw error;
      }

      console.log('✅ Servicio creado con ID:', data.id);

      // Si hay horarios, crearlos
      if (serviceData.schedules && serviceData.schedules.length > 0) {
        console.log('📅 Insertando horarios...');
        const schedules = serviceData.schedules.map(schedule => ({
          service_id: data.id,
          date_available: schedule.date, // Usar date_available según el esquema
          start_time: schedule.start_time,
          end_time: schedule.end_time
        }));

        console.log('📤 Horarios a insertar:', schedules);

        const { error: scheduleError } = await supabase
          .from('service_schedules')
          .insert(schedules);

        if (scheduleError) {
          console.error('❌ Error insertando horarios:', scheduleError);
          throw scheduleError;
        }

        console.log('✅ Horarios insertados correctamente');
      }

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('💥 Error en create service:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al crear servicio',
        success: false
      };
    }
  },

  // Actualizar un servicio
  async update(id: string, serviceData: UpdateServiceData): Promise<ApiResponse<Service>> {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(serviceData)
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
        error: error instanceof Error ? error.message : 'Error al actualizar servicio',
        success: false
      };
    }
  },

  // Eliminar un servicio
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al eliminar servicio',
        success: false
      };
    }
  },

  // Buscar servicios con filtros
  async search(filters: ServiceFilters): Promise<ApiResponse<Service[]>> {
    try {
      let query = supabase
        .from('services')
        .select(`
          *,
          category:categories(*)
        `);

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.price_min) {
        query = query.gte('price', filters.price_min);
      }

      if (filters.price_max) {
        query = query.lte('price', filters.price_max);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true
      };
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
// SERVICIOS PARA PROFESIONALES
// =====================================================

export const professionalService = {
  // Obtener todos los profesionales
  async getAll(): Promise<ApiResponse<Professional[]>> {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('name');

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener profesionales',
        success: false
      };
    }
  },

  // Obtener profesional por ID
  async getById(id: string): Promise<ApiResponse<Professional>> {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', id)
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
        error: error instanceof Error ? error.message : 'Error al obtener profesional',
        success: false
      };
    }
  },

  // Crear perfil profesional
  async create(professionalData: any): Promise<ApiResponse<Professional>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('professionals')
        .insert({
          user_id: user.id,
          ...professionalData
        })
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
        error: error instanceof Error ? error.message : 'Error al crear perfil profesional',
        success: false
      };
    }
  }
};

// =====================================================
// SERVICIOS PARA TRANSACCIONES
// =====================================================

export const transactionService = {
  // Obtener transacciones del usuario
  async getUserTransactions(): Promise<ApiResponse<Transaction[]>> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          service:services(*),
          professional:professionals(*)
        `)
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
        error: error instanceof Error ? error.message : 'Error al obtener transacciones',
        success: false
      };
    }
  }
};

// =====================================================
// SERVICIOS PARA ESTADÍSTICAS
// =====================================================

export const statsService = {
  // Obtener estadísticas del dashboard
  async getDashboardStats(): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener servicios del usuario
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id);

      if (servicesError) throw servicesError;

      // Obtener transacciones del usuario
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (transactionsError) throw transactionsError;

      // Calcular estadísticas
      const totalServices = services?.length || 0;
      const activeServices = services?.filter(s => s.status === 'active').length || 0;
      const totalEarnings = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      const stats = {
        services: {
          total_services: totalServices,
          active_services: activeServices,
          total_earnings: totalEarnings,
          average_rating: 0,
          total_reviews: 0
        },
        recent_services: services?.slice(0, 5) || [],
        recent_transactions: transactions || [],
        top_categories: []
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