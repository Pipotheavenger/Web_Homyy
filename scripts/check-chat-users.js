#!/usr/bin/env node

/**
 * Script para verificar qué usuarios tienen acceso a los chats
 */

const { createClient } = require('@supabase/supabase-js');

async function checkChatAccess() {
  console.log('🔍 Verificando acceso a chats...\n');
  
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
    // Obtener todos los chats (con service role key, sin RLS)
    console.log('📋 Chats en la base de datos:');
    const { data: chats } = await supabase
      .from('chats')
      .select(`
        id,
        booking_id,
        client_id,
        worker_id,
        client:user_profiles!chats_client_id_fkey(name, email),
        worker:user_profiles!chats_worker_id_fkey(name, email)
      `);
    
    if (chats && chats.length > 0) {
      for (const chat of chats) {
        console.log(`\n💬 Chat ${chat.id.substring(0, 8)}...`);
        console.log(`   Client: ${chat.client?.name} (${chat.client?.email})`);
        console.log(`   Client ID: ${chat.client_id}`);
        console.log(`   Worker: ${chat.worker?.name} (${chat.worker?.email})`);
        console.log(`   Worker ID: ${chat.worker_id}`);
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('\n📊 RESUMEN:');
      console.log(`   Total de chats: ${chats.length}`);
      
      // Contar chats por usuario
      const clientCounts = {};
      const workerCounts = {};
      
      for (const chat of chats) {
        const clientEmail = chat.client?.email || 'unknown';
        const workerEmail = chat.worker?.email || 'unknown';
        
        clientCounts[clientEmail] = (clientCounts[clientEmail] || 0) + 1;
        workerCounts[workerEmail] = (workerCounts[workerEmail] || 0) + 1;
      }
      
      console.log('\n👥 Chats por CLIENTE:');
      for (const [email, count] of Object.entries(clientCounts)) {
        console.log(`   ${email}: ${count} chat(s)`);
      }
      
      console.log('\n🛠️  Chats por TRABAJADOR:');
      for (const [email, count] of Object.entries(workerCounts)) {
        console.log(`   ${email}: ${count} chat(s)`);
      }
      
    } else {
      console.log('⚠️  No hay chats en la base de datos');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkChatAccess();
