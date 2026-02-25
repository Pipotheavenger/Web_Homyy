const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno desde .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl = '';
let supabaseServiceKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseServiceKey = line.split('=')[1].trim();
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseServiceKey = line.split('=')[1].trim();
    }
  });
} catch (error) {
  console.error('❌ Error leyendo .env.local:', error.message);
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTermsTable() {
  console.log('🚀 Creando tabla de términos y condiciones...\n');

  try {
    // Crear la tabla
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Crear tabla para términos y condiciones
        CREATE TABLE IF NOT EXISTS terms_and_conditions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          content TEXT NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_by UUID REFERENCES auth.users(id),
          version INTEGER DEFAULT 1
        );
      `
    });

    if (createTableError) {
      console.log('⚠️  Tabla ya existe o error:', createTableError.message);
    } else {
      console.log('✅ Tabla terms_and_conditions creada');
    }

    // Insertar contenido inicial
    const { error: insertError } = await supabase
      .from('terms_and_conditions')
      .insert({
        content: '<h2>Términos y Condiciones de Hommy</h2><p>Bienvenido a Hommy. Estos términos y condiciones describen las reglas y regulaciones para el uso de nuestra plataforma.</p><p>Edita este contenido desde el panel de administración.</p>',
        version: 1
      });

    if (insertError && insertError.code !== '23505') { // 23505 es duplicate key
      console.log('⚠️  Error al insertar contenido inicial:', insertError.message);
    } else {
      console.log('✅ Contenido inicial insertado');
    }

    // Habilitar RLS
    console.log('\n📋 Configurando políticas de seguridad...');
    console.log('Por favor, ejecuta manualmente en el SQL Editor de Supabase:');
    console.log(`
-- Habilitar RLS
ALTER TABLE terms_and_conditions ENABLE ROW LEVEL SECURITY;

-- Política para que todos puedan leer
CREATE POLICY "Todos pueden leer términos y condiciones"
  ON terms_and_conditions
  FOR SELECT
  USING (true);

-- Política para que solo admins puedan actualizar
CREATE POLICY "Solo admins pueden actualizar términos"
  ON terms_and_conditions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Crear índice para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_terms_updated_at ON terms_and_conditions(updated_at DESC);
    `);

    console.log('\n✅ Proceso completado');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Ve al panel de administración: /admin/dashboard');
    console.log('2. Haz clic en la pestaña "Términos"');
    console.log('3. Pega tu contenido desde Word y dale formato');
    console.log('4. Haz clic en "Guardar Cambios"');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTermsTable();

