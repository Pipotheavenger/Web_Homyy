#!/usr/bin/env node

/**
 * Script para verificar bookings y chats
 */

const { createClient } = require('@supabase/supabase-js');

async function verifyBookingsAndChats() {
  console.log('🔍 Verificando bookings y chats...\n');
  
  const supabaseUrl = 'https://kclglwxssvtwderrqgks.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbGdsd3hzc3Z0d2RlcnJxZ2tzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU1Nzc4OSwiZXhwIjoyMDY4MTMzNzg5fQ.2Jz9O9tcAYOp3HzoxxDxW6orkP17kJBrj7Es1oion1k';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Verificar bookings
    console.log('📋 Verificando BOOKINGS...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (bookingsError) {
      console.log('❌ Error:', bookingsError.message);
    } else {
      console.log(`✅ Bookings encontrados: ${bookings?.length || 0}`);
      if (bookings && bookings.length > 0) {
        bookings.forEach((booking, index) => {
          console.log(`\n📦 Booking ${index + 1}:`);
          console.log(`   ID: ${booking.id}`);
          console.log(`   Service ID: ${booking.service_id}`);
          console.log(`   Client ID: ${booking.client_id}`);
          console.log(`   Worker ID: ${booking.worker_id}`);
          console.log(`   Status: ${booking.status}`);
          console.log(`   Created: ${booking.created_at}`);
        });
      } else {
        console.log('⚠️  No hay bookings en la base de datos');
      }
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Verificar chats
    console.log('💬 Verificando CHATS...');
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (chatsError) {
      console.log('❌ Error:', chatsError.message);
    } else {
      console.log(`✅ Chats encontrados: ${chats?.length || 0}`);
      if (chats && chats.length > 0) {
        chats.forEach((chat, index) => {
          console.log(`\n💬 Chat ${index + 1}:`);
          console.log(`   ID: ${chat.id}`);
          console.log(`   Booking ID: ${chat.booking_id}`);
          console.log(`   Client ID: ${chat.client_id}`);
          console.log(`   Worker ID: ${chat.worker_id}`);
          console.log(`   Created: ${chat.created_at}`);
        });
      } else {
        console.log('⚠️  No hay chats en la base de datos');
      }
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Si hay bookings pero no chats, ofrecer crearlos
    if (bookings && bookings.length > 0 && (!chats || chats.length === 0)) {
      console.log('💡 SOLUCIÓN: Hay bookings pero no chats.');
      console.log('   Voy a crear los chats que faltan...\n');
      
      for (const booking of bookings) {
        console.log(`   Creando chat para booking ${booking.id}...`);
        
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert({
            booking_id: booking.id,
            client_id: booking.client_id,
            worker_id: booking.worker_id
          })
          .select()
          .single();
        
        if (createError) {
          console.log(`   ❌ Error: ${createError.message}`);
        } else {
          console.log(`   ✅ Chat creado: ${newChat.id}`);
        }
      }
    }
    
    console.log('\n🎉 Verificación completada!');
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
  }
}

verifyBookingsAndChats();
