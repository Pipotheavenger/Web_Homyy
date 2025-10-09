import { supabase } from '../supabase';

export const adminService = {
  /**
   * Obtener estadísticas generales del sistema
   */
  async getStats() {
    try {
      // Total de usuarios
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Total de trabajadores
      const { count: totalWorkers } = await supabase
        .from('worker_profiles')
        .select('*', { count: 'exact', head: true });

      // Total de servicios
      const { count: totalServices } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true });

      // Servicios activos
      const { count: activeServices } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Total de aplicaciones
      const { count: totalApplications } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true });

      // Total de transacciones
      const { count: totalTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      // Transacciones pendientes
      const { count: pendingTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendiente');

      // Volumen total de dinero en transacciones completadas
      const { data: completedTransactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('status', 'completado');

      let totalVolume = 0;
      completedTransactions?.forEach(t => {
        totalVolume += Number(t.amount);
      });

      return {
        data: {
          totalUsers: totalUsers || 0,
          totalWorkers: totalWorkers || 0,
          totalServices: totalServices || 0,
          activeServices: activeServices || 0,
          totalApplications: totalApplications || 0,
          totalTransactions: totalTransactions || 0,
          pendingTransactions: pendingTransactions || 0,
          totalVolume
        },
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas',
        success: false
      };
    }
  },

  /**
   * Obtener todos los usuarios con filtros
   */
  async getUsers(filters?: { search?: string; limit?: number; offset?: number }) {
    try {
      let query = supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        count: count || 0,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Error getting users:', error);
      return {
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Error al obtener usuarios',
        success: false
      };
    }
  },

  /**
   * Obtener balance de un usuario
   */
  async getUserBalance(userId: string) {
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', userId)
        .eq('status', 'completado');

      if (error) throw error;

      let balance = 0;
      transactions?.forEach(t => {
        if (t.type === 'recarga') {
          balance += Number(t.amount);
        } else if (t.type === 'retiro') {
          balance -= Number(t.amount);
        }
      });

      return {
        data: balance,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Error getting user balance:', error);
      return {
        data: 0,
        error: error instanceof Error ? error.message : 'Error al obtener balance',
        success: false
      };
    }
  },

  /**
   * Obtener todas las transacciones con filtros
   */
  async getTransactions(filters?: { 
    status?: string; 
    search?: string; 
    limit?: number; 
    offset?: number 
  }) {
    try {
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data: transactions, error, count } = await query;

      if (error) throw error;

      // Cargar información de usuarios por separado
      if (transactions && transactions.length > 0) {
        const userIds = [...new Set(transactions.map(t => t.user_id))];
        const { data: users } = await supabase
          .from('user_profiles')
          .select('user_id, name, email, phone')
          .in('user_id', userIds);

        // Crear un mapa de usuarios
        const userMap = new Map(users?.map(u => [u.user_id, u]) || []);

        // Agregar información de usuario a cada transacción
        const transactionsWithUsers = transactions.map(t => ({
          ...t,
          user: userMap.get(t.user_id) || null
        }));

        return {
          data: transactionsWithUsers,
          count: count || 0,
          error: null,
          success: true
        };
      }

      return {
        data: [],
        count: count || 0,
        error: null,
        success: true
      };
    } catch (error) {
      console.log('Error getting transactions:', error);
      return {
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Error al obtener transacciones',
        success: false
      };
    }
  },

  /**
   * Actualizar estado de una transacción (solo admin)
   */
  async updateTransactionStatus(
    transactionId: string, 
    status: 'pendiente' | 'completado' | 'rechazado'
  ) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Error updating transaction status:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al actualizar transacción',
        success: false
      };
    }
  },

  /**
   * Obtener servicios con filtros
   */
  async getServices(filters?: { status?: string; limit?: number; offset?: number }) {
    try {
      let query = supabase
        .from('services')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data: services, error, count } = await query;

      if (error) throw error;

      // Cargar categorías y usuarios por separado
      if (services && services.length > 0) {
        const categoryIds = [...new Set(services.map(s => s.category_id).filter(Boolean))];
        const userIds = [...new Set(services.map(s => s.user_id).filter(Boolean))];

        const [categoriesResponse, usersResponse] = await Promise.all([
          categoryIds.length > 0 
            ? supabase.from('categories').select('id, name').in('id', categoryIds)
            : Promise.resolve({ data: [] }),
          userIds.length > 0
            ? supabase.from('user_profiles').select('user_id, name, email').in('user_id', userIds)
            : Promise.resolve({ data: [] })
        ]);

        // Crear mapas
        const categoryMap = new Map(categoriesResponse.data?.map(c => [c.id, c]) || []);
        const userMap = new Map(usersResponse.data?.map(u => [u.user_id, u]) || []);

        // Agregar información a servicios
        const servicesWithRelations = services.map(s => ({
          ...s,
          category: s.category_id ? categoryMap.get(s.category_id) || null : null,
          user: s.user_id ? userMap.get(s.user_id) || null : null
        }));

        return {
          data: servicesWithRelations,
          count: count || 0,
          error: null,
          success: true
        };
      }

      return {
        data: [],
        count: count || 0,
        error: null,
        success: true
      };
    } catch (error) {
      console.log('Error getting services:', error);
      return {
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Error al obtener servicios',
        success: false
      };
    }
  },

  /**
   * Obtener transacciones de un usuario específico
   */
  async getUserTransactions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Error al obtener transacciones',
        success: false
      };
    }
  },

  /**
   * Obtener datos para gráficas
   */
  async getChartData() {
    try {
      // Transacciones por día (últimos 30 días)
      const { data: dailyTransactions } = await supabase
        .from('transactions')
        .select('created_at, amount, type, status')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      // Servicios por categoría
      const { data: servicesByCategory } = await supabase
        .from('services')
        .select('category_id, categories(name)')
        .not('category_id', 'is', null);

      // Usuarios registrados por mes
      const { data: usersByMonth } = await supabase
        .from('user_profiles')
        .select('created_at')
        .order('created_at', { ascending: true });

      return {
        data: {
          dailyTransactions: dailyTransactions || [],
          servicesByCategory: servicesByCategory || [],
          usersByMonth: usersByMonth || []
        },
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Error getting chart data:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener datos de gráficas',
        success: false
      };
    }
  }
};

