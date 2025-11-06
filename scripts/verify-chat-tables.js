#!/usr/bin/env node

/**
 * Script para verificar las tablas de chat en Supabase
 */

const { createClient } = require('@supabase/supabase-js');

async function verifyChats() {
  console.log('🔍 Verificando tablas de chat en Supabase...\n');
  
  // Leer variables de entorno - nunca hardcodear secrets
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Se requieren las siguientes variables de entorno:');
    console.error('   SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL');
    console.error('   SUPABASE_SERVICE_ROLE_KEY');
    console.error('\n⚠️  IMPORTANTE: Nunca hardcodees el Service Role Key en el código.');
    console.error('   Usa variables de entorno para mantener la seguridad.');
    process.exit(1);
  }
  
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
    } else if (chats && chats.length > 0) {
      console.log(`✅ Tabla chats existe`);
      console.log(`   📊 Conversaciones encontradas: ${chats.length}`);
      console.log('   📝 Ejemplo de chat:');
      console.log('   ', JSON.stringify(chats[0], null, 2));
    } else {
      console.log(`✅ Tabla chats existe`);
      console.log(`   📊 Conversaciones encontradas: 0`);
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
    } else if (messages && messages.length > 0) {
      console.log(`✅ Tabla chat_messages existe`);
      console.log(`   📊 Mensajes encontrados: ${messages.length}`);
      console.log('   📝 Ejemplo de mensaje:');
      console.log('   ', JSON.stringify(messages[0], null, 2));
    } else {
      console.log(`✅ Tabla chat_messages existe`);
      console.log(`   📊 Mensajes encontrados: 0`);
    }
    
    console.log('\n');
    console.log('🎉 Verificación completada!');
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
  }
}

verifyChats();
