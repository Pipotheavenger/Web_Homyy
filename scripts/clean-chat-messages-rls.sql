-- PASO 1: Eliminar TODAS las políticas existentes de chat_messages

DROP POLICY IF EXISTS "Users can insert messages in their chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can mark messages as read" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can update messages in their chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages from their chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON chat_messages;

-- PASO 2: Crear solo las 3 políticas necesarias y correctas

-- Política para SELECT: Ver mensajes de chats donde participo
CREATE POLICY "Users can view messages from their chats"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chats
    WHERE chats.id = chat_messages.chat_id
    AND (chats.client_id = auth.uid() OR chats.worker_id = auth.uid())
  )
);

-- Política para INSERT: Enviar mensajes en mis chats
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

-- Política para UPDATE: Marcar mensajes como leídos
CREATE POLICY "Users can update messages in their chats"
ON chat_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM chats
    WHERE chats.id = chat_messages.chat_id
    AND (chats.client_id = auth.uid() OR chats.worker_id = auth.uid())
  )
);

-- PASO 3: Verificar que quedaron solo 3 políticas
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'chat_messages'
ORDER BY cmd;
