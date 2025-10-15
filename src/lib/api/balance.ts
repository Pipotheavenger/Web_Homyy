import { supabase } from '@/lib/supabase';

export class BalanceService {
  /**
   * Actualiza el balance de un usuario recalculando todas sus transacciones
   */
  static async updateUserBalance(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('update_user_balance_safe', {
        user_uuid: userId
      });

      if (error) {
        console.error('Error updating user balance:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error updating user balance:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene el balance actual de un usuario
   */
  static async getUserBalance(userId: string): Promise<{ balance: number; error?: string }> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user balance:', error);
        return { balance: 0, error: error.message };
      }

      return { balance: Number(profile?.balance || 0) };
    } catch (error: any) {
      console.error('Error fetching user balance:', error);
      return { balance: 0, error: error.message };
    }
  }
}
