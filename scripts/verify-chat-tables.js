#!/usr/bin/env node

/**
 * Script para verificar las tablas de chat en Supabase
 */

const { createClient } = require('@supabase/supabase-js');

async function verifyChats() {
  console.log('🔍 Verificando tablas de chat en Supabase...\n');
  
  const supabaseUrl = 'https://kclglwxssvtwderrqgks.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbGdsd3hzc3Z0d2RlcnJxZ2tzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU1Nzc4OSwiZXhwIjoyMDY4MTMzNzg5fQ.2Jz9O9tcAYOp3HzoxxDxW6orkP17kJBrj7Es1oion1k';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Verificar tabla chats
    console.log('📋 Verificando tabla CHATS...');
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .limit(5);
    
    if (chatsError) {
      console.log('❌ Error con tabla chats:', chatsError.message);
    } else {
      console.log(`✅ Tabla chats existe`);
      console.log(`   📊 Conversaciones encontradas: ${chats?.length || 0}`);
      if (chats && chats.length > 0) {
        console.log('   📝 Ejemplo de chat:');
        console.log('   ', JSON.stringify(chats[0], null, 2));
      }
    }
    
    console.log('\n');
    
    // Verificar tabla chat_messages
    console.log('💬 Verificando tabla CHAT_MESSAGES...');
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(5);
    
    if (messagesError) {
      console.log('❌ Error con tabla chat_messages:', messagesError.message);
    } else {
      console.log(`✅ Tabla chat_messages existe`);
      console.log(`   📊 Mensajes encontrados: ${messages?.length || 0}`);
      if (messages && messages.length > 0) {
        console.log('   📝 Ejemplo de mensaje:');
        console.log('   ', JSON.stringify(messages[0], null, 2));
      }
    }
    
    console.log('\n');
    console.log('🎉 Verificación completada!');
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
  }
}

verifyChats();
