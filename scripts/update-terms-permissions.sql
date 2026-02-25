-- Eliminar la política restrictiva anterior
DROP POLICY IF EXISTS "Solo admins pueden actualizar términos" ON terms_and_conditions;

-- Crear nueva política que permite a cualquier usuario autenticado actualizar
CREATE POLICY "Usuarios autenticados pueden actualizar términos"
  ON terms_and_conditions
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- También permitir INSERT para usuarios autenticados (por si no existe el registro)
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar términos" ON terms_and_conditions;

CREATE POLICY "Usuarios autenticados pueden insertar términos"
  ON terms_and_conditions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Verificar las políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'terms_and_conditions';


