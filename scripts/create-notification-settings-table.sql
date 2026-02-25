-- Crear tabla de configuración de notificaciones
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type VARCHAR(50) UNIQUE NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  whatsapp_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas rápidas por tipo
CREATE INDEX IF NOT EXISTS idx_notification_settings_type ON notification_settings(notification_type);

-- RLS (Row Level Security) - Solo admins pueden modificar
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer (para que el componente funcione)
CREATE POLICY "Anyone can view notification settings"
  ON notification_settings
  FOR SELECT
  USING (true);

-- Política: Solo usuarios autenticados pueden actualizar (se puede restringir más si es necesario)
CREATE POLICY "Authenticated users can update notification settings"
  ON notification_settings
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON notification_settings;
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_settings_updated_at();

-- Insertar las 4 notificaciones vitales si no existen
INSERT INTO notification_settings (notification_type, enabled, whatsapp_enabled, description)
VALUES
  ('new_professional_applied', TRUE, TRUE, 'Cliente: Nuevo profesional aplicó a tu servicio'),
  ('client_selected_you', TRUE, TRUE, 'Profesional: Cliente te seleccionó para un servicio'),
  ('payment_processed', TRUE, TRUE, 'Cliente: Pago procesado exitosamente'),
  ('payment_released', TRUE, TRUE, 'Profesional: Fondos liberados después de completar servicio')
ON CONFLICT (notification_type) DO NOTHING;

-- Comentarios
COMMENT ON TABLE notification_settings IS 'Configuración de notificaciones del sistema - Controla qué notificaciones están habilitadas y cuáles se envían por WhatsApp';
COMMENT ON COLUMN notification_settings.enabled IS 'Si está en FALSE, la notificación NO se crea en la app';
COMMENT ON COLUMN notification_settings.whatsapp_enabled IS 'Si está en FALSE, la notificación se crea en la app pero NO se envía por WhatsApp';
