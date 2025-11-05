'use client';

import { useState, useEffect } from 'react';
import { useChat } from './useChat';
import { notificationService } from '@/lib/api/notifications';
import { useAuth } from './useAuth';

export const useNotificationCounts = () => {
  const { user } = useAuth();
  const { chats } = useChat();
  const [counts, setCounts] = useState({
    unreadMessages: 0,
    unreadNotifications: 0,
    pendingPayments: 0,
    newApplications: 0
  });

  // Calcular mensajes sin leer
  useEffect(() => {
    const totalUnread = chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
    setCounts(prev => ({ ...prev, unreadMessages: totalUnread }));
  }, [chats]);

  // Cargar contador de notificaciones no leídas
  useEffect(() => {
    if (!user) return;

    const loadUnreadCount = async () => {
      const response = await notificationService.getUnreadCount();
      if (response.success && response.data !== null) {
        setCounts(prev => ({ ...prev, unreadNotifications: response.data }));
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, [user]);

  return counts;
};

