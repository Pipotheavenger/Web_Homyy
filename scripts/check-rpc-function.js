#!/usr/bin/env node

/**
 * Script para verificar la función RPC escrow_service_select_worker
 */

const { createClient } = require('@supabase/supabase-js');

async function checkRPCFunction() {
  console.log('🔍 Verificando función RPC escrow_service_select_worker...\n');
  
  const supabaseUrl = 'https://kclglwxssvtwderrqgks.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbGdsd3hzc3Z0d2RlcnJxZ2tzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU1Nzc4OSwiZXhwIjoyMDY4MTMzNzg5fQ.2Jz9O9tcAYOp3HzoxxDxW6orkP17kJBrj7Es1oion1k';
  
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
    } else {
      console.log(`✅ Servicios activos encontrados: ${services?.length || 0}`);
      if (services && services.length > 0) {
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
      }
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
    } else {
      console.log(`✅ Transacciones de escrow encontradas: ${escrows?.length || 0}`);
      if (escrows && escrows.length > 0) {
        for (const escrow of escrows) {
          console.log(`\n💰 Escrow ${escrow.id}:`);
          console.log(`   Service ID: ${escrow.service_id}`);
          console.log(`   Worker ID: ${escrow.worker_id}`);
          console.log(`   Amount: $${escrow.amount}`);
          console.log(`   Status: ${escrow.status}`);
          console.log(`   Created: ${escrow.created_at}`);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
  }
}

checkRPCFunction();
