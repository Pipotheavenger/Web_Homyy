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
    setLoading(true);
    setError(null);
    
    const response = await chatService.getMyChats();
    
    if (response.success && response.data) {
      setChats(response.data);
    } else {
      setError(response.error);
    }
    
    setLoading(false);
  }, []);

  // Cargar mensajes de un chat específico
  const loadMessages = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    // Limpiar mensajes anteriores inmediatamente
    setMessages([]);
    
    const response = await chatService.getMessages(id);
    
    if (response.success && response.data) {
      setMessages(response.data);
      // Marcar mensajes como leídos
      await chatService.markMessagesAsRead(id);
    } else {
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

    try {
      const response = await chatService.sendMessage({
        chat_id: currentChatId,
        message: message.trim()
      });

      if (response.success && response.data) {
        // NO agregar el mensaje aquí - el realtime lo hará automáticamente
        // Esto evita duplicados
        
        // Recargar lista de chats para actualizar "último mensaje"
        loadChats();
        
        return true;
      }

      setError(response.error);
      return false;
    } catch (err) {
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
    let mounted = true;

    if (!chatId && mounted) {
      loadChats();
    }

    return () => {
      mounted = false;
    };
  }, [chatId, loadChats]);

  // Efecto para cargar mensajes cuando se selecciona un chat
  useEffect(() => {
    let mounted = true;

    if (chatId && mounted) {
      // Limpiar mensajes anteriores antes de cargar nuevos
      setMessages([]);
      loadMessages(chatId);
    } else if (mounted) {
      // Si no hay chatId, limpiar mensajes
      setMessages([]);
    }

    return () => {
      mounted = false;
    };
  }, [chatId, loadMessages]);

  // Efecto para suscribirse a mensajes en tiempo real
  useEffect(() => {
    if (!chatId) return;

    let mounted = true;

    const unsubscribe = chatService.subscribeToMessages(chatId, (newMessage) => {
      if (!mounted) return;

      setMessages(prev => {
        // Evitar duplicados
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });

      // Marcar como leído automáticamente si no soy el emisor
      if (mounted) {
        chatService.markMessagesAsRead(chatId);
      }
      
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

    // Cleanup: desuscribirse cuando el componente se desmonta o chatId cambia
    return () => {
      mounted = false;
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
