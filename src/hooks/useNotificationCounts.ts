'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/lib/api/notifications';
import { useAuth } from './useAuth';

export interface NotificationCounts {
  unreadMessages: number;
  unreadNotifications: number;
  pendingPayments: number;
  newApplications: number;
}

interface NotificationCountsOptions {
  /** Pass chat unread count from an external source to avoid creating duplicate useChat() subscriptions */
  externalUnreadMessages?: number;
}

export const useNotificationCounts = (options: NotificationCountsOptions = {}) => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<NotificationCounts>({
    unreadMessages: 0,
    unreadNotifications: 0,
    pendingPayments: 0,
    newApplications: 0
  });

  // Sync external unread messages count if provided
  useEffect(() => {
    if (options.externalUnreadMessages !== undefined) {
      setCounts(prev => ({ ...prev, unreadMessages: options.externalUnreadMessages! }));
    }
  }, [options.externalUnreadMessages]);

  const loadUnreadCount = useCallback(async () => {
    const response = await notificationService.getUnreadCount();
    if (response.success && response.data !== null) {
      setCounts(prev => ({ ...prev, unreadNotifications: response.data }));
    }
  }, []);

  // Cargar contador de notificaciones no leidas y polling periodico
  useEffect(() => {
    if (!user) return;

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [user, loadUnreadCount]);

  return counts;
};

