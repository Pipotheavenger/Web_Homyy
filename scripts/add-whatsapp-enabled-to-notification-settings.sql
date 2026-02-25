-- Agrega control ON/OFF por tipo para envío de WhatsApp desde el panel Admin
-- Ejecuta este script en tu BD (Supabase) para habilitar el switch "WhatsApp" por notificación.

ALTER TABLE notification_settings
ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- (Opcional) Si quieres que por defecto SOLO las 4 notificaciones vitales tengan WhatsApp ON:
-- UPDATE notification_settings
-- SET whatsapp_enabled = (notification_type IN ('new_professional_applied','client_selected_you','payment_processed','payment_released'));

