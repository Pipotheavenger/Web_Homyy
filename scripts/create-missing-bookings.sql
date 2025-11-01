-- Crear bookings para las transacciones de escrow existentes que no tienen booking

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
)
SELECT 
  e.service_id,
  e.client_id,
  e.worker_id,
  a.id as application_id,
  'scheduled' as status,
  'paid' as payment_status,
  e.amount as total_price,
  CURRENT_DATE as start_date,
  '09:00' as start_time,
  '17:00' as end_time
FROM escrow_transactions e
LEFT JOIN bookings b ON b.service_id = e.service_id AND b.worker_id = e.worker_id
LEFT JOIN applications a ON a.service_id = e.service_id AND a.worker_id = e.worker_id AND a.status = 'accepted'
WHERE b.id IS NULL
  AND e.status = 'pending';

-- Verificar los bookings creados
SELECT 
  b.id as booking_id,
  b.service_id,
  b.client_id,
  b.worker_id,
  b.application_id,
  b.status,
  b.payment_status,
  b.total_price,
  b.start_date,
  s.title as service_title
FROM bookings b
JOIN services s ON s.id = b.service_id
ORDER BY b.created_at DESC;
