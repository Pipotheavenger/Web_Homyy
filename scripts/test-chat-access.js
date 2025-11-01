#!/usr/bin/env node

/**
 * Script para probar el acceso a chats con el usuario actual
 */

const { createClient } = require('@supabase/supabase-js');

async function testChatAccess() {
  console.log('🔍 Probando acceso a chats...\n');
  
  const supabaseUrl = 'https://kclglwxssvtwderrqgks.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbGdsd3hzc3Z0d2RlcnJxZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NTc3ODksImV4cCI6MjA2ODEzMzc4OX0.RajU-ogx9qiCGR0itBU6Oc66l8cxWVzC3pvzJPwu88k';
  
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
    } else {
      console.log(`✅ Chats obtenidos: ${chats?.length || 0}`);
      if (chats && chats.length > 0) {
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
    }
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
  }
}

testChatAccess();
