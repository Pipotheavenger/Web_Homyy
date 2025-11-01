import { supabase } from '../supabase';
import type { ApiResponse } from '@/types/database';
import type { User } from '@supabase/supabase-js';

// =====================================================
// TIPOS PARA CHAT
// =====================================================

export interface Chat {
  id: string;
  booking_id: string;
  client_id: string;
  worker_id: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  // Relaciones
  booking?: {
    id: string;
    service: {
      title: string;
    };
  };
  client?: {
    id: string;
    name: string;
    email: string;
    profile_picture_url: string | null;
  };
  worker?: {
    id: string;
    name: string;
    email: string;
    profile_picture_url: string | null;
  };
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'image' | 'document';
  is_read: boolean;
  created_at: string;
  // Relaciones
  sender?: {
    id: string;
    name: string;
    profile_picture_url: string | null;
  };
}

export interface CreateChatData {
  booking_id: string;
}

export interface SendMessageData {
  chat_id: string;
  message: string;
  message_type?: 'text' | 'image' | 'document';
}

// Obtiene el usuario autenticado sin bloquear en llamadas posteriores.
const getAuthenticatedUser = async (): Promise<User> => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  if (sessionData.session?.user) {
    return sessionData.session.user;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  if (!userData.user) throw new Error('Usuario no autenticado');

  return userData.user;
};

// =====================================================
// SERVICIO DE CHAT
// =====================================================

export const chatService = {
  /**
   * Obtener o crear un chat para un booking específico
   */
  async getOrCreateChat(bookingId: string): Promise<ApiResponse<Chat>> {
    try {
      const user = await getAuthenticatedUser();

      // Primero verificar que el booking existe y el usuario es participante
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id,
          client_id,
          worker_id,
          status,
          service:services(title)
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError) throw new Error('Booking no encontrado');
      if (!booking) throw new Error('Booking no existe');

      // Verificar que el usuario es participante del booking
      if (booking.client_id !== user.id && booking.worker_id !== user.id) {
        throw new Error('No tienes acceso a este chat');
      }

      // Verificar que el booking tiene un estado que permite chat
      const validStatuses = ['scheduled', 'in_progress', 'completed'];
      if (!validStatuses.includes(booking.status)) {
        throw new Error('El chat solo está disponible para servicios contratados');
      }

      // Buscar chat existente
      const { data: existingChat } = await supabase
        .from('chats')
        .select(`
          *,
          booking:bookings(
            id,
            service:services(title)
          ),
          client:user_profiles!chats_client_id_fkey(id, name, email, profile_picture_url),
          worker:user_profiles!chats_worker_id_fkey(id, name, email, profile_picture_url)
        `)
        .eq('booking_id', bookingId)
        .maybeSingle();

      // Si existe, retornarlo
      if (existingChat) {
        return {
          data: existingChat,
          error: null,
          success: true
        };
      }

      // Si no existe, crearlo
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert({
          booking_id: bookingId,
          client_id: booking.client_id,
          worker_id: booking.worker_id
        })
        .select(`
          *,
          booking:bookings(
            id,
            service:services(title)
          ),
          client:user_profiles!chats_client_id_fkey(id, name, email, profile_picture_url),
          worker:user_profiles!chats_worker_id_fkey(id, name, email, profile_picture_url)
        `)
        .single();

      if (createError) throw createError;

      return {
        data: newChat,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener chat',
        success: false
      };
    }
  },

  /**
   * Obtener todas las conversaciones del usuario actual
   */
  async getMyChats(): Promise<ApiResponse<Chat[]>> {
    try {
      console.log('🔐 chatService.getMyChats: Obteniendo usuario...');
      const user = await getAuthenticatedUser();
      
      console.log('👤 chatService.getMyChats: Usuario autenticado:', user.id);

      console.log('📡 chatService.getMyChats: Consultando chats...');
      const { data: chats, error } = await supabase
        .from('chats')
        .select(`
          *,
          booking:bookings(
            id,
            status,
            service:services(title)
          ),
          client:user_profiles!chats_client_id_fkey(id, name, email, profile_picture_url),
          worker:user_profiles!chats_worker_id_fkey(id, name, email, profile_picture_url)
        `)
        .or(`client_id.eq.${user.id},worker_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      console.log('📊 chatService.getMyChats: Resultado query:', { 
        chats: chats?.length || 0, 
        error: error?.message || 'ninguno',
        errorDetails: error
      });

      if (error) throw error;

      // Calcular mensajes no leídos para cada chat
      const chatsWithUnread = await Promise.all(
        (chats || []).map(async (chat) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          return {
            ...chat,
            unread_count: count || 0
          };
        })
      );

      return {
        data: chatsWithUnread,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener chats',
        success: false
      };
    }
  },

  /**
   * Obtener mensajes de un chat específico
   */
  async getMessages(chatId: string): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const user = await getAuthenticatedUser();

      // Verificar que el usuario tiene acceso al chat
      const { data: chat } = await supabase
        .from('chats')
        .select('client_id, worker_id')
        .eq('id', chatId)
        .single();

      if (!chat) throw new Error('Chat no encontrado');
      if (chat.client_id !== user.id && chat.worker_id !== user.id) {
        throw new Error('No tienes acceso a este chat');
      }

      // Obtener mensajes
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:user_profiles!chat_messages_sender_id_fkey(id, name, profile_picture_url)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return {
        data: messages || [],
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al obtener mensajes',
        success: false
      };
    }
  },

  /**
   * Enviar un mensaje
   */
  async sendMessage(data: SendMessageData): Promise<ApiResponse<ChatMessage>> {
    try {
      console.log('📤 chatService.sendMessage: Iniciando...', data);
      const user = await getAuthenticatedUser();
      
      console.log('👤 chatService.sendMessage: Usuario:', user.id);

      // Verificar que el usuario es parte del chat
      console.log('🔍 chatService.sendMessage: Verificando permisos...');
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('client_id, worker_id')
        .eq('id', data.chat_id)
        .single();

      console.log('📊 chatService.sendMessage: Chat encontrado:', chat);
      if (chatError) throw new Error('Chat no encontrado');
      if (chat.client_id !== user.id && chat.worker_id !== user.id) {
        throw new Error('No tienes permiso para enviar mensajes en este chat');
      }

      // Crear el mensaje
      console.log('💾 chatService.sendMessage: Insertando mensaje...');
      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: data.chat_id,
          sender_id: user.id,
          message: data.message.trim(),
          message_type: data.message_type || 'text',
          is_read: false
        })
        .select(`
          *,
          sender:user_profiles!chat_messages_sender_id_fkey(id, name, profile_picture_url)
        `)
        .single();

      console.log('📊 chatService.sendMessage: Resultado:', { message, error });
      if (error) {
        console.error('❌ chatService.sendMessage: Error:', error);
        throw error;
      }

      // Actualizar el chat con el último mensaje
      console.log('🔄 chatService.sendMessage: Actualizando último mensaje del chat...');
      await supabase
        .from('chats')
        .update({
          last_message: data.message.trim(),
          last_message_at: new Date().toISOString()
        })
        .eq('id', data.chat_id);

      console.log('✅ chatService.sendMessage: Mensaje enviado y chat actualizado');

      return {
        data: message,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al enviar mensaje',
        success: false
      };
    }
  },

  /**
   * Marcar mensajes como leídos
   */
  async markMessagesAsRead(chatId: string): Promise<ApiResponse<void>> {
    try {
      const user = await getAuthenticatedUser();

      // Marcar como leídos todos los mensajes que NO sean del usuario actual
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .neq('sender_id', user.id)
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
        error: error instanceof Error ? error.message : 'Error al marcar mensajes como leídos',
        success: false
      };
    }
  },

  /**
   * Subscribirse a nuevos mensajes en tiempo real
   */
  subscribeToMessages(chatId: string, callback: (message: ChatMessage) => void) {
    const channel = supabase
      .channel(`chat_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          // Obtener información del sender
          const { data: sender } = await supabase
            .from('user_profiles')
            .select('id, name, profile_picture_url')
            .eq('user_id', payload.new.sender_id)
            .single();

          callback({
            ...(payload.new as ChatMessage),
            sender: sender || undefined
          });
        }
      )
      .subscribe();

    // Retornar función para desuscribirse
    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Verificar si existe un chat activo para un booking
   */
  async hasActiveChat(bookingId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('chats')
        .select('id')
        .eq('booking_id', bookingId)
        .maybeSingle();

      return !!data;
    } catch {
      return false;
    }
  }
};
