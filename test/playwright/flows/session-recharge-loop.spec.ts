/**
 * Playwright E2E Test: Session Persistence & Recharge Loop
 *
 * Diagnoses two reported bugs:
 *
 * BUG 1 - Session freezes on realtime approval:
 *   When admin approves a recharge while the user is on /user/pagos,
 *   the postgres_changes listener fires loadData() which crashes/freezes the session.
 *
 * BUG 2 - Session corruption on re-login:
 *   After logout, the user cannot log back in without clearing browser data.
 *
 * Uses real UI login (not session injection) to reproduce actual user behavior.
 */

import { test, expect } from '@playwright/test';
import {
  uiLogin,
  uiLogout,
  uiRechargeFromCurrentPage,
  assertBalance,
  assertPageResponsive,
} from '../helpers/ui-actions';
import {
  getUserIdByEmail,
  getLatestPendingTransaction,
  approveTransaction,
  cleanupTestTransactions,
  cleanupTestService,
  getLastServiceByUser,
} from '../../support/flow-helpers';

// Shared state across serial tests
const testState = {
  clientUserId: null as string | null,
  serviceIds: [] as string[],
  expectedBalance: 0,
};

test.describe.serial('Persistencia de Sesion y Recarga', () => {
  test.beforeAll(async () => {
    testState.clientUserId = await getUserIdByEmail('test.client@hommy.test');
    expect(testState.clientUserId).toBeTruthy();
    await cleanupTestTransactions(testState.clientUserId!);
  });

  test.afterAll(async () => {
    for (const id of testState.serviceIds) {
      await cleanupTestService(id);
    }
    if (testState.clientUserId) {
      await cleanupTestTransactions(testState.clientUserId);
    }
  });

  // ====== BUG 1: FREEZE EN TIEMPO REAL ======
  // Reproduces the bug where the session freezes when the admin
  // approves a recharge while the user stays on /user/pagos.

  test('BUG1: Sesion no debe congelarse cuando admin aprueba recarga en tiempo real', async ({
    page,
  }) => {
    // 1. Login via UI
    await uiLogin(page, 'test.client@hommy.test', 'TestClient123!');
    await expect(page).toHaveURL(/\/user\/dashboard/);

    // 2. Navigate to pagos
    await page.goto('/user/pagos', { waitUntil: 'networkidle' });
    await expect(page.getByText('Balance Disponible')).toBeVisible({
      timeout: 10_000,
    });

    // 3. Recharge — creates a 'pendiente' transaction
    await uiRechargeFromCurrentPage(page, 50_000);
    await expect(page.getByText('Pendiente')).toBeVisible({ timeout: 10_000 });

    // 4. STAY ON PAGE — realtime subscription is active

    // 5. Admin approves via DB (triggers postgres_changes → loadData())
    const txn = await getLatestPendingTransaction(testState.clientUserId!);
    expect(txn).not.toBeNull();
    await approveTransaction(txn!.id);
    testState.expectedBalance += 50_000;

    // 6. Verify page not frozen and realtime updated
    //    If the freeze bug is present, assertPageResponsive will timeout.
    await assertPageResponsive(page);
    await expect(page.getByText('Completada')).toBeVisible({ timeout: 10_000 });
    await assertBalance(page, testState.expectedBalance);

    // 7. Verify user can still interact
    await page.getByText('Balance Disponible').click();
  });

  // ====== BUG 1-bis: SEGUNDA RECARGA EN MISMA SESION ======

  test('BUG1-bis: Segunda recarga en misma sesion tambien funciona', async ({
    page,
  }) => {
    // New page fixture — re-login to simulate continued session
    await uiLogin(page, 'test.client@hommy.test', 'TestClient123!');
    await page.goto('/user/pagos', { waitUntil: 'networkidle' });
    await expect(page.getByText('Balance Disponible')).toBeVisible({
      timeout: 10_000,
    });

    await uiRechargeFromCurrentPage(page, 30_000);
    await expect(page.getByText('Pendiente')).toBeVisible({ timeout: 10_000 });

    const txn = await getLatestPendingTransaction(testState.clientUserId!);
    expect(txn).not.toBeNull();
    await approveTransaction(txn!.id);
    testState.expectedBalance += 30_000;

    await assertPageResponsive(page);
    await assertBalance(page, testState.expectedBalance);
  });

  // ====== BUG 2: CORRUPCION DE SESION EN RE-LOGIN ======
  // Repeats the login → recharge → logout → re-login cycle 3 times.

  for (let i = 1; i <= 3; i++) {
    test(`BUG2-Iteracion ${i}: Logout y re-login despues de recarga`, async ({
      page,
    }) => {
      // 1. Login
      await uiLogin(page, 'test.client@hommy.test', 'TestClient123!');
      await expect(page).toHaveURL(/\/user\/dashboard/);

      // 2. Create service via UI
      await page.goto('/user/crear-servicio', { waitUntil: 'networkidle' });
      const categoryOption = page.locator('select option', {
        hasText: 'Limpieza',
      });
      try {
        await expect(categoryOption).toBeAttached({ timeout: 5_000 });
      } catch {
        await page.reload({ waitUntil: 'networkidle' });
        await expect(categoryOption).toBeAttached({ timeout: 10_000 });
      }

      const serviceTitle = `[E2E Loop] Servicio ${i} - ${Date.now()}`;
      await page
        .getByPlaceholder('Ej: Limpieza general de casa')
        .fill(serviceTitle);
      await page
        .getByPlaceholder(
          'Describe detalladamente el servicio que necesitas...'
        )
        .fill(
          'Test E2E automatizado para verificar persistencia de sesion.'
        );
      await page.locator('select').selectOption({ label: 'Limpieza' });
      await page.getByPlaceholder('Chapinero').fill('Chapinero');

      // Select calendar date
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

      // Store service ID for cleanup
      const service = await getLastServiceByUser(testState.clientUserId!);
      if (service) testState.serviceIds.push(service.id);

      // 3. Recharge
      await page.goto('/user/pagos', { waitUntil: 'networkidle' });
      await expect(page.getByText('Balance Disponible')).toBeVisible({
        timeout: 10_000,
      });
      await uiRechargeFromCurrentPage(page, 50_000);

      // 4. Logout
      await uiLogout(page);
      await expect(page).toHaveURL(/\/login/);

      // 5. Approve recharge via DB
      const txn = await getLatestPendingTransaction(testState.clientUserId!);
      expect(txn).not.toBeNull();
      await approveTransaction(txn!.id);
      testState.expectedBalance += 50_000;

      // 6. Re-login — CRITICAL: if session is corrupted, this will fail
      await uiLogin(page, 'test.client@hommy.test', 'TestClient123!');
      await expect(page).toHaveURL(/\/user\/dashboard/);

      // 7. Verify balance
      await page.goto('/user/pagos', { waitUntil: 'networkidle' });
      await expect(page.getByText('Balance Disponible')).toBeVisible({
        timeout: 10_000,
      });
      await assertBalance(page, testState.expectedBalance);
    });
  }
});
