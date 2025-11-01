#!/usr/bin/env node

/**
 * Script para crear las tablas de chat
 * Ejecutar: node scripts/create-chat-tables.js
 */

const { createClient } = require('@supabase/supabase-js');

async function createChatTables() {
  console.log('💬 Creando tablas de chat...\n');
  
  // Usar directamente las credenciales (igual que otros scripts)
  const supabaseUrl = 'https://kclglwxssvtwderrqgks.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbGdsd3hzc3Z0d2RlcnJxZ2tzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU1Nzc4OSwiZXhwIjoyMDY4MTMzNzg5fQ.2Jz9O9tcAYOp3HzoxxDxW6orkP17kJBrj7Es1oion1k';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // ============================================
    // TABLA 1: chats (conversaciones)
    // ============================================
    console.log('📋 Creando tabla chats...');
    
    const createChatsTableSQL = `
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
      
      -- Índices
      CREATE INDEX IF NOT EXISTS idx_chats_client_id ON public.chats(client_id);
      CREATE INDEX IF NOT EXISTS idx_chats_worker_id ON public.chats(worker_id);
      CREATE INDEX IF NOT EXISTS idx_chats_booking_id ON public.chats(booking_id);
      CREATE INDEX IF NOT EXISTS idx_chats_last_message_at ON public.chats(last_message_at DESC);
    `;
    
    const { error: chatsError } = await supabase.rpc('exec_sql', {
      sql: createChatsTableSQL
    });
    
    if (chatsError) {
      console.log('❌ Error al crear tabla chats:', chatsError.message);
      console.log('\n📋 SQL para copiar:');
      console.log('─'.repeat(80));
      console.log(createChatsTableSQL);
      console.log('─'.repeat(80));
    } else {
      console.log('✅ Tabla chats creada exitosamente');
    }
    
    // ============================================
    // TABLA 2: chat_messages (mensajes)
    // ============================================
    console.log('\n📋 Creando tabla chat_messages...');
    
    const createMessagesTableSQL = `
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
      
      -- Índices
      CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON public.chat_messages(chat_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON public.chat_messages(is_read) WHERE is_read = FALSE;
    `;
    
    const { error: messagesError } = await supabase.rpc('exec_sql', {
      sql: createMessagesTableSQL
    });
    
    if (messagesError) {
      console.log('❌ Error al crear tabla chat_messages:', messagesError.message);
      console.log('\n📋 SQL para copiar:');
      console.log('─'.repeat(80));
      console.log(createMessagesTableSQL);
      console.log('─'.repeat(80));
    } else {
      console.log('✅ Tabla chat_messages creada exitosamente');
    }
    
    // ============================================
    // FUNCIÓN: Actualizar last_message en chats
    // ============================================
    console.log('\n🔧 Creando función para actualizar last_message...');
    
    const updateLastMessageFunction = `
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
    `;
    
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: updateLastMessageFunction
    });
    
    if (functionError) {
      console.log('⚠️  Error al crear función de actualización:', functionError.message);
    } else {
      console.log('✅ Función y trigger creados exitosamente');
    }
    
    // ============================================
    // POLÍTICAS RLS
    // ============================================
    console.log('\n🔒 Configurando políticas de seguridad (RLS)...');
    
    const rlsPolicies = `
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
    `;
    
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: rlsPolicies
    });
    
    if (rlsError) {
      console.log('⚠️  Error al configurar RLS:', rlsError.message);
    } else {
      console.log('✅ Políticas RLS configuradas correctamente');
    }
    
    // ============================================
    // RESUMEN
    // ============================================
    console.log('\n🎉 ¡Tablas de chat creadas exitosamente!');
    console.log('\n📋 Estructura creada:');
    console.log('   ✅ Tabla chats:');
    console.log('      - id, booking_id, client_id, worker_id');
    console.log('      - last_message, last_message_at');
    console.log('      - created_at, updated_at');
    console.log('   ✅ Tabla chat_messages:');
    console.log('      - id, chat_id, sender_id, message');
    console.log('      - message_type, is_read, created_at');
    console.log('   ✅ Trigger para actualizar last_message automáticamente');
    console.log('   ✅ Políticas RLS para seguridad');
    console.log('\n💡 Los chats solo se pueden crear cuando existe un booking activo');
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
  }
}

if (require.main === module) {
  createChatTables();
}

module.exports = { createChatTables };
