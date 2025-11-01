-- Verificar y crear políticas RLS para la tabla chat_messages

-- Ver políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'chat_messages';

-- Eliminar políticas existentes si hay
DROP POLICY IF EXISTS "Users can view messages from their chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;

-- Habilitar RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: Los usuarios pueden ver mensajes de sus chats
CREATE POLICY "Users can view messages from their chats"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chats
    WHERE chats.id = chat_messages.chat_id
    AND (chats.client_id = auth.uid() OR chats.worker_id = auth.uid())
  )
);

-- Política para INSERT: Los usuarios pueden enviar mensajes en sus chats
CREATE POLICY "Users can insert messages in their chats"
ON chat_messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM chats
    WHERE chats.id = chat_messages.chat_id
    AND (chats.client_id = auth.uid() OR chats.worker_id = auth.uid())
  )
);

-- Política para UPDATE: Los usuarios pueden actualizar mensajes (marcar como leído)
CREATE POLICY "Users can update messages in their chats"
ON chat_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM chats
    WHERE chats.id = chat_messages.chat_id
    AND (chats.client_id = auth.uid() OR chats.worker_id = auth.uid())
  )
);

-- Verificar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'chat_messages';
