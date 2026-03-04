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

      // Obtener porcentaje de comisión de la base de datos
      const { data: commissionSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'commission_percentage')
        .single();

      let commissionPercentage = 10; // Por defecto
      if (commissionSetting?.value) {
        // El valor puede venir como string JSON, string numérico o número directo
        if (typeof commissionSetting.value === 'string') {
          try {
            commissionPercentage = JSON.parse(commissionSetting.value);
          } catch {
            commissionPercentage = parseFloat(commissionSetting.value) || 10;
          }
        } else {
          commissionPercentage = commissionSetting.value;
        }
      }

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

      // Obtener el servicio para acceder a las imágenes antes de completarlo
      const { data: serviceData } = await supabase
        .from('services')
        .select('images')
        .eq('id', serviceId)
        .single();

      // Usar función RPC para completar servicio con PIN
      const { data: result, error: rpcError } = await supabase.rpc('complete_service_with_pin', {
        service_uuid: serviceId,
        worker_uuid: user.id,
        pin_code: pin
      });

      if (rpcError) {
        console.error('Error en RPC completeWorkWithPin:', rpcError);
        throw new Error('Error al completar servicio: ' + rpcError.message);
      }

      // Verificar si el resultado indica éxito
      // La función RPC debería retornar un objeto con success: true en caso de éxito
      const isSuccess = result && 
                        typeof result === 'object' && 
                        result.success === true &&
                        Object.keys(result).length > 0;
      
      if (!isSuccess) {
        // Si el resultado es un objeto vacío, null, undefined, o tiene success: false, es un error
        let errorMessage = 'PIN incorrecto. Verifica e intenta nuevamente.';
        
        // Verificar si el resultado tiene contenido útil
        const hasUsefulData = result && typeof result === 'object' && Object.keys(result).length > 0;
        
        // Intentar extraer mensaje de error del resultado si existe
        if (hasUsefulData) {
          errorMessage = result.message || result.error || result.error_message || errorMessage;
          // Solo loggear si hay un mensaje de error explícito y útil
          if (result.message || result.error || result.error_message) {
            console.warn('PIN incorrecto:', result.message || result.error || result.error_message);
          }
        }
        // No loggear objetos vacíos {} ni resultados sin mensajes útiles en consola
        
        throw new Error(errorMessage);
      }

      // ✅ NUEVO: Borrar imágenes del servicio del storage después de completarlo
      if (serviceData?.images && Array.isArray(serviceData.images) && serviceData.images.length > 0) {
        try {
          const deletePromises = serviceData.images.map(async (imageUrl: string) => {
            // Extraer el path del archivo desde la URL
            // Formato: https://...supabase.co/storage/v1/object/public/user-uploads/service-images/user_id/filename
            if (imageUrl.includes('/storage/v1/object/public/')) {
              const urlParts = imageUrl.split('/storage/v1/object/public/');
              if (urlParts.length === 2) {
                const pathParts = urlParts[1].split('/');
                const bucketName = pathParts[0];
                const filePath = pathParts.slice(1).join('/');
                
                // Solo borrar si es de service-images
                if (filePath.startsWith('service-images/')) {
                  const { error: deleteError } = await supabase.storage
                    .from(bucketName)
                    .remove([filePath]);
                  
                  if (deleteError) {
                    console.warn('Error eliminando imagen del storage:', deleteError);
                  }
                }
              }
            }
          });
          
          await Promise.allSettled(deletePromises);
        } catch (err) {
          console.warn('Error al borrar imágenes del servicio:', err);
          // No fallar la operación si falla el borrado de imágenes
        }
      }

      // Enviar notificación al trabajador cuando se liberan los fondos
      try {
        // Obtener la transacción de escrow para este servicio (la más reciente que esté completada)
        const { data: escrowTransactions } = await supabase
          .from('escrow_transactions')
          .select('id, amount, worker_id')
          .eq('service_id', serviceId)
          .eq('worker_id', user.id)
          .eq('status', 'completed')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (escrowTransactions && escrowTransactions.length > 0) {
          const escrowTransaction = escrowTransactions[0];
          if (escrowTransaction && escrowTransaction.amount) {
            const { notifyPaymentProcessed } = await import('@/lib/utils/notificationHelpers');
            await notifyPaymentProcessed(
              escrowTransaction.worker_id,
              escrowTransaction.amount,
              escrowTransaction.id,
              false,
              'escrow' // Pago al trabajador cuando el sistema libera fondos
            );
          }
        }
      } catch (notifError) {
        // No fallar la operación si la notificación falla
        console.warn('⚠️ Error enviando notificación de pago liberado:', notifError);
      }

      // Solo loggear en caso de éxito para debugging
      console.log('✅ Servicio completado exitosamente con PIN');

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
