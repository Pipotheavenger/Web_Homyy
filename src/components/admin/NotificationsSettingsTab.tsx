'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Loader2, AlertTriangle } from 'lucide-react';

interface NotificationSetting {
  id: string;
  notification_type: string;
  enabled: boolean;
  description: string;
}

// Lista de las 4 notificaciones importantes que se envían por WhatsApp
const VITAL_NOTIFICATIONS = [
  'new_professional_applied',  // Cuando un trabajador postula a un servicio → notificación al usuario
  'client_selected_you',       // Cuando se selecciona al trabajador → notificación al trabajador
  'payment_processed',         // Cuando se paga y se confirma un pago
  'payment_released',          // Cuando se liberan los fondos al trabajador después de completar un servicio
];

// Categorías de notificaciones
const NOTIFICATION_CATEGORIES: {
  cliente: string[];
  trabajador: string[];
  todos: string[];
} = {
  cliente: ['new_professional_applied', 'payment_processed'],
  trabajador: ['client_selected_you', 'payment_released'],
  todos: [],
};

const getNotificationCategory = (notificationType: string): 'cliente' | 'trabajador' | 'todos' => {
  if (NOTIFICATION_CATEGORIES.cliente.includes(notificationType)) {
    // Si está en cliente pero también en todos, priorizar todos
    if (NOTIFICATION_CATEGORIES.todos.length > 0 && NOTIFICATION_CATEGORIES.todos.includes(notificationType)) {
      return 'todos';
    }
    return 'cliente';
  }
  if (NOTIFICATION_CATEGORIES.trabajador.includes(notificationType)) {
    // Si está en trabajador pero también en todos, priorizar todos
    if (NOTIFICATION_CATEGORIES.todos.length > 0 && NOTIFICATION_CATEGORIES.todos.includes(notificationType)) {
      return 'todos';
    }
    return 'trabajador';
  }
  return 'todos';
};

export function NotificationsSettingsTab() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'cliente' | 'trabajador' | 'todos'>('all');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Cargar solo las notificaciones vitales
      const { data: notifications, error: notifError } = await supabase
        .from('notification_settings')
        .select('*')
        .in('notification_type', VITAL_NOTIFICATIONS)
        .order('notification_type');

      if (notifError) throw notifError;
      setNotificationSettings(notifications || []);

    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationSetting = async (notificationType: string, enabled: boolean) => {
    setUpdating(notificationType);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .update({ enabled })
        .eq('notification_type', notificationType);

      if (error) throw error;

      setNotificationSettings(prev =>
        prev.map(setting =>
          setting.notification_type === notificationType
            ? { ...setting, enabled }
            : setting
        )
      );
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      alert('Error al actualizar la configuración');
    } finally {
      setUpdating(null);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  const filteredSettings = notificationSettings.filter(setting => {
    if (filter === 'all') return true;
    const category = getNotificationCategory(setting.notification_type);
    return category === filter;
  });

  const groupedSettings = {
    cliente: filteredSettings.filter(s => getNotificationCategory(s.notification_type) === 'cliente'),
    trabajador: filteredSettings.filter(s => getNotificationCategory(s.notification_type) === 'trabajador'),
    todos: filteredSettings.filter(s => getNotificationCategory(s.notification_type) === 'todos'),
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('cliente')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'cliente'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Cliente
        </button>
        <button
          onClick={() => setFilter('trabajador')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'trabajador'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Trabajador
        </button>
        <button
          onClick={() => setFilter('todos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'todos'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
      </div>

      {/* Lista de notificaciones vitales */}
      <div className="space-y-4">
        {/* Notificaciones de Cliente */}
        {groupedSettings.cliente.length > 0 && (filter === 'all' || filter === 'cliente') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h3>
            <div className="space-y-3">
              {groupedSettings.cliente.map((setting) => (
                <NotificationToggle
                  key={setting.id}
                  setting={setting}
                  enabled={setting.enabled}
                  updating={updating === setting.notification_type}
                  onToggle={(enabled) => updateNotificationSetting(setting.notification_type, enabled)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Notificaciones de Trabajador */}
        {groupedSettings.trabajador.length > 0 && (filter === 'all' || filter === 'trabajador') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trabajador</h3>
            <div className="space-y-3">
              {groupedSettings.trabajador.map((setting) => (
                <NotificationToggle
                  key={setting.id}
                  setting={setting}
                  enabled={setting.enabled}
                  updating={updating === setting.notification_type}
                  onToggle={(enabled) => updateNotificationSetting(setting.notification_type, enabled)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Notificaciones para Todos */}
        {groupedSettings.todos.length > 0 && (filter === 'all' || filter === 'todos') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Todos</h3>
            <div className="space-y-3">
              {groupedSettings.todos.map((setting) => (
                <NotificationToggle
                  key={setting.id}
                  setting={setting}
                  enabled={setting.enabled}
                  updating={updating === setting.notification_type}
                  onToggle={(enabled) => updateNotificationSetting(setting.notification_type, enabled)}
                />
              ))}
            </div>
          </div>
        )}

        {notificationSettings.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-500">No hay notificaciones vitales configuradas</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface NotificationToggleProps {
  setting: NotificationSetting;
  enabled: boolean;
  updating: boolean;
  onToggle: (enabled: boolean) => void;
}

function NotificationToggle({ setting, enabled, updating, onToggle }: NotificationToggleProps) {
  const displayName = setting.description.replace(/^(Cliente:|Profesional:|Crítica:|Sistema:)\s*/, '');

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900">
            {displayName}
          </span>
          <span className="text-xs text-gray-500 font-mono bg-gray-200 px-2 py-0.5 rounded">
            {setting.notification_type}
          </span>
        </div>
        {updating && (
          <span className="text-xs text-blue-600 mt-1 flex items-center gap-1">
            <Loader2 className="animate-spin" size={12} />
            Actualizando...
          </span>
        )}
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        disabled={updating}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
          enabled ? 'bg-green-500' : 'bg-gray-300'
        } ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

