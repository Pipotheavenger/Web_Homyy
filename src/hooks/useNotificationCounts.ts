'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '@/lib/api/notifications';
import { supabase } from '@/lib/supabase';
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
  const visibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external unread messages count if provided
  useEffect(() => {
    if (options.externalUnreadMessages !== undefined) {
      setCounts(prev => ({ ...prev, unreadMessages: options.externalUnreadMessages! }));
    }
  }, [options.externalUnreadMessages]);

  const loadUnreadCount = useCallback(async () => {
    const response = await notificationService.getUnreadCount();
    if (response.success && response.data !== null) {
      setCounts(prev => ({ ...prev, unreadNotifications: response.data as number }));
    }
  }, []);

  // Realtime subscription + refetch on visibility change (replaces 30s polling)
  useEffect(() => {
    if (!user?.id) return;

    loadUnreadCount();

    const userId = user.id;

    // Subscribe to new notifications via Realtime instead of polling
    const channel = supabase
      .channel(`notification_counts_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          setCounts(prev => ({
            ...prev,
            unreadNotifications: prev.unreadNotifications + 1
          }));
        }
      )
      .subscribe();

    // Refetch on tab visibility change (with delay to let Realtime reconnect)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (visibilityTimerRef.current) clearTimeout(visibilityTimerRef.current);
        visibilityTimerRef.current = setTimeout(() => loadUnreadCount(), 1000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityTimerRef.current) clearTimeout(visibilityTimerRef.current);
    };
  }, [user?.id, loadUnreadCount]);

  return counts;
};
