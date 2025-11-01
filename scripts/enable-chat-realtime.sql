-- Habilitar Realtime para las tablas de chat

-- PASO 1: Habilitar Realtime para la tabla chats
ALTER PUBLICATION supabase_realtime ADD TABLE chats;

-- PASO 2: Habilitar Realtime para la tabla chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- PASO 3: Verificar que se habilitaron correctamente
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('chats', 'chat_messages');
