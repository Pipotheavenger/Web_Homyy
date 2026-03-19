/**
 * Shared configuration for k6 stress tests
 * Used by setup.ts, cleanup.ts, and referenced by k6-lifecycle.js via manifest
 */

/** Number of client-worker pairs (50 pairs = 100 total users) */
export const PAIRS = 50;

/** Password for all stress test users */
export const STRESS_PASSWORD = 'StressTest123!';

/** Email pattern generators */
export function clientEmail(index: number): string {
  return `e2e.stress.client${index}@hommy.test`;
}
export function workerEmail(index: number): string {
  return `e2e.stress.worker${index}@hommy.test`;
}

/** Balance amount for each client (COP). Large enough to cover service + commission */
export const RECHARGE_AMOUNT = 2_000_000;

/** Proposed price for test services (COP) */
export const PROPOSED_PRICE = 200_000;

/** Commission percentage (matches system_settings default) */
export const COMMISSION_PERCENT = 10;

/** Path to manifest file written by setup, read by k6 */
export const MANIFEST_PATH = './test/stress/results/manifest.json';

/** Service template for direct DB insert */
export const SERVICE_TEMPLATE = {
  title: '[Stress Test] Servicio de limpieza',
  description: 'Servicio generado automaticamente para prueba de carga.',
  location: 'Bogota, Colombia',
  status: 'active',
  images: [],
};

/** Schedule template for direct DB insert */
export const SCHEDULE_TEMPLATE = {
  date_available: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0], // 7 days from now
  start_time: '09:00',
  end_time: '12:00',
};
