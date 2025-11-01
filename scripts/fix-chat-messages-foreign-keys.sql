-- Arreglar las foreign keys de la tabla chat_messages

-- PASO 1: Eliminar foreign keys existentes si las hay
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey;
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_chat_id_fkey;

-- PASO 2: Crear las foreign keys con los nombres correctos
ALTER TABLE chat_messages
  ADD CONSTRAINT chat_messages_sender_id_fkey
  FOREIGN KEY (sender_id)
  REFERENCES user_profiles(user_id)
  ON DELETE CASCADE;

ALTER TABLE chat_messages
  ADD CONSTRAINT chat_messages_chat_id_fkey
  FOREIGN KEY (chat_id)
  REFERENCES chats(id)
  ON DELETE CASCADE;

-- PASO 3: Crear índices para mejorar el performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON chat_messages(is_read);

-- PASO 4: Verificar las foreign keys creadas
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'chat_messages'
  AND tc.constraint_type = 'FOREIGN KEY';
