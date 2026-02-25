import { supabase } from '../supabase';

export interface TermsAndConditions {
  id: string;
  content: string;
  updated_at: string;
  updated_by: string | null;
  version: number;
}

export const termsService = {
  /**
   * Obtener los términos y condiciones actuales
   */
  async getTerms(): Promise<{ success: boolean; data?: TermsAndConditions; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('terms_and_conditions')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error al obtener términos:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error en getTerms:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Actualizar los términos y condiciones
   */
  async updateTerms(content: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar autenticación básica
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'No autenticado' };
      }

      // No verificar permisos de admin - cualquiera con acceso al panel puede editar

      // Obtener el registro actual para incrementar la versión
      const { data: currentTerms } = await supabase
        .from('terms_and_conditions')
        .select('id, version')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (!currentTerms) {
        // Si no existe, crear uno nuevo
        const { error: insertError } = await supabase
          .from('terms_and_conditions')
          .insert({
            content,
            updated_by: user.id,
            version: 1
          });

        if (insertError) {
          console.error('Error al crear términos:', insertError);
          return { success: false, error: insertError.message };
        }

        return { success: true };
      }

      // Actualizar el registro existente
      const { error: updateError } = await supabase
        .from('terms_and_conditions')
        .update({
          content,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
          version: currentTerms.version + 1
        })
        .eq('id', currentTerms.id);

      if (updateError) {
        console.error('Error al actualizar términos:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error en updateTerms:', error);
      return { success: false, error: error.message };
    }
  }
};

