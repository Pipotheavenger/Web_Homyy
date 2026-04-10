import { supabase } from '../supabase';
import type { ApiResponse } from '@/types/database';
import type { User } from '@supabase/supabase-js';
import { validateSensitiveData } from '@/lib/utils/sensitive-data-validator';

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
    status?: string;
    service: {
      title: string;
    };
  };
  client?: {
    id: string;
    name: string;
    phone: string | null;
    profile_picture_url: string | null;
  };
  worker?: {
    id: string;
    name: string;
    phone: string | null;
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
  original_message?: string | null;
  is_blocked?: boolean;
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
      // Solo permitir chats para servicios activos (scheduled o in_progress)
      // Los servicios completados o cancelados no permiten chat
      const validStatuses = ['scheduled', 'in_progress'];
      if (!validStatuses.includes(booking.status)) {
        throw new Error('El chat solo está disponible para servicios activos');
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
          client:user_profiles!chats_client_id_fkey(id, name, phone, profile_picture_url),
          worker:user_profiles!chats_worker_id_fkey(id, name, phone, profile_picture_url)
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
          client:user_profiles!chats_client_id_fkey(id, name, phone, profile_picture_url),
          worker:user_profiles!chats_worker_id_fkey(id, name, phone, profile_picture_url)
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
   * Solo muestra chats de servicios activos (scheduled o in_progress)
   * Los chats de servicios completados o cancelados se ocultan
   */
  async getMyChats(): Promise<ApiResponse<Chat[]>> {
    try {
      const user = await getAuthenticatedUser();

      // Obtener bookings con sus servicios y filtrar por estado del servicio
      const { data: bookingsWithServices, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          completed_at,
          service:services!inner(
            id,
            status
          )
        `)
        .or(`client_id.eq.${user.id},worker_id.eq.${user.id}`);

      if (bookingsError) {
        throw bookingsError;
      }

      // Filtrar solo bookings donde el servicio NO esté completado o cancelado
      const activeBookings = bookingsWithServices?.filter(booking => {
        const service = Array.isArray(booking.service) ? booking.service[0] : booking.service;
        const serviceStatus = service?.status;
        return serviceStatus !== 'completed' && serviceStatus !== 'cancelled';
      }) || [];

      if (activeBookings.length === 0) {
        return { data: [], error: null, success: true };
      }

      const activeBookingIds = activeBookings.map(b => b.id);

      // Obtener chats de bookings activos con datos relacionados
      const { data: chats, error } = await supabase
        .from('chats')
        .select(`
          *,
          booking:bookings!inner(
            id,
            status,
            service:services(title)
          ),
          client:user_profiles!chats_client_id_fkey(id, name, phone, profile_picture_url),
          worker:user_profiles!chats_worker_id_fkey(id, name, phone, profile_picture_url)
        `)
        .in('booking_id', activeBookingIds)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(20);

      if (error) {
        throw error;
      }

      if (!chats || chats.length === 0) {
        return { data: [], error: null, success: true };
      }

      // Filtrar chats que no tengan booking activo
      const activeChats = chats.filter(chat => {
        const booking = Array.isArray(chat.booking) ? chat.booking[0] : chat.booking;
        const bookingStatus = booking?.status;
        return bookingStatus === 'scheduled' || bookingStatus === 'in_progress';
      });

      if (activeChats.length === 0) {
        return { data: [], error: null, success: true };
      }

      // Calcular mensajes no leídos en una sola query
      const chatIds = activeChats.map(chat => chat.id);
      const { data: unreadCounts } = await supabase
        .from('chat_messages')
        .select('chat_id')
        .in('chat_id', chatIds)
        .eq('is_read', false)
        .neq('sender_id', user.id);

      const unreadMap = new Map<string, number>();
      if (unreadCounts) {
        unreadCounts.forEach(msg => {
          const current = unreadMap.get(msg.chat_id) || 0;
          unreadMap.set(msg.chat_id, current + 1);
        });
      }

      const chatsWithUnread = activeChats.map(chat => ({
        ...chat,
        unread_count: unreadMap.get(chat.id) || 0
      }));

      return { data: chatsWithUnread, error: null, success: true };
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
  async getMessages(chatId: string, limit: number = 100): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const user = await getAuthenticatedUser();

      // ✅ OPTIMIZACIÓN: Verificar acceso y obtener mensajes en paralelo
      const [chatResult, messagesResult] = await Promise.all([
        // Verificar que el usuario tiene acceso al chat
        supabase
          .from('chats')
          .select('client_id, worker_id')
          .eq('id', chatId)
          .single(),
        
        // ✅ OPTIMIZACIÓN: Cargar solo los últimos mensajes primero (más rápido)
        // Cargar desde el más reciente hacia atrás para mostrar los últimos N mensajes
        supabase
          .from('chat_messages')
          .select(`
            *,
            sender:user_profiles!chat_messages_sender_id_fkey(id, name, profile_picture_url)
          `)
          .eq('chat_id', chatId)
          .order('created_at', { ascending: false })
          .limit(limit)
      ]);

      const { data: chat, error: chatError } = chatResult;
      const { data: messages, error: messagesError } = messagesResult;

      if (chatError || !chat) throw new Error('Chat no encontrado');
      if (chat.client_id !== user.id && chat.worker_id !== user.id) {
        throw new Error('No tienes acceso a este chat');
      }

      if (messagesError) throw messagesError;

      // ✅ Invertir orden para mostrar del más antiguo al más reciente
      const sortedMessages = (messages || []).reverse();

      return {
        data: sortedMessages,
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
      const user = await getAuthenticatedUser();

      // Verificar que el usuario es parte del chat
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('client_id, worker_id')
        .eq('id', data.chat_id)
        .single();

      if (chatError) throw new Error('Chat no encontrado');
      if (chat.client_id !== user.id && chat.worker_id !== user.id) {
        throw new Error('No tienes permiso para enviar mensajes en este chat');
      }

      const messageType = data.message_type || 'text';
      
      // Solo validar información sensible para mensajes de texto (no para imágenes/documentos)
      const shouldValidate = messageType === 'text';
      const validation = shouldValidate 
        ? validateSensitiveData(data.message)
        : { displayMessage: data.message, originalMessage: data.message, isBlocked: false };

      // Crear el mensaje guardando el mensaje original y la flag de bloqueado
      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: data.chat_id,
          sender_id: user.id,
          message: validation.displayMessage, // Mensaje a mostrar (bloqueado o original)
          original_message: validation.originalMessage, // Mensaje original siempre guardado
          is_blocked: validation.isBlocked, // Flag de bloqueado
          message_type: messageType,
          is_read: false
        })
        .select(`
          *,
          sender:user_profiles!chat_messages_sender_id_fkey(id, name, profile_picture_url)
        `)
        .single();

      if (error) throw error;

      // Actualizar el chat con el último mensaje
      const lastMessageDisplay = messageType === 'image' ? '📷 Imagen' : validation.displayMessage;
      await supabase
        .from('chats')
        .update({
          last_message: lastMessageDisplay,
          last_message_at: new Date().toISOString()
        })
        .eq('id', data.chat_id);

      // Retornar el mensaje con los campos correctos
      const messageWithValidation = {
        ...message,
        message: validation.displayMessage,
        original_message: validation.originalMessage,
        is_blocked: validation.isBlocked
      };

      return {
        data: messageWithValidation,
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

          // El mensaje ya viene reemplazado de la BD si contenía datos sensibles
          // porque el reemplazo se hace antes de insertar
          callback({
            ...(payload.new as ChatMessage),
            sender: sender || undefined
          });
        }
      )
      .subscribe();

    // Retornar función para desuscribirse y limpiar el canal completamente
    return () => {
      channel.unsubscribe();
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
