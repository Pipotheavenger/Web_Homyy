#!/usr/bin/env node

/**
 * Script para listar las tablas usando SQL directo
 * Ejecutar: node scripts/list-tables-sql.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function listTablesWithSQL() {
  console.log('🔍 Conectando a la base de datos de Supabase...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ No se encontraron las credenciales de Supabase');
    return;
  }
  
  console.log(`📡 URL: ${supabaseUrl}`);
  console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...`);
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Usar RPC para ejecutar SQL directo
    console.log('\n📋 Consultando tablas usando SQL directo...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT table_name, table_schema 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `
    });
    
    if (error) {
      console.log('❌ Error con RPC, intentando método alternativo...');
      
      // Método alternativo: intentar consultar tablas conocidas
      const knownTables = [
        'users', 'profiles', 'services', 'applications', 'notifications',
        'payments', 'categories', 'reviews', 'messages', 'chats'
      ];
      
      console.log('\n🔍 Verificando tablas comunes...');
      
      for (const tableName of knownTables) {
        try {
          const { data: testData, error: testError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (!testError) {
            console.log(`✅ Tabla encontrada: ${tableName}`);
          }
        } catch (e) {
          // Tabla no existe, continuar
        }
      }
      
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
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.message);
    
    // Intentar método de prueba con tablas comunes
    console.log('\n🔍 Intentando método de prueba...');
    
    const commonTables = [
      'users', 'profiles', 'services', 'applications', 'notifications',
      'payments', 'categories', 'reviews', 'messages', 'chats', 'workers',
      'clients', 'jobs', 'bookings', 'transactions'
    ];
    
    const foundTables = [];
    
    for (const tableName of commonTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          foundTables.push(tableName);
          console.log(`✅ Tabla encontrada: ${tableName}`);
        }
      } catch (e) {
        // Tabla no existe, continuar
      }
    }
    
    if (foundTables.length === 0) {
      console.log('📭 No se encontraron tablas conocidas');
    } else {
      console.log(`\n🎯 Total de tablas encontradas: ${foundTables.length}`);
    }
  }
}

if (require.main === module) {
  listTablesWithSQL();
}

module.exports = { listTablesWithSQL };

















