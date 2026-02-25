'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Loader2, AlertTriangle } from 'lucide-react';

interface NotificationSetting {
  id: string;
  notification_type: string;
  enabled: boolean;
  whatsapp_enabled?: boolean;
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
  const [supportsWhatsAppToggle, setSupportsWhatsAppToggle] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Cargar solo las notificaciones vitales
      // Intentar traer también whatsapp_enabled (puede no existir si no se aplicó el SQL)
      const attemptWithWhatsApp = await supabase
        .from('notification_settings')
        .select('id, notification_type, enabled, whatsapp_enabled, description')
        .in('notification_type', VITAL_NOTIFICATIONS)
        .order('notification_type');

      if (!attemptWithWhatsApp.error) {
        setSupportsWhatsAppToggle(true);
        const data = (attemptWithWhatsApp.data as NotificationSetting[]) || [];
        setNotificationSettings(data);
        
        // Si no hay registros, intentar inicializarlos automáticamente
        if (data.length === 0) {
          await initializeSettings();
        }
      } else {
        const msg = String(attemptWithWhatsApp.error.message || '');
        const columnMissing = msg.toLowerCase().includes('whatsapp_enabled'.toLowerCase());
        const tableMissing = msg.toLowerCase().includes('does not exist') || msg.toLowerCase().includes('relation');

        // Si la tabla no existe, mostrar error claro
        if (tableMissing) {
          setError('La tabla notification_settings no existe. Ejecuta el script: scripts/create-notification-settings-table.sql');
          setLoading(false);
          return;
        }

        // Si la columna no existe aún, reintentar sin whatsapp_enabled y deshabilitar el switch en UI
        if (columnMissing) {
          setSupportsWhatsAppToggle(false);
          const fallback = await supabase
            .from('notification_settings')
            .select('id, notification_type, enabled, description')
            .in('notification_type', VITAL_NOTIFICATIONS)
            .order('notification_type');
          if (fallback.error) {
            // Si también falla, puede ser que la tabla no exista o no haya registros
            const fallbackMsg = String(fallback.error.message || '');
            if (fallbackMsg.toLowerCase().includes('does not exist') || fallbackMsg.toLowerCase().includes('relation')) {
              setError('La tabla notification_settings no existe. Ejecuta el script: scripts/create-notification-settings-table.sql');
            } else {
              setNotificationSettings([]);
              // Intentar inicializar si no hay registros
              await initializeSettings();
            }
          } else {
            const fallbackData = (fallback.data as NotificationSetting[]) || [];
            setNotificationSettings(fallbackData);
            if (fallbackData.length === 0) {
              await initializeSettings();
            }
          }
        } else {
          throw attemptWithWhatsApp.error;
        }
      }

    } catch (error: any) {
      console.error('Error cargando configuraciones:', error);
      setError(error?.message || 'Error al cargar las configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const initializeSettings = async () => {
    setInitializing(true);
    try {
      // Crear los registros iniciales para las 4 notificaciones vitales
      const initialSettings: Omit<NotificationSetting, 'id'>[] = [
        {
          notification_type: 'new_professional_applied',
          enabled: true,
          whatsapp_enabled: true,
          description: 'Cliente: Nuevo profesional aplicó a tu servicio'
        },
        {
          notification_type: 'client_selected_you',
          enabled: true,
          whatsapp_enabled: true,
          description: 'Profesional: Cliente te seleccionó para un servicio'
        },
        {
          notification_type: 'payment_processed',
          enabled: true,
          whatsapp_enabled: true,
          description: 'Cliente: Pago procesado exitosamente'
        },
        {
          notification_type: 'payment_released',
          enabled: true,
          whatsapp_enabled: true,
          description: 'Profesional: Fondos liberados después de completar servicio'
        }
      ];

      // Intentar insertar con whatsapp_enabled primero
      let insertData: any[] = initialSettings;
      try {
        const { error: insertError } = await supabase
          .from('notification_settings')
          .insert(insertData);

        if (insertError) {
          // Si falla por la columna whatsapp_enabled, intentar sin ella
          const msg = String(insertError.message || '');
          if (msg.toLowerCase().includes('whatsapp_enabled')) {
            setSupportsWhatsAppToggle(false);
            insertData = initialSettings.map(({ whatsapp_enabled, ...rest }) => rest);
            const { error: retryError } = await supabase
              .from('notification_settings')
              .insert(insertData);
            if (retryError) throw retryError;
          } else {
            throw insertError;
          }
        }
      } catch (insertErr: any) {
        // Si falla porque la tabla no existe, mostrar mensaje
        const msg = String(insertErr?.message || '');
        if (msg.toLowerCase().includes('does not exist') || msg.toLowerCase().includes('relation')) {
          setError('La tabla notification_settings no existe. Ejecuta el script: scripts/create-notification-settings-table.sql');
          return;
        }
        throw insertErr;
      }

      // Recargar después de inicializar
      await loadSettings();
    } catch (error: any) {
      console.error('Error inicializando configuraciones:', error);
      setError(error?.message || 'Error al inicializar las configuraciones');
    } finally {
      setInitializing(false);
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

  const updateWhatsAppSetting = async (notificationType: string, whatsapp_enabled: boolean) => {
    setUpdating(`whatsapp:${notificationType}`);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .update({ whatsapp_enabled })
        .eq('notification_type', notificationType);

      if (error) throw error;

      setNotificationSettings(prev =>
        prev.map(setting =>
          setting.notification_type === notificationType
            ? { ...setting, whatsapp_enabled }
            : setting
        )
      );
    } catch (error) {
      console.error('Error actualizando configuración WhatsApp:', error);
      alert('Error al actualizar la configuración de WhatsApp');
    } finally {
      setUpdating(null);
    }
  };



  if (loading || initializing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="animate-spin text-purple-600" size={32} />
        <p className="text-sm text-gray-600">
          {initializing ? 'Inicializando configuraciones...' : 'Cargando configuraciones...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">Error al cargar configuraciones</h3>
              <p className="text-sm text-red-800 mb-4">{error}</p>
              <button
                onClick={initializeSettings}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Intentar inicializar configuraciones
              </button>
            </div>
          </div>
        </div>
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
      {!supportsWhatsAppToggle && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-yellow-700 mt-0.5" size={18} />
          <div className="text-sm text-yellow-800">
            <div className="font-semibold">Control de WhatsApp no disponible aún</div>
            <div>
              Falta aplicar el script <span className="font-mono">scripts/add-whatsapp-enabled-to-notification-settings.sql</span> para habilitar el switch de WhatsApp por tipo.
            </div>
          </div>
        </div>
      )}
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
                  whatsappEnabled={setting.whatsapp_enabled}
                  updating={updating === setting.notification_type}
                  updatingWhatsApp={updating === `whatsapp:${setting.notification_type}`}
                  supportsWhatsAppToggle={supportsWhatsAppToggle}
                  onToggle={(enabled) => updateNotificationSetting(setting.notification_type, enabled)}
                  onToggleWhatsApp={(val) => updateWhatsAppSetting(setting.notification_type, val)}
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
                  whatsappEnabled={setting.whatsapp_enabled}
                  updating={updating === setting.notification_type}
                  updatingWhatsApp={updating === `whatsapp:${setting.notification_type}`}
                  supportsWhatsAppToggle={supportsWhatsAppToggle}
                  onToggle={(enabled) => updateNotificationSetting(setting.notification_type, enabled)}
                  onToggleWhatsApp={(val) => updateWhatsAppSetting(setting.notification_type, val)}
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
                  whatsappEnabled={setting.whatsapp_enabled}
                  updating={updating === setting.notification_type}
                  updatingWhatsApp={updating === `whatsapp:${setting.notification_type}`}
                  supportsWhatsAppToggle={supportsWhatsAppToggle}
                  onToggle={(enabled) => updateNotificationSetting(setting.notification_type, enabled)}
                  onToggleWhatsApp={(val) => updateWhatsAppSetting(setting.notification_type, val)}
                />
              ))}
            </div>
          </div>
        )}

        {notificationSettings.length === 0 && !loading && !initializing && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center space-y-4">
            <Bell className="mx-auto text-gray-400" size={48} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay notificaciones configuradas</h3>
              <p className="text-gray-500 mb-4">
                Las configuraciones de notificaciones no se han inicializado aún.
              </p>
              <button
                onClick={initializeSettings}
                disabled={initializing}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {initializing ? (
                  <>
                    <Loader2 className="inline animate-spin mr-2" size={16} />
                    Inicializando...
                  </>
                ) : (
                  'Inicializar configuraciones de notificaciones'
                )}
              </button>
              <p className="text-xs text-gray-400 mt-4">
                O ejecuta el script SQL: <code className="bg-gray-100 px-2 py-1 rounded">scripts/create-notification-settings-table.sql</code>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface NotificationToggleProps {
  setting: NotificationSetting;
  enabled: boolean;
  whatsappEnabled?: boolean;
  updating: boolean;
  updatingWhatsApp: boolean;
  supportsWhatsAppToggle: boolean;
  onToggle: (enabled: boolean) => void;
  onToggleWhatsApp: (enabled: boolean) => void;
}

function NotificationToggle({
  setting,
  enabled,
  whatsappEnabled,
  updating,
  updatingWhatsApp,
  supportsWhatsAppToggle,
  onToggle,
  onToggleWhatsApp
}: NotificationToggleProps) {
  const displayName = setting.description.replace(/^(Cliente:|Profesional:|Crítica:|Sistema:)\s*/, '');

  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900">
            {displayName}
          </span>
          <span className="text-xs text-gray-500 font-mono bg-gray-200 px-2 py-0.5 rounded">
            {setting.notification_type}
          </span>
        </div>
        {(updating || updatingWhatsApp) && (
          <span className="text-xs text-blue-600 mt-1 flex items-center gap-1">
            <Loader2 className="animate-spin" size={12} />
            Actualizando...
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">App</span>
          <button
            onClick={() => onToggle(!enabled)}
            disabled={updating}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              enabled ? 'bg-green-500' : 'bg-gray-300'
            } ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title="Activa/desactiva la notificación dentro de Hommy"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">WhatsApp</span>
          <button
            onClick={() => onToggleWhatsApp(!(whatsappEnabled ?? true))}
            disabled={!supportsWhatsAppToggle || updatingWhatsApp}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              (whatsappEnabled ?? true) ? 'bg-green-500' : 'bg-gray-300'
            } ${(!supportsWhatsAppToggle || updatingWhatsApp) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={
              supportsWhatsAppToggle
                ? 'Activa/desactiva el envío por WhatsApp para este caso'
                : 'Aplica el script SQL para habilitar este control'
            }
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                (whatsappEnabled ?? true) ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

