-- Verificar y crear políticas RLS para la tabla chats

-- Ver políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'chats';

-- Eliminar políticas existentes si hay
DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
DROP POLICY IF EXISTS "Users can insert their own chats" ON chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON chats;

-- Habilitar RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: Los usuarios pueden ver chats donde son cliente o trabajador
CREATE POLICY "Users can view their own chats"
ON chats FOR SELECT
USING (
  auth.uid() = client_id OR auth.uid() = worker_id
);

-- Política para INSERT: Los usuarios pueden crear chats donde son participantes
CREATE POLICY "Users can insert chats"
ON chats FOR INSERT
WITH CHECK (
  auth.uid() = client_id OR auth.uid() = worker_id
);

-- Política para UPDATE: Los usuarios pueden actualizar chats donde participan
CREATE POLICY "Users can update their chats"
ON chats FOR UPDATE
USING (
  auth.uid() = client_id OR auth.uid() = worker_id
);

-- Verificar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'chats';
