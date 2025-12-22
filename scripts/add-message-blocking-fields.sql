-- ============================================
-- AGREGAR CAMPOS PARA BLOQUEO DE MENSAJES
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Agregar columnas a chat_messages
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS original_message TEXT,
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Agregar columnas a service_questions
ALTER TABLE public.service_questions
  ADD COLUMN IF NOT EXISTS original_question TEXT,
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Agregar columnas a service_questions para respuestas también
ALTER TABLE public.service_questions
  ADD COLUMN IF NOT EXISTS original_answer TEXT;

-- Índices para mejorar búsquedas de mensajes bloqueados
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_blocked ON public.chat_messages(is_blocked) WHERE is_blocked = TRUE;
CREATE INDEX IF NOT EXISTS idx_service_questions_is_blocked ON public.service_questions(is_blocked) WHERE is_blocked = TRUE;

-- Comentarios
COMMENT ON COLUMN public.chat_messages.original_message IS 'Mensaje original antes de ser bloqueado';
COMMENT ON COLUMN public.chat_messages.is_blocked IS 'Indica si el mensaje contiene información sensible y fue bloqueado';
COMMENT ON COLUMN public.service_questions.original_question IS 'Pregunta original antes de ser bloqueada';
COMMENT ON COLUMN public.service_questions.original_answer IS 'Respuesta original antes de ser bloqueada';
COMMENT ON COLUMN public.service_questions.is_blocked IS 'Indica si la pregunta/respuesta contiene información sensible y fue bloqueada';

