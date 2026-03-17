import { test, expect, Page } from '@playwright/test';
import {
  loginAs,
  openDuplicatedTab,
} from '../helpers/auth';

async function expectPageBodyToContain(
  page: Page,
  visibleText: string | RegExp
) {
  await expect
    .poll(async () => page.locator('body').innerText(), {
      timeout: 20_000,
      intervals: [500, 1_000, 2_000],
    })
    .toMatch(visibleText instanceof RegExp ? visibleText : new RegExp(visibleText));
}

async function expectVerificationSpinnerToFinish(page: Page) {
  await expect(
    page.getByText('Verificando acceso...')
  ).toBeHidden({ timeout: 30_000 });
}

async function assertAuthenticatedPage(
  page: Page,
  path: string,
  visibleText: string | RegExp
) {
  await page.goto(path, { waitUntil: 'networkidle' });
  await expect(page).not.toHaveURL(/\/login$/);
  await expectVerificationSpinnerToFinish(page);
  await expectPageBodyToContain(page, visibleText);
}

test.describe('Persistencia de sesión por pestaña', () => {
  test('client mantiene sesión en refresh, bloquea pestaña nueva y permite pestaña duplicada simulada', async ({
    page,
  }) => {
    await loginAs(page, 'client');

    await assertAuthenticatedPage(page, '/user/dashboard', 'Mis Servicios');

    const freshTab = await page.context().newPage();
    await freshTab.goto('/user/dashboard', { waitUntil: 'networkidle' });
    await freshTab.waitForURL(/\/login$/, { timeout: 15_000 });
    await expect(freshTab.locator('body')).toContainText('Iniciar con mi cuenta');
    await freshTab.close();

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/user\/dashboard/);
    await expectVerificationSpinnerToFinish(page);
    await expectPageBodyToContain(page, 'Mis Servicios');

    await page.goto('/user/pagos', { waitUntil: 'networkidle' });
    await expectPageBodyToContain(page, 'Historial de Transacciones');
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/user\/pagos/);
    await expectVerificationSpinnerToFinish(page);
    await expectPageBodyToContain(page, 'Historial de Transacciones');

    await page.goto('/user/chats', { waitUntil: 'networkidle' });
    await expectPageBodyToContain(page, /No tienes conversaciones activas|Selecciona una conversación/);
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/user\/chats/);
    await expectVerificationSpinnerToFinish(page);
    await expectPageBodyToContain(page, /No tienes conversaciones activas|Selecciona una conversación/);

    const duplicatedTab = await openDuplicatedTab(page);
    await duplicatedTab.goto('/user/dashboard', { waitUntil: 'networkidle' });
    await duplicatedTab.waitForURL(/\/login$/, { timeout: 5_000 });
    await expect(duplicatedTab.locator('body')).toContainText('Iniciar con mi cuenta');
    await duplicatedTab.close();

    // Verify original tab is still authenticated after duplicate was rejected
    await assertAuthenticatedPage(page, '/user/dashboard', 'Mis Servicios');
  });

  test('worker mantiene sesión al refrescar dashboard y pagos', async ({
    page,
  }) => {
    await loginAs(page, 'worker');

    await assertAuthenticatedPage(page, '/worker/dashboard', 'Mis Aplicaciones');

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/worker\/dashboard/);
    await expectVerificationSpinnerToFinish(page);
    await expectPageBodyToContain(page, 'Mis Aplicaciones');

    await page.goto('/worker/pagos', { waitUntil: 'networkidle' });
    await expectPageBodyToContain(page, 'Historial de Transacciones');
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/worker\/pagos/);
    await expectVerificationSpinnerToFinish(page);
    await expectPageBodyToContain(page, 'Historial de Transacciones');
  });

  test('admin sin sesión válida es redirigido a login', async ({ browser }) => {
    const isolatedContext = await browser.newContext();
    const isolatedPage = await isolatedContext.newPage();

    await isolatedPage.goto('/admin/dashboard', { waitUntil: 'networkidle' });
    await isolatedPage.waitForURL(/\/admin$/, { timeout: 15_000 });
    await expect(isolatedPage.locator('body')).toContainText('Iniciar Sesión');

    await isolatedContext.close();
  });
});
