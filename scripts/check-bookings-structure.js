#!/usr/bin/env node

/**
 * Script para verificar la estructura de la tabla bookings
 */

const { createClient } = require('@supabase/supabase-js');

async function checkBookingsStructure() {
  console.log('🔍 Verificando estructura de la tabla bookings...\n');
  
  const supabaseUrl = 'https://kclglwxssvtwderrqgks.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbGdsd3hzc3Z0d2RlcnJxZ2tzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU1Nzc4OSwiZXhwIjoyMDY4MTMzNzg5fQ.2Jz9O9tcAYOp3HzoxxDxW6orkP17kJBrj7Es1oion1k';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Intentar hacer un select de la tabla para ver qué columnas tiene
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      if (data && data.length > 0) {
        console.log('✅ Estructura de bookings (ejemplo de registro):');
        console.log(JSON.stringify(data[0], null, 2));
      } else {
        console.log('⚠️  La tabla está vacía, no puedo ver la estructura');
        console.log('Voy a intentar insertar un registro de prueba para ver qué columnas acepta...');
      }
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
