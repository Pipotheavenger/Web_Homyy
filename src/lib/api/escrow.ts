import { supabase } from '../supabase';
import type { ApiResponse } from '@/types/database';

// =====================================================
// TIPOS PARA ESCROW
// =====================================================

export interface EscrowTransaction {
  id: string;
  service_id: string;
  worker_id: string;
  client_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'refunded';
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

      // Verificar balance del usuario usando la columna precalculada
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        throw new Error('Error al obtener balance del usuario');
      }

      const currentBalance = Number(userProfile?.balance || 0);

      if (currentBalance < finalPrice) {
        throw new Error('Saldo insuficiente para realizar esta transacción');
      }

      // Generar PIN único
      const pin = await this.generateUniquePinForService(serviceId);

      // Crear transacción de escrow
      const { data: escrowTransaction, error: escrowError } = await supabase
        .from('escrow_transactions')
        .insert({
          service_id: serviceId,
          worker_id: workerId,
          client_id: user.id,
          amount: finalPrice,
          status: 'pending',
          transaction_reference: `ESCROW-${Date.now()}`
        })
        .select()
        .single();

      if (escrowError) throw new Error('Error al crear transacción de escrow');

      // Crear transacción de débito para el usuario
      const { error: debitError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'retiro',
          amount: finalPrice, // Usar valor positivo, el trigger lo manejará
          payment_method: 'platform',
          transaction_reference: `DEBIT-${Date.now()}`,
          description: `Escrow para servicio ${serviceId}`,
          status: 'completed'
        });

      if (debitError) {
        throw new Error('Error al procesar el pago: ' + debitError.message);
      }

      // Actualizar aplicación a aceptada
      const { error: updateAppError } = await supabase
        .from('applications')
        .update({ status: 'accepted' })
        .eq('id', applicationId);

      if (updateAppError) {
        throw new Error('Error al actualizar aplicación: ' + updateAppError.message);
      }

      // Rechazar otras aplicaciones
      const { error: rejectOthersError } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('service_id', serviceId)
        .neq('id', applicationId);

      if (rejectOthersError) throw new Error('Error al rechazar otras aplicaciones');

      // Actualizar servicio con PIN y estado
      const { error: updateServiceError } = await supabase
        .from('services')
        .update({
          status: 'in_progress',
          completion_pin: pin,
          pin_generated_at: new Date().toISOString(),
          escrow_amount: finalPrice,
          worker_final_amount: originalPrice
        })
        .eq('id', serviceId);

      if (updateServiceError) throw new Error('Error al actualizar servicio');

      return {
        data: { pin, escrowId: escrowTransaction.id },
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

      // Verificar PIN y obtener datos del servicio
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (serviceError) {
        console.error('Error fetching service:', serviceError);
        throw new Error('Servicio no encontrado');
      }
      
      if (service.completion_pin?.trim() !== pin.trim()) {
        throw new Error('PIN incorrecto');
      }
      if (service.status !== 'in_progress') {
        throw new Error('Este servicio no está en progreso');
      }

      // Verificar que el usuario es el trabajador asignado
      const { data: escrowTransaction, error: escrowError } = await supabase
        .from('escrow_transactions')
        .select('worker_id, amount, status')
        .eq('service_id', serviceId)
        .eq('status', 'pending')
        .single();

      if (escrowError) throw new Error('Transacción de escrow no encontrada');
      if (escrowTransaction.worker_id !== user.id) {
        throw new Error('No tienes permiso para completar este trabajo');
      }

      // Crear transacción de pago al trabajador
      const { error: paymentError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'recarga',
          amount: service.worker_final_amount,
          payment_method: 'platform',
          transaction_reference: `PAYOUT-${Date.now()}`,
          description: `Pago por completar servicio ${serviceId}`,
          status: 'completed'
        });

      if (paymentError) throw new Error('Error al procesar el pago al trabajador');

      // Actualizar transacción de escrow como completada
      const { error: updateEscrowError } = await supabase
        .from('escrow_transactions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('service_id', serviceId)
        .eq('status', 'pending');

      if (updateEscrowError) throw new Error('Error al actualizar escrow');

      // Marcar servicio como completado y habilitar reseñas
      const { error: updateServiceError } = await supabase
        .from('services')
        .update({
          status: 'completed'
        })
        .eq('id', serviceId);

      if (updateServiceError) throw new Error('Error al actualizar servicio');

      // Notificar al cliente que puede dejar una reseña
      // Esto se puede implementar con notificaciones en tiempo real o emails

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
