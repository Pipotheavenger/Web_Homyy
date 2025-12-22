'use client';

import { useState, useEffect, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, Check, Trash2, AlertCircle, CheckCircle, MessageCircle, DollarSign, Calendar, Clock, User, FileCheck, ShieldAlert, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Notification } from '@/lib/api/notifications';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  loading: boolean;
  error?: string | null;
  onLoad?: (options?: { force?: boolean }) => Promise<void> | void;
  hasLoaded?: boolean;
  onMarkAsRead: (notificationId: string) => Promise<boolean>;
  onMarkAllAsRead: () => Promise<boolean>;
  onDelete: (notificationId: string) => Promise<boolean>;
}

// Función para obtener el icono según el tipo de notificación
const getNotificationIcon = (type: string, isCritical: boolean) => {
  if (isCritical) {
    return <ShieldAlert size={20} className="text-red-500" />;
  }

  const iconMap: Record<string, ReactElement> = {
    // Mensajes
    new_message: <MessageCircle size={20} className="text-blue-500" />,
    new_client_message: <MessageCircle size={20} className="text-blue-500" />,
    new_message: <MessageCircle size={20} className="text-blue-500" />,
    
    // Pagos
    payment_processed: <CheckCircle size={20} className="text-green-500" />,
    payment_released: <CheckCircle size={20} className="text-green-500" />,
    payment_issue: <AlertCircle size={20} className="text-red-500" />,
    bank_account_issue: <AlertCircle size={20} className="text-red-500" />,
    refund_processed: <DollarSign size={20} className="text-blue-500" />,
    
    // Servicios
    new_professional_applied: <User size={20} className="text-purple-500" />,
    client_selected_you: <CheckCircle size={20} className="text-green-500" />,
    service_completed: <FileCheck size={20} className="text-green-500" />,
    professional_confirmed_attendance: <CheckCircle size={20} className="text-blue-500" />,
    professional_on_the_way: <Clock size={20} className="text-orange-500" />,
    service_cancelled: <AlertCircle size={20} className="text-red-500" />,
    
    // Recordatorios
    no_applications_reminder: <Clock size={20} className="text-yellow-500" />,
    confirm_completion_reminder: <Clock size={20} className="text-yellow-500" />,
    rate_professional_reminder: <Clock size={20} className="text-yellow-500" />,
    service_upcoming_reminder: <Clock size={20} className="text-orange-500" />,
    
    // Calificaciones
    new_review_received: <Star size={20} className="text-yellow-500" />,
    professional_responded_review: <MessageCircle size={20} className="text-blue-500" />,
    
    // Sistema
    account_verification_approved: <CheckCircle size={20} className="text-green-500" />,
    account_verification_rejected: <AlertCircle size={20} className="text-red-500" />,
    milestone_achieved: <Star size={20} className="text-purple-500" />,
  };

  return iconMap[type] || <Bell size={20} className="text-gray-500" />;
};

// Función para formatear la fecha
const formatNotificationDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  } catch {
    return 'hace un momento';
  }
};

export const NotificationModal = ({
  isOpen,
  onClose,
  notifications,
  loading,
  error,
  onLoad,
  hasLoaded = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete
}: NotificationModalProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && onLoad) {
      onLoad({ force: !hasLoaded });
    }
  }, [isOpen, onLoad, hasLoaded]);

  if (!isOpen || !mounted) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    setSelectedId(id);
    await onMarkAsRead(id);
    setSelectedId(null);
  };

  const handleDelete = async (id: string) => {
    setSelectedId(id);
    await onDelete(id);
    setSelectedId(null);
  };

  const handleMarkAllAsRead = async () => {
    await onMarkAllAsRead();
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[9999] p-0 md:p-4"
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-t-3xl md:rounded-2xl md:max-w-2xl w-full md:w-auto shadow-2xl border border-gray-200 flex flex-col max-h-[90vh] md:max-h-[85vh] min-h-[400px] md:min-h-[400px] relative m-0 md:m-4"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <Bell size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Notificaciones</h3>
              <p className="text-xs text-gray-500">
                {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                Marcar todas como leídas
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 md:px-4 py-4 min-h-0 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                <AlertCircle size={28} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">No se pudieron cargar las notificaciones</h3>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
              {onLoad && (
                <button
                  onClick={() => onLoad({ force: true })}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                >
                  Reintentar
                </button>
              )}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                <Bell size={32} className="text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No hay notificaciones
              </h3>
              <p className="text-sm text-gray-600">
                Te notificaremos cuando haya nuevas actualizaciones
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  isProcessing={selectedId === notification.id}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

interface NotificationCardProps {
  notification: Notification;
  isProcessing: boolean;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationCard = ({ notification, isProcessing, onMarkAsRead, onDelete }: NotificationCardProps) => {
  const icon = getNotificationIcon(notification.type, notification.is_critical);

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 ${
        notification.is_read
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white border-purple-200 shadow-sm'
      } ${notification.is_critical ? 'border-red-300 bg-red-50/50' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Icono */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          notification.is_critical
            ? 'bg-red-100'
            : notification.is_read
            ? 'bg-gray-100'
            : 'bg-purple-100'
        }`}>
          {icon}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-semibold text-sm ${
              notification.is_read ? 'text-gray-700' : 'text-gray-900'
            }`}>
              {notification.title}
            </h4>
            {!notification.is_read && (
              <span className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-1"></span>
            )}
          </div>
          <p className={`text-sm mb-2 ${
            notification.is_read ? 'text-gray-600' : 'text-gray-800'
          }`}>
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {formatNotificationDate(notification.created_at)}
            </span>
            <div className="flex items-center gap-1">
              {!notification.is_read && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  disabled={isProcessing}
                  className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Marcar como leída"
                >
                  <Check size={14} className="text-purple-600" />
                </button>
              )}
              <button
                onClick={() => onDelete(notification.id)}
                disabled={isProcessing}
                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                title="Eliminar"
              >
                <Trash2 size={14} className="text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

