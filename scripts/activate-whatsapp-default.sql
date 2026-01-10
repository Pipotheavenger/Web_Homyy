-- Script para activar WhatsApp por defecto para todos los usuarios con móvil verificado
-- Ejecutar este script en Supabase SQL Editor

-- Activar WhatsApp para todos los usuarios que tienen móvil verificado
UPDATE user_profiles
SET whatsapp_notifications_enabled = true
WHERE movil_verificado = true 
  AND (whatsapp_notifications_enabled IS NULL OR whatsapp_notifications_enabled = false);

-- También activar para worker_profiles si tienen móvil verificado
UPDATE worker_profiles
SET whatsapp_notifications_enabled = true
WHERE movil_verificado = true 
  AND (whatsapp_notifications_enabled IS NULL OR whatsapp_notifications_enabled = false);

-- Crear función trigger para activar WhatsApp automáticamente cuando se verifica el móvil
CREATE OR REPLACE FUNCTION activate_whatsapp_on_mobile_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el móvil se acaba de verificar (cambió de false/null a true)
  IF NEW.movil_verificado = true AND (OLD.movil_verificado IS NULL OR OLD.movil_verificado = false) THEN
    -- Activar WhatsApp por defecto
    NEW.whatsapp_notifications_enabled = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para user_profiles
DROP TRIGGER IF EXISTS trigger_activate_whatsapp_user_profiles ON user_profiles;
CREATE TRIGGER trigger_activate_whatsapp_user_profiles
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION activate_whatsapp_on_mobile_verification();

-- Crear trigger para worker_profiles (si existe la columna)
-- Nota: Ajusta según tu esquema de base de datos
-- DROP TRIGGER IF EXISTS trigger_activate_whatsapp_worker_profiles ON worker_profiles;
-- CREATE TRIGGER trigger_activate_whatsapp_worker_profiles
--   BEFORE UPDATE ON worker_profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION activate_whatsapp_on_mobile_verification();



