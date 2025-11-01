-- Arreglar la función escrow_service_select_worker para que cree bookings automáticamente

-- Primero, eliminar la función existente si existe
DROP FUNCTION IF EXISTS escrow_service_select_worker(uuid, uuid, uuid, numeric);

-- Crear la función corregida que SÍ crea el booking
CREATE OR REPLACE FUNCTION escrow_service_select_worker(
  service_uuid UUID,
  worker_uuid UUID,
  application_uuid UUID,
  final_price NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id UUID;
  v_service_status TEXT;
  v_application_status TEXT;
  v_client_balance NUMERIC;
  v_escrow_id UUID;
  v_booking_id UUID;
  v_pin TEXT;
BEGIN
  -- 1. Verificar que el servicio existe y está activo
  SELECT user_id, status INTO v_client_id, v_service_status
  FROM services
  WHERE id = service_uuid;

  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Servicio no encontrado';
  END IF;

  IF v_service_status != 'active' THEN
    RAISE EXCEPTION 'El servicio no está activo';
  END IF;

  -- 2. Verificar que el usuario autenticado es el dueño del servicio
  IF v_client_id != auth.uid() THEN
    RAISE EXCEPTION 'No tienes permiso para seleccionar trabajadores en este servicio';
  END IF;

  -- 3. Verificar que la aplicación existe y está pendiente
  SELECT status INTO v_application_status
  FROM applications
  WHERE id = application_uuid
    AND service_id = service_uuid
    AND worker_id = worker_uuid;

  IF v_application_status IS NULL THEN
    RAISE EXCEPTION 'Aplicación no encontrada';
  END IF;

  IF v_application_status != 'pending' THEN
    RAISE EXCEPTION 'La aplicación ya fue procesada';
  END IF;

  -- 4. Verificar balance del cliente
  SELECT balance INTO v_client_balance
  FROM user_profiles
  WHERE user_id = v_client_id;

  IF v_client_balance < final_price THEN
    RAISE EXCEPTION 'Saldo insuficiente';
  END IF;

  -- 5. Generar PIN de 4 dígitos
  v_pin := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  -- 6. Crear la transacción de escrow
  INSERT INTO escrow_transactions (
    service_id,
    client_id,
    worker_id,
    amount,
    status,
    completion_pin
  ) VALUES (
    service_uuid,
    v_client_id,
    worker_uuid,
    final_price,
    'pending',
    v_pin
  )
  RETURNING id INTO v_escrow_id;

  -- 7. CREAR EL BOOKING (esto faltaba!)
  INSERT INTO bookings (
    service_id,
    client_id,
    worker_id,
    application_id,
    status,
    payment_status,
    total_price,
    start_date,
    start_time,
    end_time
  ) VALUES (
    service_uuid,
    v_client_id,
    worker_uuid,
    application_uuid,
    'scheduled',
    'paid',
    final_price,
    CURRENT_DATE,
    '09:00',
    '17:00'
  )
  RETURNING id INTO v_booking_id;

  -- 8. Actualizar el balance del cliente (restar el monto)
  UPDATE user_profiles
  SET balance = balance - final_price
  WHERE user_id = v_client_id;

  -- 9. Actualizar el estado del servicio
  UPDATE services
  SET status = 'hired'
  WHERE id = service_uuid;

  -- 10. Actualizar la aplicación seleccionada a 'accepted'
  UPDATE applications
  SET status = 'accepted'
  WHERE id = application_uuid;

  -- 11. Rechazar las demás aplicaciones del mismo servicio
  UPDATE applications
  SET status = 'rejected'
  WHERE service_id = service_uuid
    AND id != application_uuid
    AND status = 'pending';

  -- 12. Retornar el resultado con el booking_id
  RETURN json_build_object(
    'success', true,
    'escrow_transaction_id', v_escrow_id,
    'booking_id', v_booking_id,
    'pin', v_pin
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Dar permisos a usuarios autenticados
GRANT EXECUTE ON FUNCTION escrow_service_select_worker(uuid, uuid, uuid, numeric) TO authenticated;

-- Comentario
COMMENT ON FUNCTION escrow_service_select_worker IS 'Selecciona un trabajador para un servicio, crea escrow, booking y actualiza balances';
