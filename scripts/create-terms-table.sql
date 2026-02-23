-- Crear tabla para términos y condiciones
CREATE TABLE IF NOT EXISTS terms_and_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  version INTEGER DEFAULT 1
);

-- Insertar contenido inicial vacío
INSERT INTO terms_and_conditions (content, version)
VALUES ('<h2>Términos y Condiciones</h2><p>Contenido pendiente de configuración.</p>', 1)
ON CONFLICT DO NOTHING;

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


