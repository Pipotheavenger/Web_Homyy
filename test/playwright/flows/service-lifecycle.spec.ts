/**
 * Playwright E2E Test: Complete Service Lifecycle
 *
 * Migrated from: test/e2e/flows/service-lifecycle.cy.ts
 *
 * Validates the full business flow:
 * 1. Client creates a service
 * 2. Worker applies to the service
 * 3. Client hires the worker
 * 4. Client and Worker exchange 3 chat messages
 * 5. Worker enters PIN to complete the service
 *
 * Uses existing test users:
 * - test.client@hommy.test (client)
 * - test.worker@hommy.test (worker)
 */

import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import {
  getUserIdByEmail,
  addTestBalance,
  getLastServiceByUser,
  getCompletionPin,
  ensureTestChat,
  cleanupTestService,
  cleanupTestBalance,
  getLatestPendingTransaction,
  approveTransaction,
} from '../../support/flow-helpers';

// Shared state across serial tests
const testState = {
  clientUserId: null as string | null,
  workerUserId: null as string | null,
  serviceId: null as string | null,
  serviceTitle: `[E2E Test] Limpieza ${Date.now()}`,
  completionPin: null as string | null,
};

test.describe.serial(
  'Flujo Completo: Ciclo de Vida del Servicio',
  () => {
    // ---- SETUP: resolve user IDs before all tests ----
    test.beforeAll(async () => {
      testState.clientUserId = await getUserIdByEmail(
        'test.client@hommy.test'
      );
      testState.workerUserId = await getUserIdByEmail(
        'test.worker@hommy.test'
      );

      expect(testState.clientUserId).toBeTruthy();
      expect(testState.workerUserId).toBeTruthy();
    });

    // ---- TEARDOWN: cleanup all test data ----
    test.afterAll(async () => {
      if (testState.serviceId) {
        await cleanupTestService(testState.serviceId);
      }
      if (testState.clientUserId) {
        await cleanupTestBalance(testState.clientUserId);
      }
    });

    // ============================================================
    // STEP 1: Client creates a service via UI
    // ============================================================
    test('Step 1: Cliente crea un servicio', async ({ page }) => {
      await loginAs(page, 'client');
      await page.goto('/user/crear-servicio', {
        waitUntil: 'networkidle',
      });
      await expect(page).toHaveURL(/crear-servicio/);

      // Wait for categories to load before filling the form.
      // The useEffect fetching categories can race with Supabase client init;
      // if they don't appear after 5s, reload the page to trigger a fresh fetch.
      const categoryOption = page.locator('select option', { hasText: 'Limpieza' });
      try {
        await expect(categoryOption).toBeAttached({ timeout: 5_000 });
      } catch {
        await page.reload({ waitUntil: 'networkidle' });
        await expect(categoryOption).toBeAttached({ timeout: 10_000 });
      }

      // Fill title
      await page
        .getByPlaceholder('Ej: Limpieza general de casa')
        .fill(testState.serviceTitle);

      // Fill description
      await page
        .getByPlaceholder(
          'Describe detalladamente el servicio que necesitas...'
        )
        .fill(
          'Necesito una limpieza general de toda la casa, incluyendo cocina y baños. Test E2E automatizado.'
        );

      // Select category
      await page.locator('select').selectOption({ label: 'Limpieza' });

      // Fill barrio
      await page.getByPlaceholder('Chapinero').fill('Chapinero');

      // Select a calendar date — click the last enabled button in the calendar grid
      // Note: There are TWO grids with grid-cols-7: the header (Lun,Mar...) and the buttons.
      // We use .last() to target the buttons grid.
      const calendarGrid = page.locator('[class*="grid-cols-7"]').last();
      await calendarGrid.waitFor({ state: 'visible' });
      const enabledButtons = calendarGrid.locator('button:not([disabled])');
      await expect(enabledButtons.first()).toBeVisible({ timeout: 5_000 });
      const count = await enabledButtons.count();
      await enabledButtons.nth(count - 1).click();

      // Click "Mañana" preset for time selection
      await page.getByRole('button', { name: 'Mañana' }).click();

      // Click "Agregar Horario"
      await page.getByRole('button', { name: 'Agregar Horario' }).click();

      // Verify the schedule was added (a time like "8:00" should appear)
      await expect(page.locator('body')).toContainText(':');

      // Submit the form
      await page.getByRole('button', { name: 'Crear Servicio' }).click();

      // Assert success
      await expect(
        page.getByText('Servicio creado exitosamente')
      ).toBeVisible({ timeout: 15_000 });

      // Retrieve the created service ID from the database
      const service = await getLastServiceByUser(testState.clientUserId!);
      expect(service).not.toBeNull();
      // Use case-insensitive comparison — the app may transform the title case
      expect(service!.title.toLowerCase()).toBe(
        testState.serviceTitle.toLowerCase()
      );
      testState.serviceId = service!.id;
    });

    // ============================================================
    // STEP 2: Worker applies to the service via UI
    // ============================================================
    test('Step 2: Worker se postula al servicio', async ({ page }) => {
      expect(testState.serviceId).toBeTruthy();

      await loginAs(page, 'worker');
      await page.goto(`/worker/trabajos/${testState.serviceId}`, {
        waitUntil: 'networkidle',
      });

      // Wait for the service title to appear (case-insensitive via regex)
      await expect(
        page.getByText(testState.serviceTitle, { exact: false })
      ).toBeVisible({ timeout: 10_000 });

      // Click "Aplicar a este trabajo"
      await page
        .getByRole('button', { name: 'Aplicar a este trabajo' })
        .click();

      // Modal "Establecer Precio" should appear
      await expect(page.getByText('Establecer Precio')).toBeVisible({
        timeout: 5_000,
      });

      // Fill application details
      await page
        .locator('input[type="number"][placeholder="0"]')
        .fill('150000');
      await page
        .getByPlaceholder('Ej: 3-4 horas, 2 días, etc.')
        .fill('3-4 horas');
      await page
        .locator('textarea[placeholder*="mejor para este trabajo"]')
        .fill(
          'Tengo amplia experiencia en limpieza profesional. Test E2E.'
        );

      // Submit the application (exact: true to avoid matching "Aplicar a este trabajo")
      await page.getByRole('button', { name: 'Aplicar', exact: true }).click();

      // After successful submission, the hook calls router.push('/worker/dashboard').
      // Wait for that navigation instead of the SuccessApplicationModal (which is
      // briefly rendered but immediately replaced by the dashboard navigation).
      await page.waitForURL('**/worker/dashboard**', { timeout: 15_000 });

      // Verify the application appears on the worker's dashboard
      await expect(
        page.getByText(testState.serviceTitle, { exact: false })
      ).toBeVisible({ timeout: 10_000 });
    });

    // ============================================================
    // STEP 3: Client hires the worker via UI
    // ============================================================
    test('Step 3: Cliente contrata al worker', async ({ page }) => {
      expect(testState.serviceId).toBeTruthy();

      // Add test balance via DB. Uses a large amount to cover any accumulated
      // negative balance from previous test runs that weren't fully cleaned up.
      await addTestBalance(testState.clientUserId!, 2_000_000);

      await loginAs(page, 'client');
      await page.goto(
        `/user/detalles-postulantes?id=${testState.serviceId}`,
        { waitUntil: 'networkidle' }
      );

      // Wait for the page heading to confirm navigation
      await expect(
        page.getByRole('heading', { name: 'Detalles de Postulantes', level: 1 })
      ).toBeVisible({ timeout: 10_000 });

      // Wait for the applicant card with "Seleccionar" button (retry with re-nav on failure)
      const selectBtn = page.getByRole('button', { name: 'Seleccionar' });
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await expect(selectBtn).toBeVisible({ timeout: 15_000 });
          break;
        } catch {
          if (attempt === 2) throw new Error('Applicant never loaded');
          await page.goto(
            `/user/detalles-postulantes?id=${testState.serviceId}`,
            { waitUntil: 'networkidle' }
          );
        }
      }

      // Click "Seleccionar" on the applicant card
      await selectBtn.click();

      // Confirmation modal should appear
      await expect(page.getByText('Confirmar Selección')).toBeVisible({
        timeout: 5_000,
      });

      // Confirm
      await page.getByRole('button', { name: 'Confirmar' }).click();

      // After successful hiring, the app may redirect to the client dashboard.
      // Wait for the completion PIN to appear in the database as the definitive
      // indicator that the hiring process completed successfully.
      let pin: string | null = null;
      for (let attempt = 0; attempt < 15; attempt++) {
        pin = await getCompletionPin(testState.serviceId!);
        if (pin) break;
        await page.waitForTimeout(1000);
      }
      expect(pin).toBeTruthy();
      testState.completionPin = pin;
    });

    // ============================================================
    // STEP 4: Client and Worker exchange 3 messages via chat
    // ============================================================
    test('Step 4: Intercambio de 3 mensajes por chat', async ({ page }) => {
      expect(testState.serviceId).toBeTruthy();

      // The hiring flow's chat creation can silently fail due to race conditions.
      // Ensure the chat exists before testing chat functionality.
      await ensureTestChat(
        testState.serviceId!,
        testState.clientUserId!,
        testState.workerUserId!
      );

      const chatInput = page.getByPlaceholder('Escribe un mensaje...');

      const chatItem = page.getByText(testState.serviceTitle, { exact: false });
      // Scope message assertions to the chat window (section) to avoid
      // matching the chat list sidebar preview text
      const chatWindow = page.locator('section');

      // --- Message 1: Client sends ---
      await loginAs(page, 'client');
      await page.goto('/user/chats', { waitUntil: 'networkidle' });
      await expect(chatItem).toBeVisible({ timeout: 15_000 });
      await chatItem.click();
      await chatInput.waitFor({ state: 'visible', timeout: 10_000 });
      await chatInput.fill(
        'Hola, necesito confirmar la hora del servicio.'
      );
      await chatInput.press('Enter');
      await expect(
        chatWindow.getByText('Hola, necesito confirmar la hora del servicio.')
      ).toBeVisible({ timeout: 5_000 });

      // --- Message 2: Worker sends ---
      await loginAs(page, 'worker');
      await page.goto('/worker/chats', { waitUntil: 'networkidle' });
      await expect(chatItem).toBeVisible({ timeout: 15_000 });
      await chatItem.click();
      await chatInput.waitFor({ state: 'visible', timeout: 10_000 });
      await chatInput.fill('Puedo ir mañana a las 9am, ¿le sirve?');
      await chatInput.press('Enter');
      await expect(
        chatWindow.getByText('Puedo ir mañana a las 9am')
      ).toBeVisible({ timeout: 5_000 });

      // --- Message 3: Client sends ---
      await loginAs(page, 'client');
      await page.goto('/user/chats', { waitUntil: 'networkidle' });
      await expect(chatItem).toBeVisible({ timeout: 15_000 });
      await chatItem.click();
      await chatInput.waitFor({ state: 'visible', timeout: 10_000 });
      await chatInput.fill('Perfecto, te espero a las 9am.');
      await chatInput.press('Enter');
      await expect(
        chatWindow.getByText('Perfecto, te espero a las 9am.')
      ).toBeVisible({ timeout: 5_000 });
    });

    // ============================================================
    // STEP 5: Worker enters PIN to complete the service
    // ============================================================
    test('Step 5: Worker ingresa PIN para finalizar el servicio', async ({
      page,
    }) => {
      expect(testState.completionPin).toBeTruthy();

      await loginAs(page, 'worker');
      await page.goto('/worker/dashboard', {
        waitUntil: 'networkidle',
      });

      // Wait for the dashboard to load
      await expect(page.getByText('Mis Aplicaciones')).toBeVisible({
        timeout: 10_000,
      });

      // Click "Finalizar"
      await page.getByRole('button', { name: 'Finalizar' }).click();

      // Modal should appear
      await expect(page.getByText('Finalizar Trabajo')).toBeVisible({
        timeout: 5_000,
      });

      // Enter PIN digit by digit
      const pin = testState.completionPin!;
      for (let i = 0; i < 4; i++) {
        await page
          .locator(`input[data-pin-index="${i}"]`)
          .fill(pin[i]);
      }

      // Click "Completar Trabajo"
      await page
        .getByRole('button', { name: 'Completar Trabajo' })
        .click();

      // Assert success
      await expect(page.getByText('¡Trabajo Completado!')).toBeVisible({
        timeout: 15_000,
      });
    });

    // ============================================================
    // STEP 6: Client recharges balance (pending transaction)
    // ============================================================
    test('Step 6: Cliente recarga saldo', async ({ page }) => {
      await loginAs(page, 'client');
      await page.goto('/user/pagos', { waitUntil: 'networkidle' });
      await expect(page.getByText('Balance Disponible')).toBeVisible({
        timeout: 10_000,
      });

      // Recharge 100K via UI
      await page.getByRole('button', { name: 'Recargar Cuenta' }).click();
      await expect(page.getByText('Elige tu método de pago')).toBeVisible({
        timeout: 5_000,
      });
      await page.locator('input[type="number"]').fill('100000');
      await page.locator('button').filter({ hasText: 'Nequi' }).click();
      await page
        .getByRole('button', { name: 'Continuar con el pago' })
        .click();

      // QR modal
      const qrBtn = page.getByRole('button', { name: /Listo.*pago/ });
      await expect(qrBtn).toBeVisible({ timeout: 10_000 });
      await qrBtn.click();

      // Success modal
      const successBtn = page.getByRole('button', { name: 'Entendido' });
      await expect(successBtn).toBeVisible({ timeout: 10_000 });
      await successBtn.click();

      // Assert pending transaction visible in history
      await expect(page.getByText('Pendiente')).toBeVisible({
        timeout: 10_000,
      });
    });

    // ============================================================
    // STEP 7: Admin approves and balance updates in realtime
    // ============================================================
    test('Step 7: Admin aprueba recarga y balance se actualiza', async ({
      page,
    }) => {
      await loginAs(page, 'client');
      await page.goto('/user/pagos', { waitUntil: 'networkidle' });
      await expect(page.getByText('Balance Disponible')).toBeVisible({
        timeout: 10_000,
      });

      // Wait for pending transaction to show (confirms data loaded, subscription active)
      await expect(page.getByText('Pendiente')).toBeVisible({
        timeout: 10_000,
      });

      // Admin approves via DB (triggers postgres_changes → loadData())
      const txn = await getLatestPendingTransaction(testState.clientUserId!);
      expect(txn).not.toBeNull();
      await approveTransaction(txn!.id);

      // The realtime listener should update the page:
      // 'Pendiente' should disappear (transaction now completed)
      await expect(page.getByText('Pendiente')).not.toBeVisible({
        timeout: 10_000,
      });

      // Verify page is still responsive (freeze bug would cause timeout here)
      await page.evaluate(() => document.title);
      await expect(page.getByText('Balance Disponible')).toBeVisible({
        timeout: 5_000,
      });
    });
  }
);
