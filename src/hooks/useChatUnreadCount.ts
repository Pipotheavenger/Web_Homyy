'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const visibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadCount = useCallback(async () => {
    if (!user?.id) return;

    const { count, error } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)
      .neq('sender_id', user.id);

    if (!error && count !== null) {
      setUnreadCount(count);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    loadCount();

    const userId = user.id;

    // Suscripcion Realtime para nuevos mensajes
    const channel = supabase
      .channel(`unread_messages_count_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          // Solo incrementar si el mensaje no es nuestro
          if (payload.new && payload.new.sender_id !== userId) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    // Refetch al volver a la pestaña (con delay para dejar que Realtime reconecte)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (visibilityTimerRef.current) clearTimeout(visibilityTimerRef.current);
        visibilityTimerRef.current = setTimeout(() => loadCount(), 1000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (visibilityTimerRef.current) clearTimeout(visibilityTimerRef.current);
    };
  }, [user?.id, loadCount]);

  return unreadCount;
};
