#!/usr/bin/env node

/**
 * Script para listar las tablas de la base de datos de Supabase
 * Ejecutar: node scripts/list-tables.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function listTables() {
  console.log('🔍 Conectando a la base de datos de Supabase...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ No se encontraron las credenciales de Supabase');
    console.log('💡 Verifica que NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY estén en .env.local');
    return;
  }
  
  console.log(`📡 URL: ${supabaseUrl}`);
  console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...`);
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Listar tablas usando una consulta SQL
    console.log('\n📋 Consultando tablas de la base de datos...');
    
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (error) {
      console.log('❌ Error al consultar las tablas:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('📭 No se encontraron tablas en el esquema público');
      return;
    }
    
    console.log(`\n✅ Se encontraron ${data.length} tablas:\n`);
    
    data.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });
    
    console.log('\n🎯 Para ver más detalles de una tabla específica, puedes usar:');
    console.log('   node scripts/describe-table.js <nombre_tabla>');
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
  }
}

if (require.main === module) {
  listTables();
}

module.exports = { listTables };









