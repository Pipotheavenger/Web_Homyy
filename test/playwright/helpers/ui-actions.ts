/**
 * UI interaction helpers for Playwright E2E tests.
 * These perform real UI interactions (no session injection).
 */

import { Page, expect } from '@playwright/test';

/**
 * Login via the UI login page.
 */
export async function uiLogin(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.getByPlaceholder('Correo electrónico').fill(email);
  await page.getByPlaceholder('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Iniciar con mi cuenta' }).click();
  await page.waitForURL(/\/(user|worker)\/dashboard/, { timeout: 15_000 });
}

/**
 * Logout via the user profile page.
 */
export async function uiLogout(page: Page): Promise<void> {
  await page.goto('/user/perfil', { waitUntil: 'networkidle' });
  // Handle confirm() dialog BEFORE clicking logout
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Salir', exact: true }).click();
  await page.waitForURL('**/login**', { timeout: 15_000 });
}

/**
 * Perform a recharge via UI, navigating to /user/pagos first.
 */
export async function uiRecharge(page: Page, amount: number): Promise<void> {
  await page.goto('/user/pagos', { waitUntil: 'networkidle' });
  await expect(page.getByText('Balance Disponible')).toBeVisible({
    timeout: 10_000,
  });
  await uiRechargeFromCurrentPage(page, amount);
}

/**
 * Perform a recharge from the current page (assumes already on /user/pagos).
 */
export async function uiRechargeFromCurrentPage(
  page: Page,
  amount: number
): Promise<void> {
  await page.getByRole('button', { name: 'Recargar Cuenta' }).click();
  await expect(page.getByText('Elige tu método de pago')).toBeVisible({
    timeout: 5_000,
  });

  await page.locator('input[type="number"]').fill(String(amount));
  await page.locator('button').filter({ hasText: 'Nequi' }).click();
  await page.getByRole('button', { name: 'Continuar con el pago' }).click();

  // QR modal
  const qrBtn = page.getByRole('button', { name: /Listo.*pago/ });
  await expect(qrBtn).toBeVisible({ timeout: 10_000 });
  await qrBtn.click();

  // Success modal
  const successBtn = page.getByRole('button', { name: 'Entendido' });
  await expect(successBtn).toBeVisible({ timeout: 10_000 });
  await successBtn.click();
}

/**
 * Assert that the page displays a specific balance amount.
 * Uses the same formatting as the app (es-CO COP currency).
 */
export async function assertBalance(
  page: Page,
  expectedAmount: number
): Promise<void> {
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(expectedAmount);

  await expect(page.getByText(formatted).first()).toBeVisible({
    timeout: 10_000,
  });
}

/**
 * Assert the page is responsive (not frozen).
 * If the JS event loop is blocked, page.evaluate will timeout.
 */
export async function assertPageResponsive(page: Page): Promise<void> {
  await page.evaluate(() => document.title);
  await expect(page.getByText('Balance Disponible')).toBeVisible({
    timeout: 5_000,
  });
}
