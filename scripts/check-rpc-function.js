#!/usr/bin/env node

/**
 * Script para verificar la función RPC escrow_service_select_worker
 */

const { createClient } = require('@supabase/supabase-js');

async function checkRPCFunction() {
  console.log('🔍 Verificando función RPC escrow_service_select_worker...\n');
  
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
    // Buscar servicios activos
    console.log('📋 Buscando servicios activos...');
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, title, status, user_id')
      .eq('status', 'active')
      .limit(5);
    
    if (servicesError) {
      console.log('❌ Error:', servicesError.message);
    } else if (services && services.length > 0) {
      console.log(`✅ Servicios activos encontrados: ${services.length}`);
      for (const service of services) {
        console.log(`\n📦 Servicio: ${service.title} (${service.id})`);
        
        // Buscar aplicaciones para este servicio
        const { data: apps } = await supabase
          .from('applications')
          .select('id, worker_id, status, proposed_price')
          .eq('service_id', service.id);
        
        if (apps && apps.length > 0) {
          console.log(`   📝 Aplicaciones: ${apps.length}`);
          apps.forEach(app => {
            console.log(`      - ${app.id} | Worker: ${app.worker_id} | Status: ${app.status} | Price: $${app.proposed_price}`);
          });
        }
      }
    } else {
      console.log(`✅ Servicios activos encontrados: 0`);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Buscar transacciones de escrow
    console.log('💰 Buscando transacciones de escrow...');
    const { data: escrows, error: escrowsError } = await supabase
      .from('escrow_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (escrowsError) {
      console.log('❌ Error:', escrowsError.message);
    } else if (escrows && escrows.length > 0) {
      console.log(`✅ Transacciones de escrow encontradas: ${escrows.length}`);
      for (const escrow of escrows) {
        console.log(`\n💰 Escrow ${escrow.id}:`);
        console.log(`   Service ID: ${escrow.service_id}`);
        console.log(`   Worker ID: ${escrow.worker_id}`);
        console.log(`   Amount: $${escrow.amount}`);
        console.log(`   Status: ${escrow.status}`);
        console.log(`   Created: ${escrow.created_at}`);
      }
    } else {
      console.log(`✅ Transacciones de escrow encontradas: 0`);
    }
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
  }
}

checkRPCFunction();
