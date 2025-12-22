import { supabase } from '../supabase';
import { validateSensitiveData } from '@/lib/utils/sensitive-data-validator';

export interface ServiceQuestion {
  id: string;
  service_id: string;
  user_id: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  original_question?: string | null;
  original_answer?: string | null;
  is_blocked?: boolean;
  user?: {
    name: string;
    profile_picture_url?: string;
  };
}

export interface CreateQuestionData {
  service_id: string;
  question: string;
  is_public?: boolean;
}

export interface AnswerQuestionData {
  answer: string;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// =====================================================
// SERVICIO DE PREGUNTAS PÚBLICAS
// =====================================================

export const questionsService = {
  /**
   * Obtener todas las preguntas de un servicio
   */
  async getByService(serviceId: string): Promise<ApiResponse<ServiceQuestion[]>> {
    try {
      const { data: questions, error } = await supabase
        .from('service_questions')
        .select('*')
        .eq('service_id', serviceId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enriquecer con información del usuario
      if (questions && questions.length > 0) {
        const enrichedQuestions = await Promise.all(
          questions.map(async (q) => {
            const { data: userProfile } = await supabase
              .from('user_profiles')
              .select('name, profile_picture_url')
              .eq('user_id', q.user_id)
              .single();

            return {
              ...q,
              user: userProfile
            };
          })
        );

        return {
          data: enrichedQuestions,
          error: null,
          success: true
        };
      }

      return {
        data: questions || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener preguntas',
        success: false
      };
    }
  },

  /**
   * Crear una nueva pregunta
   */
  async create(data: CreateQuestionData): Promise<ApiResponse<ServiceQuestion>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Validar información sensible
      const validation = validateSensitiveData(data.question);

      const { data: question, error } = await supabase
        .from('service_questions')
        .insert({
          service_id: data.service_id,
          user_id: user.id,
          question: validation.displayMessage, // Mensaje a mostrar (bloqueado o original)
          original_question: validation.originalMessage, // Mensaje original siempre guardado
          is_blocked: validation.isBlocked, // Flag de bloqueado
          is_public: data.is_public !== undefined ? data.is_public : true
        })
        .select()
        .single();

      if (error) throw error;

      // Retornar la pregunta con los campos correctos
      const questionWithValidation = {
        ...question,
        question: validation.displayMessage,
        original_question: validation.originalMessage,
        is_blocked: validation.isBlocked
      };

      return {
        data: questionWithValidation,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al crear pregunta',
        success: false
      };
    }
  },

  /**
   * Responder una pregunta (solo el dueño del servicio)
   */
  async answer(questionId: string, data: AnswerQuestionData): Promise<ApiResponse<ServiceQuestion>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Validar información sensible
      const validation = validateSensitiveData(data.answer);

      // Obtener la pregunta actual para mantener el estado de bloqueo si ya estaba bloqueada
      const { data: currentQuestion } = await supabase
        .from('service_questions')
        .select('is_blocked')
        .eq('id', questionId)
        .single();

      const { data: question, error } = await supabase
        .from('service_questions')
        .update({
          answer: validation.displayMessage, // Mensaje a mostrar (bloqueado o original)
          original_answer: validation.originalMessage, // Mensaje original siempre guardado
          is_blocked: validation.isBlocked || currentQuestion?.is_blocked || false, // Flag de bloqueado (mantener si pregunta estaba bloqueada)
          answered_at: new Date().toISOString()
        })
        .eq('id', questionId)
        .select()
        .single();

      if (error) throw error;

      // Retornar la pregunta con los campos correctos
      const questionWithValidation = {
        ...question,
        answer: validation.displayMessage,
        original_answer: validation.originalMessage,
        is_blocked: validation.isBlocked || currentQuestion?.is_blocked || false
      };

      return {
        data: questionWithValidation,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al responder pregunta',
        success: false
      };
    }
  },

  /**
   * Eliminar una pregunta (solo el autor si no ha sido respondida)
   */
  async delete(questionId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('service_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al eliminar pregunta',
        success: false
      };
    }
  },

  /**
   * Editar una pregunta (solo el autor si no ha sido respondida)
   */
  async update(questionId: string, question: string): Promise<ApiResponse<ServiceQuestion>> {
    try {
      const { data, error } = await supabase
        .from('service_questions')
        .update({ question })
        .eq('id', questionId)
        .select()
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
        error: error instanceof Error ? error.message : 'Error al actualizar pregunta',
        success: false
      };
    }
  }
};

