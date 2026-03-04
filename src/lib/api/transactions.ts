import { supabase } from '../supabase';

export interface Transaction {
  id: string;
  user_id: string;
  type: 'recarga' | 'retiro' | 'debito';
  amount: number;
  payment_method: 'nequi' | 'daviplata' | 'pse' | 'bancolombia' | 'bancodebogota' | 'platform';
  status: 'pendiente' | 'completado' | 'rechazado' | 'completada';
  transaction_reference?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
}

export interface CreateTransactionData {
  type: 'recarga' | 'retiro' | 'debito';
  amount: number;
  payment_method: string;
  transaction_reference?: string;
  description?: string;
  status?: 'pendiente' | 'completado' | 'rechazado';
}

export const transactionsService = {
  /**
   * Crear una nueva transacción
   */
  async create(data: CreateTransactionData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: data.type,
          amount: data.amount,
          payment_method: data.payment_method,
          status: 'pendiente',
          transaction_reference: data.transaction_reference || `TXN-${Date.now()}`,
          description: data.description
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: transaction,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Error creating transaction:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al crear transacción',
        success: false
      };
    }
  },

  /**
   * Obtener todas las transacciones del usuario autenticado
   */
  async getMyTransactions() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: transactions || [],
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Error al obtener transacciones',
        success: false
      };
    }
  },

  /**
   * Obtener una transacción por ID
   */
  async getById(id: string) {
    try {
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        data: transaction,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener transacción',
        success: false
      };
    }
  },

  /**
   * Actualizar el estado de una transacción
   */
  async updateStatus(id: string, status: 'pendiente' | 'completado' | 'rechazado') {
    try {
      // Obtener la transacción antes de actualizar para verificar el estado anterior
      const { data: oldTransaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      const { data: transaction, error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Si el status cambió a 'completado' y antes no estaba completado, enviar notificación + WhatsApp
      if (status === 'completado' && oldTransaction && oldTransaction.status !== 'completado') {
        try {
          const isClient = transaction.type === 'recarga';
          const source = transaction.type === 'retiro' ? ('retiro' as const) : undefined;
          const { notifyPaymentProcessed } = await import('@/lib/utils/notificationHelpers');
          await notifyPaymentProcessed(
            transaction.user_id,
            transaction.amount,
            transaction.id,
            isClient,
            isClient ? undefined : (source ?? 'escrow')
          );
        } catch (notifError) {
          // No fallar la actualización si la notificación falla
          console.warn('⚠️ Error enviando notificación de pago procesado:', notifError);
        }
      }

      return {
        data: transaction,
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
   * Obtener el balance total del usuario calculado directamente desde las transacciones
   * Balance = SUM(recargas) - SUM(débitos) - SUM(retiros)
   * Solo considera transacciones completadas
   */
  async getBalance() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Calcular balance usando GROUP BY: recargas - débitos - retiros
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
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
      console.error('Error getting balance:', error);
      return {
        data: 0,
        error: error instanceof Error ? error.message : 'Error al obtener balance',
        success: false
      };
    }
  },

  /**
   * Obtener estadísticas de transacciones
   */
  async getStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('type, amount, status')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats = {
        total: transactions?.length || 0,
        pendientes: transactions?.filter(t => t.status === 'pendiente').length || 0,
        completadas: transactions?.filter(t => t.status === 'completado').length || 0,
        rechazadas: transactions?.filter(t => t.status === 'rechazado').length || 0,
        totalRecargas: transactions?.filter(t => t.type === 'recarga' && t.status === 'completado')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
        totalRetiros: Math.abs(transactions?.filter(t => t.type === 'retiro' && t.status === 'completado')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0)
      };

      return {
        data: stats,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Error getting transaction stats:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas',
        success: false
      };
    }
  }
};

