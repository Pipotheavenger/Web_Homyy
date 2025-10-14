import { supabase } from '../supabase';

export interface Transaction {
  id: string;
  user_id: string;
  type: 'recarga' | 'retiro';
  amount: number;
  payment_method: 'nequi' | 'daviplata' | 'pse' | 'bancolombia' | 'bancodebogota';
  status: 'pendiente' | 'completado' | 'rechazado';
  transaction_reference?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
}

export interface CreateTransactionData {
  type: 'recarga' | 'retiro';
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
      const { data: transaction, error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

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
   * Obtener el balance total del usuario
   */
  async getBalance() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .eq('status', 'completado');

      if (error) throw error;

      let balance = 0;
      transactions?.forEach(t => {
        balance += Number(t.amount);
      });

      return {
        data: balance,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Error calculating balance:', error);
      return {
        data: 0,
        error: error instanceof Error ? error.message : 'Error al calcular balance',
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

