-- Asegurar que is_read tenga valor por defecto

-- Agregar valor por defecto a is_read si no lo tiene
ALTER TABLE chat_messages 
  ALTER COLUMN is_read SET DEFAULT false;

-- Actualizar mensajes existentes que tengan is_read NULL
UPDATE chat_messages 
SET is_read = false 
WHERE is_read IS NULL;

-- Asegurar que is_read no puede ser NULL
ALTER TABLE chat_messages 
  ALTER COLUMN is_read SET NOT NULL;

-- Verificar la configuración
SELECT column_name, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_messages' AND column_name = 'is_read';
