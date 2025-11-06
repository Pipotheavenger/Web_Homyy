#!/usr/bin/env node

/**
 * Script para probar el acceso a chats con el usuario actual
 */

const { createClient } = require('@supabase/supabase-js');

async function testChatAccess() {
  console.log('🔍 Probando acceso a chats...\n');
  
  // Leer variables de entorno - nunca hardcodear secrets
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Se requieren las siguientes variables de entorno:');
    console.error('   SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL');
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.error('\n⚠️  IMPORTANTE: Nunca hardcodees las keys en el código.');
    console.error('   Usa variables de entorno para mantener la seguridad.');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Login como Nico2 (el cliente)
    console.log('🔐 Iniciando sesión como Nico2 (cliente)...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'nico2@example.com',
      password: 'password123'
    });
    
    if (authError) {
      console.log('❌ Error al autenticar:', authError.message);
      return;
    }
    
    console.log('✅ Autenticado como:', authData.user.email);
    console.log('   User ID:', authData.user.id);
    
    // Intentar obtener chats
    console.log('\n📋 Intentando obtener chats...');
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select(`
        *,
        booking:bookings(
          id,
          status,
          service:services(title)
        ),
        client:user_profiles!chats_client_id_fkey(id, name, email, profile_picture_url),
        worker:user_profiles!chats_worker_id_fkey(id, name, email, profile_picture_url)
      `)
      .or(`client_id.eq.${authData.user.id},worker_id.eq.${authData.user.id}`);
    
    if (chatsError) {
      console.log('❌ Error al obtener chats:', chatsError.message);
      console.log('   Código:', chatsError.code);
      console.log('   Detalles:', chatsError.details);
      console.log('   Hint:', chatsError.hint);
    } else if (chats && chats.length > 0) {
      console.log(`✅ Chats obtenidos: ${chats.length}`);
        chats.forEach((chat, index) => {
          console.log(`\n💬 Chat ${index + 1}:`);
          console.log(`   ID: ${chat.id}`);
          console.log(`   Booking ID: ${chat.booking_id}`);
          console.log(`   Client: ${chat.client?.name || 'N/A'}`);
          console.log(`   Worker: ${chat.worker?.name || 'N/A'}`);
          console.log(`   Service: ${chat.booking?.service?.title || 'N/A'}`);
        });
    } else {
      console.log('⚠️  No se encontraron chats');
      
      // Verificar si hay bookings para este usuario
      console.log('\n🔍 Verificando bookings del usuario...');
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .or(`client_id.eq.${authData.user.id},worker_id.eq.${authData.user.id}`);
      
      console.log(`   Bookings encontrados: ${bookings?.length || 0}`);
      if (bookings && bookings.length > 0) {
        bookings.forEach((booking, index) => {
          console.log(`   ${index + 1}. Booking ${booking.id}`);
          console.log(`      Client: ${booking.client_id}`);
          console.log(`      Worker: ${booking.worker_id}`);
        });
      }
    }
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
  }
}

testChatAccess();
