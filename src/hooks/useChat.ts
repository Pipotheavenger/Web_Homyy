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
    // ✅ OPTIMIZACIÓN: No bloquear UI mientras carga chats
    // Solo mostrar loading si no hay chats previos
    if (chats.length === 0) {
      setLoading(true);
    }
    setError(null);
    
    const response = await chatService.getMyChats();
    
    if (response.success && response.data) {
      // ✅ Actualizar chats inmediatamente (sin esperar loading)
      setChats(response.data);
      setLoading(false); // Quitar loading lo antes posible
    } else {
      setError(response.error);
      setLoading(false);
    }
  }, [chats.length]);

  // Cargar mensajes de un chat específico
  const loadMessages = useCallback(async (id: string) => {
    // ✅ OPTIMIZACIÓN: Limpiar mensajes anteriores inmediatamente para feedback visual
    setMessages([]);
    setError(null);
    
    // ✅ OPTIMIZACIÓN: No mostrar loading global (solo en el chat específico)
    // Esto permite que el usuario vea la lista de chats mientras carga mensajes
    
    const response = await chatService.getMessages(id);
    
    if (response.success && response.data) {
      setMessages(response.data);
      // ✅ OPTIMIZACIÓN: Marcar como leídos en segundo plano (no bloquea)
      chatService.markMessagesAsRead(id).catch(err => {
        console.warn('Error marcando mensajes como leídos:', err);
      });
    } else {
      setError(response.error);
    }
  }, []);

  // Enviar mensaje
  const sendMessage = useCallback(async (message: string, currentChatId?: string, type: 'text' | 'image' | 'document' = 'text') => {
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
        message: message.trim(),
        message_type: type
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
      // ✅ OPTIMIZACIÓN: Cargar chats inmediatamente sin esperar
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
