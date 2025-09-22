import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kclglwxssvtwderrqgks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbGdsd3hzc3Z0d2RlcnJxZ2tzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU1Nzc4OSwiZXhwIjoyMDY4MTMzNzg5fQ.2Jz9O9tcAYOp3HzoxxDxW6orkP17kJBrj7Es1oion1k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Verificando estructura de la base de datos...\n');

  try {
    // Verificar tablas existentes usando SQL directo
    console.log('📋 Verificando tablas existentes...');
    
    // Lista de tablas que queremos verificar
    const tablesToCheck = [
      'users',
      'user_profiles', 
      'worker_profiles',
      'services',
      'categories',
      'service_schedules',
      'professionals',
      'reviews',
      'transactions',
      'notifications',
      'chat_conversations',
      'chat_messages'
    ];

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          if (error.code === 'PGRST116') {
            console.log(`  ❌ Tabla ${tableName} NO existe`);
          } else {
            console.log(`  ⚠️  Tabla ${tableName}: ${error.message}`);
          }
        } else {
          console.log(`  ✅ Tabla ${tableName} existe`);
          
          // Si es la tabla users, verificar su estructura
          if (tableName === 'users') {
            try {
              const { data: sampleData, error: sampleError } = await supabase
                .from('users')
                .select('*')
                .limit(1);
              
              if (!sampleError && sampleData && sampleData.length > 0) {
                const columns = Object.keys(sampleData[0]);
                console.log(`    📊 Columnas: ${columns.join(', ')}`);
              }
            } catch (err) {
              console.log(`    ⚠️  No se pudo verificar estructura: ${err.message}`);
            }
          }
        }
      } catch (err) {
        console.log(`  ❌ Error verificando ${tableName}: ${err.message}`);
      }
    }

    // Verificar si hay datos en las tablas existentes
    console.log('\n📊 Verificando datos en tablas existentes...');
    
    for (const tableName of tablesToCheck) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          console.log(`  📈 Tabla ${tableName}: ${count} registros`);
        }
      } catch (err) {
        // Ignorar errores de tablas que no existen
      }
    }

  } catch (error) {
    console.error('Error general:', error);
  }
}

checkDatabase().catch(console.error);
