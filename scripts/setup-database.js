
// Crear tabla users
console.log('Creando tabla users...');
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) CHECK (role IN ('client', 'worker')) DEFAULT 'client',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`;

try {
  const { error: usersError } = await supabase.rpc('exec_sql', { sql: createUsersTable });
  if (usersError) {
    console.error('Error creando tabla users:', usersError);
  } else {
    console.log('✅ Tabla users creada/verificada exitosamente');
  }
} catch (error) {
  console.error('Error ejecutando SQL para tabla users:', error);
}

// Configurar RLS para la tabla users
console.log('Configurando RLS para tabla users...');
const setupUsersRLS = `
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  
  DROP POLICY IF EXISTS "Users can view own profile" ON users;
  CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);
  
  DROP POLICY IF EXISTS "Users can insert own profile" ON users;
  CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (true);
  
  DROP POLICY IF EXISTS "Users can update own profile" ON users;
  CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);
`;

try {
  const { error: rlsError } = await supabase.rpc('exec_sql', { sql: setupUsersRLS });
  if (rlsError) {
    console.error('Error configurando RLS para users:', rlsError);
  } else {
    console.log('✅ RLS configurado para tabla users');
  }
} catch (error) {
  console.error('Error ejecutando SQL para RLS de users:', error);
}

