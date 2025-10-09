#!/usr/bin/env node

/**
 * Script para describir la estructura de una tabla
 * Ejecutar: node scripts/describe-table.js <nombre_tabla>
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function describeTable(tableName) {
  console.log(`🔍 Describiendo la tabla: ${tableName}\n`);
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ No se encontraron las credenciales de Supabase');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Obtener una muestra de datos
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Error al consultar la tabla:', error.message);
      return;
    }
    
    console.log(`📊 Muestra de datos de la tabla '${tableName}':\n`);
    
    if (!data || data.length === 0) {
      console.log('📭 La tabla está vacía');
      return;
    }
    
    // Mostrar estructura basada en la primera fila
    const firstRow = data[0];
    console.log('🏗️  Estructura de la tabla:');
    console.log('─'.repeat(50));
    
    Object.keys(firstRow).forEach((column, index) => {
      const value = firstRow[column];
      const type = typeof value;
      const sample = value !== null ? String(value).substring(0, 30) : 'null';
      console.log(`${index + 1}. ${column.padEnd(20)} | ${type.padEnd(10)} | ${sample}`);
    });
    
    console.log('─'.repeat(50));
    console.log(`\n📈 Total de registros consultados: ${data.length}`);
    
    // Mostrar algunos datos de ejemplo
    console.log('\n📋 Datos de ejemplo:');
    data.forEach((row, index) => {
      console.log(`\n${index + 1}. Registro:`);
      Object.entries(row).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    });
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
  }
}

if (require.main === module) {
  const tableName = process.argv[2];
  
  if (!tableName) {
    console.log('❌ Debes especificar el nombre de la tabla');
    console.log('💡 Uso: node scripts/describe-table.js <nombre_tabla>');
    console.log('📋 Tablas disponibles: services, categories, reviews');
    return;
  }
  
  describeTable(tableName);
}

module.exports = { describeTable };






