import { supabase } from '../supabase';
import type { ApiResponse } from '@/types/database';

// =====================================================
// TIPOS PARA NOTIFICACIONES
// =====================================================

// Solo notificaciones VITALES MÍNIMAS
export type NotificationType = 
  // Vitales - Pagos
  | 'payment_processed'
  | 'payment_released'
  | 'payment_issue'
  // Vitales - Servicios
  | 'service_created'
  | 'new_professional_applied'
  | 'client_selected_you'
  | 'service_cancelled'
  | 'service_completed'
  | 'client_rejected_application'
  // Vitales - Chat
  | 'new_message';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, any>;
  is_read: boolean;
  is_critical: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationData {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  is_critical?: boolean;
}

// =====================================================
// SERVICIO DE NOTIFICACIONES
// =====================================================

export const notificationService = {
  /**
   * Obtener todas las notificaciones del usuario actual
   */
  async getMyNotifications(): Promise<ApiResponse<Notification[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('id, user_id, type, title, message, is_read, is_critical, created_at, updated_at, metadata')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: notifications || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener notificaciones',
        success: false
      };
    }
  },

  /**
   * Obtener notificaciones no leídas
   */
  async getUnreadNotifications(): Promise<ApiResponse<Notification[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('id, user_id, type, title, message, is_read, is_critical, created_at, updated_at, metadata')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: notifications || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener notificaciones',
        success: false
      };
    }
  },

  /**
   * Contar notificaciones no leídas
   */
  async getUnreadCount(): Promise<ApiResponse<number>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      return {
        data: count || 0,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al contar notificaciones',
        success: false
      };
    }
  },

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al marcar notificación como leída',
        success: false
      };
    }
  },

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al marcar notificaciones como leídas',
        success: false
      };
    }
  },

  /**
   * Crear una notificación
   * Usa insert directo ya que la política RLS permite que los usuarios creen notificaciones para sí mismos
   */
  async createNotification(data: CreateNotificationData): Promise<ApiResponse<Notification>> {
    try {
      console.log('🔔 notificationService.createNotification - Datos:', data);
      
      // Verificar que el usuario esté autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar que el usuario esté creando la notificación para sí mismo
      if (user.id !== data.user_id) {
        console.warn('⚠️ Intentando crear notificación para otro usuario:', { currentUser: user.id, targetUser: data.user_id });
        // No lanzar error, solo registrar advertencia
      }

      // Intentar insert directo (la política RLS debería permitirlo)
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.user_id,
          type: data.type,
          title: data.title,
          message: data.message,
          metadata: data.metadata || {},
          is_critical: data.is_critical || false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error al insertar notificación:', error);
        console.error('❌ Detalles completos del error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          error: JSON.stringify(error, null, 2)
        });
        
        // Si es un error de RLS o permisos, intentar con la función RPC
        if (error.code === '42501' || error.message?.includes('policy') || error.message?.includes('permission') || error.message?.includes('row-level')) {
          console.log('🔄 Intentando con función RPC debido a error de permisos...');
          try {
            const { data: notificationId, error: rpcError } = await supabase
              .rpc('create_notification', {
                p_user_id: data.user_id,
                p_type: data.type,
                p_title: data.title,
                p_message: data.message,
                p_metadata: data.metadata || {},
                p_is_critical: data.is_critical || false
              });

            if (rpcError) {
              console.error('❌ Error en RPC también:', rpcError);
              throw rpcError;
            }

            console.log('✅ RPC exitosa, notificationId:', notificationId);

            // Obtener la notificación creada
            const { data: notification, error: fetchError } = await supabase
              .from('notifications')
              .select('*')
              .eq('id', notificationId)
              .single();

            if (fetchError) {
              console.error('❌ Error al obtener notificación creada:', fetchError);
              throw fetchError;
            }

            console.log('✅ Notificación creada vía RPC:', notification);

            return {
              data: notification,
              error: null,
              success: true
            };
          } catch (rpcErr) {
            console.error('❌ Error completo en RPC:', rpcErr);
            throw error; // Lanzar el error original
          }
        }
        
        throw error;
      }

      console.log('✅ Notificación creada exitosamente:', notification);

      return {
        data: notification,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('❌ Error completo al crear notificación:', error);
      const errorMessage = error instanceof Error 
        ? `${error.message}${(error as any).code ? ` (code: ${(error as any).code})` : ''}`
        : 'Error desconocido al crear notificación';
      
      return {
        data: null,
        error: errorMessage,
        success: false
      };
    }
  },

  /**
   * Eliminar notificación
   */
  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al eliminar notificación',
        success: false
      };
    }
  },

  /**
   * Subscribirse a nuevas notificaciones en tiempo real
   */
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    const channel = supabase
      .channel(`notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }
};

