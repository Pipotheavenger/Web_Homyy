'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Phone, Loader2 } from 'lucide-react';

interface NotificationSetting {
  id: string;
  notification_type: string;
  enabled: boolean;
  description: string;
}

export function NotificationsSettingsTab() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);
  const [smsAuthEnabled, setSmsAuthEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'cliente' | 'profesional' | 'critica'>('all');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Cargar configuraciones de notificaciones
      const { data: notifications, error: notifError } = await supabase
        .from('notification_settings')
        .select('*')
        .order('notification_type');

      if (notifError) throw notifError;
      setNotificationSettings(notifications || []);

      // Cargar configuración de SMS Auth
      const { data: smsSetting, error: smsError } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'sms_auth_enabled')
        .single();

      if (!smsError && smsSetting?.value) {
        setSmsAuthEnabled(smsSetting.value.enabled === true);
      }
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

  const updateSmsAuthSetting = async (enabled: boolean) => {
    setUpdating('sms_auth');
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'sms_auth_enabled',
          value: { enabled },
          description: 'Habilitar/deshabilitar autenticación por SMS'
        }, {
          onConflict: 'key'
        });

      if (error) throw error;
      setSmsAuthEnabled(enabled);
    } catch (error) {
      console.error('Error actualizando SMS Auth:', error);
      alert('Error al actualizar la configuración de SMS Auth');
    } finally {
      setUpdating(null);
    }
  };

  const getNotificationCategory = (description: string): 'cliente' | 'profesional' | 'critica' | 'sistema' => {
    if (description.includes('Cliente:')) return 'cliente';
    if (description.includes('Profesional:')) return 'profesional';
    if (description.includes('Crítica:')) return 'critica';
    return 'sistema';
  };

  const filteredSettings = notificationSettings.filter(setting => {
    if (filter === 'all') return true;
    const category = getNotificationCategory(setting.description);
    return category === filter || (filter === 'critica' && category === 'sistema');
  });

  const groupedSettings = {
    cliente: filteredSettings.filter(s => getNotificationCategory(s.description) === 'cliente'),
    profesional: filteredSettings.filter(s => getNotificationCategory(s.description) === 'profesional'),
    critica: filteredSettings.filter(s => 
      getNotificationCategory(s.description) === 'critica' || 
      getNotificationCategory(s.description) === 'sistema'
    )
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Bell className="text-purple-600" size={24} />
          Configuración de Notificaciones
        </h2>
        <p className="text-gray-600">
          Gestiona qué tipos de notificaciones se envían en el sistema
        </p>
      </div>

      {/* Configuración de SMS Auth */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Phone className="text-blue-600" size={20} />
              Autenticación por SMS
            </h3>
            <p className="text-sm text-gray-600">
              Habilita o deshabilita el flujo de verificación de móvil por SMS
            </p>
          </div>
          <button
            onClick={() => updateSmsAuthSetting(!smsAuthEnabled)}
            disabled={updating === 'sms_auth'}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              smsAuthEnabled ? 'bg-green-500' : 'bg-gray-300'
            } ${updating === 'sms_auth' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                smsAuthEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

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
          onClick={() => setFilter('profesional')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'profesional'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Profesional
        </button>
        <button
          onClick={() => setFilter('critica')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'critica'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Críticas / Sistema
        </button>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-4">
        {/* Notificaciones de Cliente */}
        {groupedSettings.cliente.length > 0 && (filter === 'all' || filter === 'cliente') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones para Clientes</h3>
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

        {/* Notificaciones de Profesional */}
        {groupedSettings.profesional.length > 0 && (filter === 'all' || filter === 'profesional') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones para Profesionales</h3>
            <div className="space-y-3">
              {groupedSettings.profesional.map((setting) => (
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

        {/* Notificaciones Críticas / Sistema */}
        {groupedSettings.critica.length > 0 && (filter === 'all' || filter === 'critica') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones Críticas y del Sistema</h3>
            <div className="space-y-3">
              {groupedSettings.critica.map((setting) => (
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
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{displayName}</span>
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
