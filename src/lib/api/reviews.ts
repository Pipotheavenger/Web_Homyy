import { supabase } from '../supabase';
import type { ApiResponse } from '@/types/database';

export interface Review {
  id: string;
  service_id: string;
  reviewer_id: string;
  professional_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: { name: string; profile_picture_url: string | null };
}

export interface CreateReviewData {
  service_id: string;
  professional_id: string;
  rating: number;
  comment?: string;
}

export const reviewsService = {
  async create(data: CreateReviewData): Promise<ApiResponse<Review>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Validar datos requeridos
      if (!data.service_id) {
        throw new Error('service_id es requerido');
      }
      if (!data.professional_id) {
        throw new Error('professional_id es requerido');
      }
      if (!data.rating || data.rating < 1 || data.rating > 5) {
        throw new Error('rating debe ser un número entre 1 y 5');
      }

      const insertData = {
        service_id: data.service_id,
        reviewer_id: user.id,
        professional_id: data.professional_id,
        rating: data.rating,
        comment: data.comment && data.comment.trim() ? data.comment.trim() : null
      };

      console.log('Creating review with data:', insertData);

      const { data: review, error } = await supabase
        .from('reviews')
        .insert(insertData)
        .select('*')
        .single();

      if (error) {
        // Extraer información detallada del error
        const errorDetails = {
          message: error.message || 'Error desconocido',
          details: error.details || null,
          hint: error.hint || null,
          code: (error as any)?.code || null,
          fullError: error
        };
        
        console.error('Error creating review - Detalles completos:', JSON.stringify(errorDetails, null, 2));
        
        // Crear mensaje de error más descriptivo
        let errorMessage = 'Error al crear reseña';
        if (error.message) {
          errorMessage = error.message;
        } else if (error.details) {
          errorMessage = error.details;
        } else if (error.hint) {
          errorMessage = error.hint;
        }
        
        // Manejar errores específicos comunes
        if ((error as any)?.code === '23503') {
          errorMessage = 'Error: El servicio o trabajador especificado no existe';
        } else if ((error as any)?.code === '23505') {
          errorMessage = 'Ya existe una reseña para este servicio';
        } else if ((error as any)?.code === '23502') {
          errorMessage = 'Faltan campos requeridos en la reseña';
        }
        
        throw new Error(errorMessage);
      }
      
      if (!review) {
        throw new Error('No se pudo crear la reseña: respuesta vacía del servidor');
      }
      
      console.log('Review created successfully:', review);
      return { data: review, error: null, success: true };
    } catch (error) {
      console.error('Exception in create review:', error);
      
      // Extraer mensaje de error de forma más robusta
      let errorMessage = 'Error al crear reseña';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = (error as any).message || (error as any).error || JSON.stringify(error);
      }
      
      return {
        data: null,
        error: errorMessage,
        success: false
      };
    }
  },

  async getByProfessional(professionalId: string): Promise<ApiResponse<Review[]>> {
    try {
      // professional_id es el id de la tabla professionals (no el user_id)
      // Primero intentar con la relación completa
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:user_profiles!reviews_reviewer_id_fkey(
            id,
            name,
            email,
            profile_picture_url
          ),
          service:services(
            id,
            title
          )
        `)
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false });

      // Si hay error relacionado con foreign keys, intentar sin las relaciones
      if (error) {
        const errorCode = (error as any)?.code;
        const errorMessage = (error as any)?.message || '';
        
        // Si es un error de foreign key, intentar query simple sin joins
        if (errorCode === 'PGRST116' || errorMessage.includes('foreign key') || errorMessage.includes('relation') || errorCode === '42703') {
          console.log('⚠️ Intento con query simple (sin relaciones)');
          const { data: simpleData, error: simpleError } = await supabase
            .from('reviews')
            .select('*')
            .eq('professional_id', professionalId)
            .order('created_at', { ascending: false });
          
          if (!simpleError && simpleData) {
            // Si funciona, retornar los datos básicos
            return { data: simpleData || [], error: null, success: true };
          }
        }
        
        // Si sigue fallando o es otro tipo de error, verificar si es porque no hay reseñas
        // Si no hay reseñas, Supabase normalmente retorna un array vacío sin error
        // Solo loguear errores inesperados
        if (errorCode !== 'PGRST116' && !errorMessage.includes('foreign key') && !errorMessage.includes('null value')) {
          console.warn('⚠️ Error obteniendo reseñas:', error);
        }
        
        // Retornar array vacío en caso de error (puede ser que simplemente no haya reseñas)
        return { data: [], error: null, success: true };
      }
      
      // Retornar los datos (pueden ser un array vacío si no hay reseñas)
      return { data: data || [], error: null, success: true };
    } catch (error) {
      // Si hay una excepción, retornar array vacío en lugar de fallar
      console.warn('⚠️ Excepción al obtener reseñas (no crítico):', error);
      return { data: [], error: null, success: true };
    }
  },

  async getByService(serviceId: string): Promise<ApiResponse<Review[]>> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener reseñas',
        success: false
      };
    }
  }
};

