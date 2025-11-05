'use client';

import { useState, useEffect, useCallback } from 'react';
import { chatService, type Chat, type ChatMessage } from '@/lib/api/chat';

export const useChat = (chatId?: string) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar lista de chats
  const loadChats = useCallback(async () => {
    console.log('🔄 useChat: Cargando lista de chats...');
    setLoading(true);
    setError(null);
    
    const response = await chatService.getMyChats();
    console.log('📥 useChat: Respuesta de getMyChats:', response);
    
    if (response.success && response.data) {
      console.log('✅ useChat: Chats cargados:', response.data.length);
      setChats(response.data);
    } else {
      console.error('❌ useChat: Error al cargar chats:', response.error);
      setError(response.error);
    }
    
    setLoading(false);
  }, []);

  // Cargar mensajes de un chat específico
  const loadMessages = useCallback(async (id: string) => {
    console.log('📖 useChat: Cargando mensajes para chat:', id);
    setLoading(true);
    setError(null);
    // Limpiar mensajes anteriores inmediatamente
    setMessages([]);
    
    const response = await chatService.getMessages(id);
    
    if (response.success && response.data) {
      console.log('✅ useChat: Mensajes cargados:', response.data.length);
      setMessages(response.data);
      // Marcar mensajes como leídos
      await chatService.markMessagesAsRead(id);
    } else {
      console.error('❌ useChat: Error al cargar mensajes:', response.error);
      setError(response.error);
    }
    
    setLoading(false);
  }, []);

  // Enviar mensaje
  const sendMessage = useCallback(async (message: string, currentChatId?: string) => {
    if (!currentChatId) {
      setError('No hay chat seleccionado');
      return false;
    }

    if (!message.trim()) {
      setError('El mensaje no puede estar vacío');
      return false;
    }

    setSending(true);
    setError(null);

    console.log('📤 useChat.sendMessage: Enviando mensaje...', { message, currentChatId });

    try {
      const response = await chatService.sendMessage({
        chat_id: currentChatId,
        message: message.trim()
      });

      if (response.success && response.data) {
        console.log('✅ useChat.sendMessage: Mensaje enviado exitosamente');
        
        // NO agregar el mensaje aquí - el realtime lo hará automáticamente
        // Esto evita duplicados
        
        // Recargar lista de chats para actualizar "último mensaje"
        loadChats();
        
        return true;
      }

      console.error('❌ useChat.sendMessage: Error al enviar:', response.error);
      setError(response.error);
      return false;
    } catch (err) {
      console.error('💥 useChat.sendMessage: Excepción inesperada', err);
      const fallbackMessage = err instanceof Error ? err.message : 'Error inesperado al enviar el mensaje';
      setError(fallbackMessage);
      return false;
    } finally {
      setSending(false);
    }
  }, [loadChats]);

  // Obtener o crear chat para un booking
  const getOrCreateChatForBooking = useCallback(async (bookingId: string) => {
    setLoading(true);
    setError(null);

    const response = await chatService.getOrCreateChat(bookingId);

    if (response.success && response.data) {
      setLoading(false);
      return response.data;
    } else {
      setError(response.error);
      setLoading(false);
      return null;
    }
  }, []);

  // Efecto para cargar chats inicialmente
  useEffect(() => {
    if (!chatId) {
      loadChats();
    }
  }, [chatId, loadChats]);

  // Efecto para cargar mensajes cuando se selecciona un chat
  useEffect(() => {
    if (chatId) {
      console.log('🔄 useChat: chatId cambió a:', chatId);
      // Limpiar mensajes anteriores antes de cargar nuevos
      setMessages([]);
      loadMessages(chatId);
    } else {
      // Si no hay chatId, limpiar mensajes
      setMessages([]);
    }
  }, [chatId, loadMessages]);

  // Efecto para suscribirse a mensajes en tiempo real
  useEffect(() => {
    if (!chatId) return;

    console.log('🔔 useChat: Suscribiéndose a mensajes en tiempo real para chat:', chatId);
    const unsubscribe = chatService.subscribeToMessages(chatId, (newMessage) => {
      console.log('📨 useChat: Nuevo mensaje recibido:', newMessage);
      
      setMessages(prev => {
        // Evitar duplicados
        if (prev.some(msg => msg.id === newMessage.id)) {
          console.log('⚠️  useChat: Mensaje duplicado, ignorando');
          return prev;
        }
        console.log('✅ useChat: Agregando mensaje a la lista');
        return [...prev, newMessage];
      });

      // Marcar como leído automáticamente si no soy el emisor
      chatService.markMessagesAsRead(chatId);
      
      // Actualizar la lista de chats sin recargar todo
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              last_message: newMessage.message,
              last_message_at: newMessage.created_at
            };
          }
          return chat;
        });
      });
    });

    return () => {
      console.log('🔕 useChat: Desuscribiéndose de mensajes');
      unsubscribe();
    };
  }, [chatId]);

  return {
    chats,
    messages,
    loading,
    sending,
    error,
    sendMessage,
    loadChats,
    loadMessages,
    getOrCreateChatForBooking
  };
};
