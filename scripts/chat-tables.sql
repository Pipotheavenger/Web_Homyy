-- ============================================
-- TABLAS DE CHAT PARA HOMMY
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- TABLA 1: chats (conversaciones)
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  worker_id UUID NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Asegurar que solo haya un chat por booking
  UNIQUE(booking_id),
  
  -- Índices para búsquedas rápidas
  CHECK (client_id != worker_id)
);

-- Índices para chats
CREATE INDEX IF NOT EXISTS idx_chats_client_id ON public.chats(client_id);
CREATE INDEX IF NOT EXISTS idx_chats_worker_id ON public.chats(worker_id);
CREATE INDEX IF NOT EXISTS idx_chats_booking_id ON public.chats(booking_id);
CREATE INDEX IF NOT EXISTS idx_chats_last_message_at ON public.chats(last_message_at DESC);

-- TABLA 2: chat_messages (mensajes)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validación: mensaje no vacío
  CHECK (LENGTH(TRIM(message)) > 0)
);

-- Índices para chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON public.chat_messages(is_read) WHERE is_read = FALSE;

-- FUNCIÓN: Actualizar last_message en chats
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chats
  SET 
    last_message = NEW.message,
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.chat_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para ejecutar la función
DROP TRIGGER IF EXISTS trigger_update_chat_last_message ON public.chat_messages;
CREATE TRIGGER trigger_update_chat_last_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_last_message();

-- POLÍTICAS RLS
-- Habilitar RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para chats
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
CREATE POLICY "Users can view their own chats"
  ON public.chats FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = worker_id);

DROP POLICY IF EXISTS "Users can create chats for their bookings" ON public.chats;
CREATE POLICY "Users can create chats for their bookings"
  ON public.chats FOR INSERT
  WITH CHECK (
    auth.uid() = client_id OR auth.uid() = worker_id
  );

-- Políticas para chat_messages
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.chat_messages;
CREATE POLICY "Users can view messages in their chats"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = chat_messages.chat_id
      AND (chats.client_id = auth.uid() OR chats.worker_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their chats" ON public.chat_messages;
CREATE POLICY "Users can send messages in their chats"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = chat_messages.chat_id
      AND (chats.client_id = auth.uid() OR chats.worker_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can mark messages as read" ON public.chat_messages;
CREATE POLICY "Users can mark messages as read"
  ON public.chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = chat_messages.chat_id
      AND (chats.client_id = auth.uid() OR chats.worker_id = auth.uid())
    )
  );

-- ============================================
-- FIN DE SCRIPT
-- ============================================
