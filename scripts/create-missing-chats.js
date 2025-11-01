#!/usr/bin/env node

/**
 * Script para crear chats automáticamente para todos los bookings existentes
 */

const { createClient } = require('@supabase/supabase-js');

async function createMissingChats() {
  console.log('🔄 Creando chats faltantes para bookings existentes...\n');
  
  const supabaseUrl = 'https://kclglwxssvtwderrqgks.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbGdsd3hzc3Z0d2RlcnJxZ2tzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU1Nzc4OSwiZXhwIjoyMDY4MTMzNzg5fQ.2Jz9O9tcAYOp3HzoxxDxW6orkP17kJBrj7Es1oion1k';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // 1. Obtener todos los bookings
    console.log('📋 Obteniendo todos los bookings...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, client_id, worker_id, service_id, status');
    
    if (bookingsError) {
      console.log('❌ Error al obtener bookings:', bookingsError.message);
      return;
    }
    
    console.log(`✅ Bookings encontrados: ${bookings?.length || 0}\n`);
    
    if (!bookings || bookings.length === 0) {
      console.log('⚠️  No hay bookings en la base de datos. Primero ejecuta create-missing-bookings.sql');
      return;
    }
    
    // 2. Para cada booking, verificar si tiene chat
    let chatsCreated = 0;
    let chatsExisting = 0;
    
    for (const booking of bookings) {
      console.log(`\n📦 Procesando booking ${booking.id}...`);
      
      // Verificar si ya existe un chat para este booking
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('booking_id', booking.id)
        .single();
      
      if (existingChat) {
        console.log(`   ✅ Chat ya existe: ${existingChat.id}`);
        chatsExisting++;
      } else {
        // Crear el chat
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert({
            booking_id: booking.id,
            client_id: booking.client_id,
            worker_id: booking.worker_id
          })
          .select()
          .single();
        
        if (chatError) {
          console.log(`   ❌ Error creando chat: ${chatError.message}`);
        } else {
          console.log(`   ✅ Chat creado: ${newChat.id}`);
          chatsCreated++;
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 RESUMEN:`);
    console.log(`   • Bookings procesados: ${bookings.length}`);
    console.log(`   • Chats que ya existían: ${chatsExisting}`);
    console.log(`   • Chats nuevos creados: ${chatsCreated}`);
    console.log('\n🎉 ¡Proceso completado!');
    
    // 3. Mostrar todos los chats finales
    const { data: allChats } = await supabase
      .from('chats')
      .select(`
        id,
        booking_id,
        client_id,
        worker_id,
        created_at
      `)
      .order('created_at', { ascending: false });
    
    if (allChats && allChats.length > 0) {
      console.log('\n💬 Chats en la base de datos:');
      for (const chat of allChats) {
        console.log(`   - Chat ${chat.id}`);
        console.log(`     Booking: ${chat.booking_id}`);
        console.log(`     Client: ${chat.client_id}`);
        console.log(`     Worker: ${chat.worker_id}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
  }
}

createMissingChats();
