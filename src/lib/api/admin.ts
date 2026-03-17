import { ensureAdminSession, getSupabaseAdmin } from '../supabase';
const supabase = getSupabaseAdmin();
import type { ApiResponse } from '@/types/database';

// =====================================================
// TIPOS PARA ADMINISTRACIÓN
// =====================================================

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CommissionSetting {
  percentage: number;
}

// =====================================================
// SERVICIO DE ADMINISTRACIÓN
// =====================================================

export const adminService = {
  /**
   * Obtener todas las configuraciones del sistema
   */
  async getSystemSettings(): Promise<ApiResponse<SystemSetting[]>> {
    try {
      await ensureAdminSession();

      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key');

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener configuraciones',
        success: false
      };
    }
  },

  /**
   * Obtener configuración específica
   */
  async getSetting(key: string): Promise<ApiResponse<SystemSetting>> {
    try {
      await ensureAdminSession();

      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', key)
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
        error: error instanceof Error ? error.message : 'Error al obtener configuración',
        success: false
      };
    }
  },

  /**
   * Actualizar configuración
   */
  async updateSetting(key: string, value: any, description?: string): Promise<ApiResponse<SystemSetting>> {
    try {
      await ensureAdminSession();

      const settingData = {
        key,
        value: JSON.stringify(value), // Convertir explícitamente a string JSON para JSONB
        description,
        updated_at: new Date().toISOString()
      };
      
      // Primero verificar si existe el registro
      const { data: existingData } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', key)
        .single();

      let data, error;

      if (existingData) {
        // Actualizar registro existente
        const result = await supabase
          .from('system_settings')
          .update({
            value: JSON.stringify(value),
            description,
            updated_at: new Date().toISOString()
          })
          .eq('key', key)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Crear nuevo registro
        const result = await supabase
          .from('system_settings')
          .insert(settingData)
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Error updating setting:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al actualizar configuración',
        success: false
      };
    }
  },

  /**
   * Obtener porcentaje de comisión
   */
  async getCommissionPercentage(): Promise<ApiResponse<number>> {
    try {
      // Acceso directo sin verificar sesión de admin
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'commission_percentage')
        .single();
      
      if (error) {
        throw error;
      }

      if (data) {
        // El valor viene como JSONB, puede ser string JSON o número directo
        let percentage: number;
        if (typeof data.value === 'string') {
          try {
            percentage = JSON.parse(data.value);
          } catch {
            percentage = parseFloat(data.value);
          }
        } else {
          percentage = data.value;
        }
        
        return {
          data: percentage || 10, // Porcentaje por defecto
          error: null,
          success: true
        };
      }
      
      return {
        data: 10, // Porcentaje por defecto
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: 10, // Porcentaje por defecto
        error: null,
        success: true
      };
    }
  },

  /**
   * Actualizar porcentaje de comisión
   */
  async updateCommissionPercentage(percentage: number): Promise<ApiResponse<SystemSetting>> {
    if (percentage < 0 || percentage > 100) {
      return {
        data: null,
        error: 'El porcentaje debe estar entre 0 y 100',
        success: false
      };
    }

    return this.updateSetting(
      'commission_percentage',
      percentage, // Enviar como número, no como string
      'Porcentaje de comisión aplicado a los precios de los trabajadores'
    );
  },

  /**
   * Obtener estadísticas del sistema (alias para getSystemStats)
   */
  async getStats(): Promise<ApiResponse<any>> {
    return this.getSystemStats();
  },

  /**
   * Obtener lista de usuarios
   */
  async getUsers(params: { search?: string; limit?: number; offset?: number } = {}): Promise<ApiResponse<any>> {
    try {
      await ensureAdminSession();

      let query = supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
        count: count || 0
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener usuarios',
        success: false
      };
    }
  },

  /**
   * Obtener transacciones
   */
  async getTransactions(params: { status?: string; limit?: number; offset?: number } = {}): Promise<ApiResponse<any>> {
    try {
      await ensureAdminSession();

      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
        count: count || 0
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener transacciones',
        success: false
      };
    }
  },

  /**
   * Obtener servicios
   */
  async getServices(params: { status?: string; limit?: number; offset?: number } = {}): Promise<ApiResponse<any>> {
    try {
      await ensureAdminSession();

      let query = supabase
        .from('services')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
        count: count || 0
      };
    } catch (error) {
      console.error('Error fetching services:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener servicios',
        success: false
      };
    }
  },

  /**
   * Obtener balance de usuario calculado directamente desde las transacciones
   * Balance = SUM(recargas) - SUM(débitos) - SUM(retiros)
   * Solo considera transacciones completadas
   */
  async getUserBalance(userId: string): Promise<ApiResponse<any>> {
    try {
      await ensureAdminSession();

      // Calcular balance usando GROUP BY: recargas - débitos - retiros
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', userId)
        .in('status', ['completado', 'completada']);

      if (error) throw error;

      // Calcular balance: SUM(recargas) - SUM(débitos) - SUM(retiros)
      let balance = 0;
      
      transactions?.forEach(transaction => {
        if (transaction.type === 'recarga') {
          balance += Number(transaction.amount);
        } else if (transaction.type === 'debito' || transaction.type === 'retiro') {
          balance -= Number(transaction.amount);
        }
      });

      return {
        data: balance,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Error fetching user balance:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener balance',
        success: false
      };
    }
  },

  /**
   * Actualizar estado de transacción
   */
  async updateTransactionStatus(transactionId: string, status: string): Promise<ApiResponse<any>> {
    try {
      await ensureAdminSession();

      // Obtener la transacción antes de actualizar para verificar el estado anterior
      const { data: oldTransaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      const { data, error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;

      // Si el status cambió a 'completado' y antes no estaba completado, enviar notificación + WhatsApp
      if (status === 'completado' && oldTransaction && oldTransaction.status !== 'completado') {
        try {
          const isClient = data.type === 'recarga';
          const source = data.type === 'retiro' ? ('retiro' as const) : ('escrow' as const);
          const { notifyPaymentProcessed } = await import('@/lib/utils/notificationHelpers');
          await notifyPaymentProcessed(
            data.user_id,
            data.amount,
            data.id,
            isClient,
            isClient ? undefined : source
          );
        } catch (notifError) {
          // No fallar la actualización si la notificación falla
          console.warn('⚠️ Error enviando notificación de pago procesado:', notifError);
        }
      }

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
   * Obtener estadísticas del sistema
   */
  async getSystemStats(): Promise<ApiResponse<any>> {
    try {
      await ensureAdminSession();

      // Obtener estadísticas básicas
      const [
        { count: totalUsers },
        { count: totalWorkers },
        { count: totalServices },
        { count: totalApplications },
        { count: totalEscrowTransactions },
        { count: totalTransactions },
        { count: completedServices },
        { count: pendingServices }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('worker_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('escrow_transactions').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('status', 'contratando')
      ]);

      // Calcular volumen total de transacciones
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('status', 'completed');

      const totalVolume = transactions?.reduce((sum, transaction) => {
        return transaction.type === 'recarga' ? sum + transaction.amount : sum;
      }, 0) || 0;

      // Calcular comisiones ganadas usando consulta SQL directa
      const { data: commissionData } = await supabase
        .from('escrow_transactions')
        .select(`
          amount,
          applications!inner(proposed_price)
        `)
        .eq('status', 'completada')
        .eq('applications.status', 'accepted');

      let totalCommissionsEarned = 0;
      let totalServicesWithCommission = 0;

      if (commissionData) {
        commissionData.forEach(escrow => {
          const applications = escrow.applications as any[];
          if (applications && applications.length > 0) {
            const application = applications[0];
            if (application && application.proposed_price) {
              const commissionAmount = Number(escrow.amount) - Number(application.proposed_price);
              if (commissionAmount > 0) {
                totalCommissionsEarned += commissionAmount;
                totalServicesWithCommission++;
              }
            }
          }
        });
      }

      return {
        data: {
          totalUsers: totalUsers || 0,
          totalWorkers: totalWorkers || 0,
          totalServices: totalServices || 0,
          totalApplications: totalApplications || 0,
          totalEscrowTransactions: totalEscrowTransactions || 0,
          totalTransactions: totalTransactions || 0,
          completedServices: completedServices || 0,
          pendingServices: pendingServices || 0,
          totalVolume: totalVolume,
          totalCommissionsEarned: totalCommissionsEarned,
          totalServicesWithCommission: totalServicesWithCommission
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