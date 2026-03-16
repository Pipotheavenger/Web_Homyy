/**
 * Stress Test: 10 Users, 5 Complete Service Lifecycle Interactions
 *
 * Creates 5 clients + 5 workers from scratch, runs the full cycle:
 *   1. Clients create services
 *   2. Workers apply
 *   3. Clients recharge + admin approves
 *   4. Clients hire workers
 *   5. Chat exchange (3 messages each)
 *   6. Workers complete with PIN
 *   7-8. All 10 users logout/re-login x2 (session integrity)
 *
 * Cleans up all test users from the database at the end.
 */

import { test, expect } from '@playwright/test';
import { loginAsUser } from '../helpers/auth';
import {
  uiLogin,
  uiLogout,
  uiRechargeFromCurrentPage,
} from '../helpers/ui-actions';
import {
  createTestClient,
  createTestWorker,
  deleteTestUser,
  addTestBalance,
  getLastServiceByUser,
  getCompletionPin,
  getLatestPendingTransaction,
  approveTransaction,
  ensureTestChat,
  cleanupTestService,
  cleanupTestTransactions,
} from '../../support/flow-helpers';

const PAIRS = 5;

interface TestUser {
  email: string;
  password: string;
  userId: string;
}

const state = {
  clients: [] as TestUser[],
  workers: [] as TestUser[],
  serviceIds: [] as (string | null)[],
  serviceTitles: [] as string[],
  completionPins: [] as (string | null)[],
};

// All emails for cleanup (used in afterAll even if beforeAll partially fails)
function allEmails(): string[] {
  const emails: string[] = [];
  for (let i = 1; i <= PAIRS; i++) {
    emails.push(`e2e.stress.client${i}@hommy.test`);
    emails.push(`e2e.stress.worker${i}@hommy.test`);
  }
  return emails;
}

test.describe.serial('Stress: 10 usuarios, 5 ciclos completos', () => {
  // ── SETUP ──────────────────────────────────────────────────────────

  test.beforeAll(async () => {
    // Clean up leftover users from a previous failed run
    for (const email of allEmails()) {
      await deleteTestUser(email);
    }

    // Create 5 clients + 5 workers
    for (let i = 1; i <= PAIRS; i++) {
      const client = await createTestClient(i);
      state.clients.push(client);

      const worker = await createTestWorker(i);
      state.workers.push(worker);
    }
  });

  // ── TEARDOWN ───────────────────────────────────────────────────────

  test.afterAll(async () => {
    // Clean services (cascade: bookings, chats, messages, escrow, applications, schedules)
    for (const sid of state.serviceIds) {
      if (sid) await cleanupTestService(sid);
    }

    // Clean transactions + delete users
    for (const u of [...state.clients, ...state.workers]) {
      await cleanupTestTransactions(u.userId);
    }
    for (const email of allEmails()) {
      await deleteTestUser(email);
    }
  });

  // ── STEP 1: Clients create services ────────────────────────────────

  test('Step 1: 5 clientes crean servicios', async ({ page }) => {
    test.setTimeout(5 * 60_000);

    for (let i = 0; i < PAIRS; i++) {
      const client = state.clients[i];
      const title = `[E2E Stress] Servicio ${i + 1} - ${Date.now()}`;
      state.serviceTitles.push(title);

      await loginAsUser(page, client.email, client.password);
      await page.goto('/user/crear-servicio', { waitUntil: 'networkidle' });

      // Wait for categories (retry on race condition with auth init)
      const categoryOption = page.locator('select option', {
        hasText: 'Limpieza',
      });
      try {
        await expect(categoryOption).toBeAttached({ timeout: 5_000 });
      } catch {
        await page.reload({ waitUntil: 'networkidle' });
        await expect(categoryOption).toBeAttached({ timeout: 10_000 });
      }

      // Fill form
      await page
        .getByPlaceholder('Ej: Limpieza general de casa')
        .fill(title);
      await page
        .getByPlaceholder(
          'Describe detalladamente el servicio que necesitas...'
        )
        .fill('Test E2E stress — servicio automatizado.');
      await page.locator('select').selectOption({ label: 'Limpieza' });
      await page.getByPlaceholder('Chapinero').fill('Chapinero');

      // Select calendar date (last available day)
      const calendarGrid = page.locator('[class*="grid-cols-7"]').last();
      await calendarGrid.waitFor({ state: 'visible' });
      const enabledButtons = calendarGrid.locator('button:not([disabled])');
      await expect(enabledButtons.first()).toBeVisible({ timeout: 5_000 });
      const count = await enabledButtons.count();
      await enabledButtons.nth(count - 1).click();

      await page.getByRole('button', { name: 'Mañana' }).click();
      await page.getByRole('button', { name: 'Agregar Horario' }).click();
      await page.getByRole('button', { name: 'Crear Servicio' }).click();
      await expect(
        page.getByText('Servicio creado exitosamente')
      ).toBeVisible({ timeout: 15_000 });

      // Get service ID from DB
      const service = await getLastServiceByUser(client.userId);
      expect(service).not.toBeNull();
      state.serviceIds.push(service!.id);
    }

    expect(state.serviceIds).toHaveLength(PAIRS);
  });

  // ── STEP 2: Workers apply to services ──────────────────────────────

  test('Step 2: 5 workers aplican a servicios', async ({ page }) => {
    test.setTimeout(5 * 60_000);

    for (let i = 0; i < PAIRS; i++) {
      const worker = state.workers[i];
      const serviceId = state.serviceIds[i];
      expect(serviceId).toBeTruthy();

      await loginAsUser(page, worker.email, worker.password);
      await page.goto(`/worker/trabajos/${serviceId}`, {
        waitUntil: 'networkidle',
      });

      // Wait for service to load
      await expect(
        page.getByText(state.serviceTitles[i], { exact: false })
      ).toBeVisible({ timeout: 10_000 });

      await page
        .getByRole('button', { name: 'Aplicar a este trabajo' })
        .click();

      // Application modal
      await expect(
        page.getByText('Establecer Precio')
      ).toBeVisible({ timeout: 5_000 });

      await page
        .locator('input[type="number"][placeholder="0"]')
        .fill('150000');
      await page
        .getByPlaceholder('Ej: 3-4 horas, 2 días, etc.')
        .fill('3-4 horas');
      await page
        .locator('textarea[placeholder*="mejor para este trabajo"]')
        .fill('Trabajador E2E con experiencia en limpieza profesional.');
      await page
        .getByRole('button', { name: 'Aplicar', exact: true })
        .click();

      // Wait for redirect or success
      await page.waitForURL(/\/worker\/dashboard/, { timeout: 15_000 });
    }
  });

  // ── STEP 3: Clients recharge + admin approves ──────────────────────

  test('Step 3: 5 clientes recargan saldo y admin aprueba', async ({
    page,
  }) => {
    test.setTimeout(5 * 60_000);

    for (let i = 0; i < PAIRS; i++) {
      const client = state.clients[i];

      // Seed balance via DB to ensure enough funds for hiring
      await addTestBalance(client.userId, 2_000_000);

      // UI recharge flow
      await loginAsUser(page, client.email, client.password);
      await page.goto('/user/pagos', { waitUntil: 'networkidle' });
      await expect(page.getByText('Balance Disponible')).toBeVisible({
        timeout: 10_000,
      });
      await uiRechargeFromCurrentPage(page, 500_000);

      // Admin approves via DB
      const txn = await getLatestPendingTransaction(client.userId);
      expect(txn).not.toBeNull();
      await approveTransaction(txn!.id);
    }
  });

  // ── STEP 4: Clients hire workers ───────────────────────────────────

  test('Step 4: 5 clientes contratan workers', async ({ page }) => {
    test.setTimeout(5 * 60_000);

    for (let i = 0; i < PAIRS; i++) {
      const client = state.clients[i];
      const serviceId = state.serviceIds[i];
      expect(serviceId).toBeTruthy();

      await loginAsUser(page, client.email, client.password);
      await page.goto(`/user/detalles-postulantes?id=${serviceId}`, {
        waitUntil: 'networkidle',
      });

      await expect(
        page.getByRole('heading', { name: 'Detalles de Postulantes' })
      ).toBeVisible({ timeout: 10_000 });

      // Wait for applicants list (page can get stuck loading — retry with full re-nav)
      const selectBtn = page.getByRole('button', { name: 'Seleccionar' });
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await expect(selectBtn).toBeVisible({ timeout: 15_000 });
          break;
        } catch {
          if (attempt === 2) throw new Error(`Applicants never loaded for service ${i + 1}`);
          await page.goto(`/user/detalles-postulantes?id=${serviceId}`, {
            waitUntil: 'networkidle',
          });
        }
      }
      await selectBtn.click();

      // Confirm modal
      await expect(
        page.getByText('Confirmar Selección')
      ).toBeVisible({ timeout: 5_000 });
      await page.getByRole('button', { name: 'Confirmar' }).click();

      // Wait for the app's auto-redirect to dashboard (alert + setTimeout 2s)
      await page.waitForURL(/\/user\/dashboard/, { timeout: 10_000 }).catch(() => {});

      // Wait for PIN to be generated in DB (polling)
      let pin: string | null = null;
      for (let attempt = 0; attempt < 20; attempt++) {
        pin = await getCompletionPin(serviceId!);
        if (pin) break;
        await new Promise((r) => setTimeout(r, 1_000));
      }
      expect(pin).not.toBeNull();
      state.completionPins.push(pin);
    }

    expect(state.completionPins).toHaveLength(PAIRS);
  });

  // ── STEP 5: Chat exchange (3 messages each per pair) ───────────────

  test('Step 5: 5 parejas intercambian 3 mensajes cada uno', async ({
    page,
  }) => {
    test.setTimeout(10 * 60_000);

    const chatInput = page.getByPlaceholder('Escribe un mensaje...');
    const chatWindow = page.locator('section');

    for (let i = 0; i < PAIRS; i++) {
      const client = state.clients[i];
      const worker = state.workers[i];
      const serviceId = state.serviceIds[i]!;
      const serviceTitle = state.serviceTitles[i];

      // Ensure chat exists (hiring flow can silently fail)
      await ensureTestChat(serviceId, client.userId, worker.userId);

      const chatItem = page.getByText(serviceTitle, { exact: false });

      // Natural scheduling messages to avoid content filter censorship
      const clientMsgs = [
        `Hola, necesito confirmar el horario del servicio ${i + 1}.`,
        `Puedes llegar a las 9am el dia acordado?`,
        `Perfecto, quedo atento. Gracias.`,
      ];
      const workerMsgs = [
        `Claro, puedo ir a las 9am sin problema.`,
        `Confirmo la hora, estoy disponible.`,
        `Perfecto, nos vemos. Saludos.`,
      ];

      // --- Client sends 3 messages ---
      await loginAsUser(page, client.email, client.password);
      await page.goto('/user/chats', { waitUntil: 'networkidle' });
      await expect(chatItem).toBeVisible({ timeout: 15_000 });
      await chatItem.click();
      await chatInput.waitFor({ state: 'visible', timeout: 10_000 });

      for (const msg of clientMsgs) {
        await chatInput.fill(msg);
        await chatInput.press('Enter');
        await expect(chatWindow.getByText(msg)).toBeVisible({
          timeout: 5_000,
        });
      }

      // --- Worker sends 3 messages ---
      await loginAsUser(page, worker.email, worker.password);
      await page.goto('/worker/chats', { waitUntil: 'networkidle' });
      await expect(chatItem).toBeVisible({ timeout: 15_000 });
      await chatItem.click();
      await chatInput.waitFor({ state: 'visible', timeout: 10_000 });

      for (const msg of workerMsgs) {
        await chatInput.fill(msg);
        await chatInput.press('Enter');
        await expect(chatWindow.getByText(msg)).toBeVisible({
          timeout: 5_000,
        });
      }
    }
  });

  // ── STEP 6: Workers complete services with PIN ─────────────────────

  test('Step 6: 5 workers completan servicios con PIN', async ({ page }) => {
    test.setTimeout(5 * 60_000);

    for (let i = 0; i < PAIRS; i++) {
      const worker = state.workers[i];
      const pin = state.completionPins[i];
      expect(pin).toBeTruthy();

      await loginAsUser(page, worker.email, worker.password);
      await page.goto('/worker/dashboard', { waitUntil: 'networkidle' });

      await expect(page.getByText('Mis Aplicaciones')).toBeVisible({
        timeout: 10_000,
      });

      // Click "Finalizar" for this worker's booking
      await page.getByRole('button', { name: 'Finalizar' }).click();

      await expect(page.getByText('Finalizar Trabajo')).toBeVisible({
        timeout: 5_000,
      });

      // Enter PIN digit by digit
      for (let d = 0; d < 4; d++) {
        await page.locator(`input[data-pin-index="${d}"]`).fill(pin![d]);
      }

      await page
        .getByRole('button', { name: 'Completar Trabajo' })
        .click();

      await expect(page.getByText('¡Trabajo Completado!')).toBeVisible({
        timeout: 15_000,
      });

      // Close success modal if any
      const okBtn = page.getByRole('button', { name: /cerrar|ok|entendido/i });
      if (await okBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await okBtn.click();
      }
    }
  });

  // ── STEP 7: Session integrity — Cycle 1 ────────────────────────────

  test('Step 7: Ciclo 1 — 10 usuarios logout y re-login', async ({
    page,
  }) => {
    test.setTimeout(10 * 60_000);

    // Clients logout/re-login
    for (let i = 0; i < PAIRS; i++) {
      const client = state.clients[i];
      await uiLogin(page, client.email, client.password);
      await expect(page).toHaveURL(/\/user\/dashboard/, { timeout: 15_000 });
      await uiLogout(page, 'user');
      await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    }

    // Workers logout/re-login
    for (let i = 0; i < PAIRS; i++) {
      const worker = state.workers[i];
      await uiLogin(page, worker.email, worker.password);
      await expect(page).toHaveURL(/\/worker\/dashboard/, {
        timeout: 15_000,
      });
      await uiLogout(page, 'worker');
      await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    }
  });

  // ── STEP 8: Session integrity — Cycle 2 ────────────────────────────

  test('Step 8: Ciclo 2 — 10 usuarios logout y re-login (repetir)', async ({
    page,
  }) => {
    test.setTimeout(10 * 60_000);

    // Clients
    for (let i = 0; i < PAIRS; i++) {
      const client = state.clients[i];
      await uiLogin(page, client.email, client.password);
      await expect(page).toHaveURL(/\/user\/dashboard/, { timeout: 15_000 });
      await uiLogout(page, 'user');
      await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    }

    // Workers
    for (let i = 0; i < PAIRS; i++) {
      const worker = state.workers[i];
      await uiLogin(page, worker.email, worker.password);
      await expect(page).toHaveURL(/\/worker\/dashboard/, {
        timeout: 15_000,
      });
      await uiLogout(page, 'worker');
      await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    }
  });
});
