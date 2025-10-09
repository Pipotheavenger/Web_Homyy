#!/usr/bin/env node

/**
 * Script para crear la tabla bookings
 * Ejecutar: node scripts/create-bookings-table.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createBookingsTable() {
  console.log('🏗️  Creando tabla bookings...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ No se encontraron las credenciales de Supabase');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Primero verificar si la tabla ya existe
    console.log('🔍 Verificando si la tabla bookings ya existe...');
    
    const { data: existingData, error: checkError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
    
    if (!checkError) {
      console.log('⚠️  La tabla bookings ya existe');
      console.log('📋 Estructura actual:');
      
      if (existingData && existingData.length > 0) {
        const firstRow = existingData[0];
        Object.keys(firstRow).forEach((column, index) => {
          console.log(`   ${index + 1}. ${column}`);
        });
      } else {
        console.log('   (Tabla vacía)');
      }
      
      console.log('\n💡 Si quieres recrear la tabla, elimínala primero desde el dashboard de Supabase');
      return;
    }
    
    console.log('✅ La tabla bookings no existe, procediendo a crearla...\n');
    
    // Crear la tabla usando SQL directo
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.bookings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
        client_id UUID NOT NULL,
        worker_id UUID,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
        booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        total_price DECIMAL(10,2),
        notes TEXT,
        client_phone VARCHAR(20),
        client_address TEXT,
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
        payment_method VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log('📝 Ejecutando SQL para crear la tabla...');
    console.log('SQL:', createTableSQL.substring(0, 200) + '...');
    
    // Intentar crear la tabla usando RPC
    const { data: createData, error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });
    
    if (createError) {
      console.log('❌ Error al crear la tabla con RPC:', createError.message);
      console.log('💡 Nota: Es posible que necesites crear la tabla manualmente desde el dashboard de Supabase');
      console.log('\n📋 SQL para copiar y pegar en el SQL Editor:');
      console.log('─'.repeat(80));
      console.log(createTableSQL);
      console.log('─'.repeat(80));
      return;
    }
    
    console.log('✅ Tabla bookings creada exitosamente!');
    
    // Crear índices para mejorar el rendimiento
    console.log('\n🔧 Creando índices...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON public.bookings(service_id);',
      'CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON public.bookings(client_id);',
      'CREATE INDEX IF NOT EXISTS idx_bookings_worker_id ON public.bookings(worker_id);',
      'CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);',
      'CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON public.bookings(booking_date);'
    ];
    
    for (const indexSQL of indexes) {
      try {
        await supabase.rpc('exec_sql', { sql: indexSQL });
        console.log(`   ✅ Índice creado: ${indexSQL.split(' ')[5]}`);
      } catch (e) {
        console.log(`   ⚠️  No se pudo crear índice: ${indexSQL.split(' ')[5]}`);
      }
    }
    
    // Insertar datos de ejemplo
    console.log('\n📊 Insertando datos de ejemplo...');
    
    const sampleBookings = [
      {
        service_id: '045d9339-ba4c-422b-b771-55ed75e44192', // ID del servicio de limpieza
        client_id: 'f733ada7-2426-4016-a47a-d5a56444d343',
        status: 'confirmed',
        booking_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
        duration_minutes: 120,
        total_price: 50000,
        notes: 'Limpieza profunda de apartamento',
        client_phone: '+57 300 123 4567',
        client_address: 'Calle 123 #45-67, Bogotá',
        payment_status: 'paid',
        payment_method: 'Nequi'
      },
      {
        service_id: 'a0ee3454-c032-47c7-bb9b-f9208a2a02e1', // ID del servicio de electricistas
        client_id: 'f733ada7-2426-4016-a47a-d5a56444d343',
        status: 'pending',
        booking_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Pasado mañana
        duration_minutes: 90,
        total_price: 80000,
        notes: 'Reparación de enchufe en cocina',
        client_phone: '+57 300 987 6543',
        client_address: 'Carrera 45 #78-90, Chapinero',
        payment_status: 'pending',
        payment_method: 'Efectivo'
      }
    ];
    
    for (const booking of sampleBookings) {
      try {
        const { data: insertData, error: insertError } = await supabase
          .from('bookings')
          .insert(booking)
          .select();
        
        if (insertError) {
          console.log(`   ⚠️  Error al insertar booking: ${insertError.message}`);
        } else {
          console.log(`   ✅ Booking creado: ${booking.notes.substring(0, 30)}...`);
        }
      } catch (e) {
        console.log(`   ⚠️  Error al insertar booking: ${e.message}`);
      }
    }
    
    console.log('\n🎉 ¡Tabla bookings creada exitosamente!');
    console.log('\n📋 Estructura de la tabla:');
    console.log('   • id: UUID (clave primaria)');
    console.log('   • service_id: UUID (referencia a services)');
    console.log('   • client_id: UUID (ID del cliente)');
    console.log('   • worker_id: UUID (ID del trabajador, opcional)');
    console.log('   • status: VARCHAR (pending, confirmed, in_progress, completed, cancelled)');
    console.log('   • booking_date: TIMESTAMP (fecha y hora de la cita)');
    console.log('   • duration_minutes: INTEGER (duración en minutos)');
    console.log('   • total_price: DECIMAL (precio total)');
    console.log('   • notes: TEXT (notas adicionales)');
    console.log('   • client_phone: VARCHAR (teléfono del cliente)');
    console.log('   • client_address: TEXT (dirección del cliente)');
    console.log('   • payment_status: VARCHAR (pending, paid, refunded)');
    console.log('   • payment_method: VARCHAR (método de pago)');
    console.log('   • created_at: TIMESTAMP (fecha de creación)');
    console.log('   • updated_at: TIMESTAMP (fecha de actualización)');
    
    console.log('\n🔍 Para verificar la tabla, ejecuta:');
    console.log('   node scripts/describe-table.js bookings');
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
  }
}

if (require.main === module) {
  createBookingsTable();
}

module.exports = { createBookingsTable };






