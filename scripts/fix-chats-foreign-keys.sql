-- Arreglar las foreign keys de la tabla chats

-- PASO 1: Eliminar foreign keys existentes si las hay (pueden tener nombres diferentes)
ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_client_id_fkey;
ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_worker_id_fkey;
ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_booking_id_fkey;

-- PASO 2: Crear las foreign keys con los nombres correctos
ALTER TABLE chats
  ADD CONSTRAINT chats_client_id_fkey
  FOREIGN KEY (client_id)
  REFERENCES user_profiles(user_id)
  ON DELETE CASCADE;

ALTER TABLE chats
  ADD CONSTRAINT chats_worker_id_fkey
  FOREIGN KEY (worker_id)
  REFERENCES user_profiles(user_id)
  ON DELETE CASCADE;

ALTER TABLE chats
  ADD CONSTRAINT chats_booking_id_fkey
  FOREIGN KEY (booking_id)
  REFERENCES bookings(id)
  ON DELETE CASCADE;

-- PASO 3: Crear índices para mejorar el performance
CREATE INDEX IF NOT EXISTS idx_chats_client_id ON chats(client_id);
CREATE INDEX IF NOT EXISTS idx_chats_worker_id ON chats(worker_id);
CREATE INDEX IF NOT EXISTS idx_chats_booking_id ON chats(booking_id);

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
WHERE tc.table_name = 'chats'
  AND tc.constraint_type = 'FOREIGN KEY';
