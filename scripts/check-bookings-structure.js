#!/usr/bin/env node

/**
 * Script para verificar la estructura de la tabla bookings
 */

const { createClient } = require('@supabase/supabase-js');

async function checkBookingsStructure() {
  console.log('🔍 Verificando estructura de la tabla bookings...\n');
  
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
    // Intentar hacer un select de la tabla para ver qué columnas tiene
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error.message);
    } else if (data && data.length > 0) {
      console.log('✅ Estructura de bookings (ejemplo de registro):');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('⚠️  La tabla está vacía, no puedo ver la estructura');
      console.log('Voy a intentar insertar un registro de prueba para ver qué columnas acepta...');
    }
    
    // También verificar escrow_transactions
    console.log('\n📋 Verificando escrow_transactions...');
    const { data: escrows } = await supabase
      .from('escrow_transactions')
      .select('*')
      .limit(1);
    
    if (escrows && escrows.length > 0) {
      console.log('✅ Estructura de escrow_transactions:');
      console.log(JSON.stringify(escrows[0], null, 2));
    }
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
  }
}

checkBookingsStructure();
