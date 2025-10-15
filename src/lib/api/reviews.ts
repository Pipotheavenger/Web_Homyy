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

      console.log('Creating review with data:', {
        service_id: data.service_id,
        reviewer_id: user.id,
        professional_id: data.professional_id,
        rating: data.rating,
        comment: data.comment || null
      });

      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          service_id: data.service_id,
          reviewer_id: user.id,
          professional_id: data.professional_id,
          rating: data.rating,
          comment: data.comment || null
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating review:', error);
        throw error;
      }
      
      console.log('Review created successfully:', review);
      return { data: review, error: null, success: true };
    } catch (error) {
      console.error('Exception in create review:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al crear reseña',
        success: false
      };
    }
  },

  async getByProfessional(professionalId: string): Promise<ApiResponse<Review[]>> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('professional_id', professionalId)
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

