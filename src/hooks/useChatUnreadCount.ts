'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

/**
 * Hook ligero que solo obtiene el conteo de mensajes no leidos.
 * Usado en Layout.tsx en lugar de useChat() para evitar cargar
 * todos los chats con joins pesados en cada pagina.
 */
export const useChatUnreadCount = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadCount = useCallback(async () => {
    if (!user) return;

    const { count, error } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)
      .neq('sender_id', user.id);

    if (!error && count !== null) {
      setUnreadCount(count);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    loadCount();

    // Suscripcion Realtime para nuevos mensajes
    const channel = supabase
      .channel(`unread_messages_count_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          // Solo incrementar si el mensaje no es nuestro
          if (payload.new && payload.new.sender_id !== user.id) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    // Refetch al volver a la pestaña
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadCount();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user, loadCount]);

  return unreadCount;
};
