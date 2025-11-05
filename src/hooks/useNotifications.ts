'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationService, type Notification } from '@/lib/api/notifications';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar notificaciones
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const response = await notificationService.getMyNotifications();

    if (response.success && response.data) {
      setNotifications(response.data);
    } else {
      setError(response.error);
    }

    setLoading(false);
  }, [user]);

  // Cargar contador de no leídas
  const loadUnreadCount = useCallback(async () => {
    if (!user) return;

    const response = await notificationService.getUnreadCount();

    if (response.success && response.data !== null) {
      setUnreadCount(response.data);
    }
  }, [user]);

  // Marcar como leída
  const markAsRead = useCallback(async (notificationId: string) => {
    const response = await notificationService.markAsRead(notificationId);

    if (response.success) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    return response.success;
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    const response = await notificationService.markAllAsRead();

    if (response.success) {
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    }

    return response.success;
  }, []);

  // Eliminar notificación
  const deleteNotification = useCallback(async (notificationId: string) => {
    const response = await notificationService.deleteNotification(notificationId);

    if (response.success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Si era no leída, reducir el contador
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }

    return response.success;
  }, [notifications]);

  // Cargar inicialmente
  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [user, loadNotifications, loadUnreadCount]);

  // Suscribirse a nuevas notificaciones en tiempo real
  useEffect(() => {
    if (!user) return;

    let mounted = true;

    const unsubscribe = notificationService.subscribeToNotifications(user.id, (newNotification) => {
      if (!mounted) return;

      setNotifications(prev => {
        // Evitar duplicados
        if (prev.some(n => n.id === newNotification.id)) {
          return prev;
        }
        // Insertar al inicio (más reciente primero)
        return [newNotification, ...prev];
      });

      // Actualizar contador si no está leída
      if (!newNotification.is_read) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};

