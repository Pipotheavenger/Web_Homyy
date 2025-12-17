import { supabase } from '../supabase';
import type { ApiResponse } from '@/types/database';
import { BalanceService } from './balance';

// =====================================================
// TIPOS PARA ESCROW
// =====================================================

export interface EscrowTransaction {
  id: string;
  service_id: string;
  worker_id: string;
  client_id: string;
  amount: number;
  status: 'pending' | 'completada' | 'refunded';
  created_at: string;
  completed_at?: string;
  transaction_reference?: string;
}

export interface PinData {
  pin: string;
  generated_at: string;
}

// =====================================================
// SERVICIO DE ESCROW
// =====================================================

export const escrowService = {
  /**
   * Generar PIN único de 4 dígitos
   */
  generateUniquePin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  },

  /**
   * Verificar que el PIN sea único para el servicio
   */
  async isPinUnique(serviceId: string, pin: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('completion_pin')
        .eq('completion_pin', pin)
        .not('id', 'eq', serviceId)
        .single();

      // Si no hay datos, el PIN es único
      return !data;
    } catch (error) {
      // En caso de error, asumir que es único
      return true;
    }
  },

  /**
   * Generar PIN único para un servicio
   */
  async generateUniquePinForService(serviceId: string): Promise<string> {
    let pin: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      pin = this.generateUniquePin();
      isUnique = await this.isPinUnique(serviceId, pin);
      attempts++;
    } while (!isUnique && attempts < maxAttempts);

    if (!isUnique) {
      throw new Error('No se pudo generar un PIN único después de múltiples intentos');
    }

    return pin;
  },

  /**
   * Seleccionar trabajador y crear transacción de escrow
   */
  async selectWorker(
    serviceId: string,
    workerId: string,
    applicationId: string,
    originalPrice: number
  ): Promise<ApiResponse<{ pin: string; escrowId: string }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Verificar que el usuario es dueño del servicio
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('user_id, status')
        .eq('id', serviceId)
        .single();

      if (serviceError) throw new Error('Servicio no encontrado');
      if (service.user_id !== user.id) {
        throw new Error('No tienes permiso para seleccionar trabajadores en este servicio');
      }
      if (service.status !== 'active') {
        throw new Error('Este servicio ya no está disponible');
      }

      // Verificar que la aplicación existe y está pendiente
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .eq('service_id', serviceId)
        .eq('worker_id', workerId)
        .eq('status', 'pending')
        .single();

      if (appError) throw new Error('Aplicación no encontrada o ya procesada');

      // Obtener porcentaje de comisión
      const { data: commissionSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'commission_percentage')
        .single();

      const commissionPercentage = commissionSetting?.value ? 
        parseFloat(commissionSetting.value) : 10;

      // Calcular precio final con comisión
      const finalPrice = originalPrice * (1 + commissionPercentage / 100);

      // Verificar balance del usuario calculado desde transacciones
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .in('status', ['completado', 'completada']);

      if (transactionsError) {
        throw new Error('Error al obtener balance del usuario');
      }

      // Calcular balance: SUM(recargas) - SUM(débitos) - SUM(retiros)
      let currentBalance = 0;
      transactions?.forEach(transaction => {
        if (transaction.type === 'recarga') {
          currentBalance += Number(transaction.amount);
        } else if (transaction.type === 'debito' || transaction.type === 'retiro') {
          currentBalance -= Number(transaction.amount);
        }
      });

      if (currentBalance < finalPrice) {
        throw new Error('Saldo insuficiente para realizar esta transacción');
      }

      // Usar función RPC para seleccionar trabajador
      const { data: result, error: rpcError } = await supabase.rpc('escrow_service_select_worker', {
        service_uuid: serviceId,
        worker_uuid: workerId,
        application_uuid: applicationId,
        final_price: finalPrice
      });

      if (rpcError) {
        console.error('Error en RPC selectWorker:', rpcError);
        throw new Error('Error al seleccionar trabajador: ' + rpcError.message);
      }

      if (!result?.success) {
        throw new Error('Error al seleccionar trabajador');
      }

      return {
        data: { 
          pin: result.pin, 
          escrowId: result.escrow_transaction_id 
        },
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al seleccionar trabajador',
        success: false
      };
    }
  },

  /**
   * Completar trabajo con PIN
   */
  async completeWorkWithPin(
    serviceId: string,
    pin: string
  ): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Usar función RPC para completar servicio con PIN
      const { data: result, error: rpcError } = await supabase.rpc('complete_service_with_pin', {
        service_uuid: serviceId,
        worker_uuid: user.id,
        pin_code: pin
      });

      if (rpcError) {
        console.error('Error en RPC completeWorkWithPin:', rpcError);
        console.error('Detalles del error:', {
          serviceId,
          pin,
          userId: user.id,
          error: rpcError
        });
        throw new Error('Error al completar servicio: ' + rpcError.message);
      }

      console.log('Resultado de RPC:', result);

      if (!result || !result.success) {
        const errorMessage = result?.message || result?.error || 'Error al completar servicio';
        console.error('Error en resultado de RPC:', result);
        throw new Error(errorMessage);
      }

      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al completar trabajo',
        success: false
      };
    }
  },

  /**
   * Obtener transacciones de escrow del usuario
   */
  async getMyEscrowTransactions(): Promise<ApiResponse<EscrowTransaction[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('escrow_transactions')
        .select('*')
        .or(`worker_id.eq.${user.id},client_id.eq.${user.id}`)
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
        error: error instanceof Error ? error.message : 'Error al obtener transacciones de escrow',
        success: false
      };
    }
  }
};
