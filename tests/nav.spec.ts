import { test, expect, type Locator, type Page } from '@playwright/test';

test('skip link es lo primero enfocable y apunta a main', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Saltar al contenido' });
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute('href', '#main');
});

test('selector de idioma navega a la ruta equivalente', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /English/ }).click();
  await expect(page).toHaveURL(/\/en$/);
  await page.getByRole('link', { name: /Español/ }).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe('/');
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  const bodyOverflow = (page: Page) => page.evaluate(() => document.body.style.overflow);

  async function openMenu(page: Page) {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Menú' });
    await toggle.click();
    const menu = page.locator('[data-menu]');
    await expect(menu).toBeVisible();
    return { toggle, menu };
  }

  test('menú abre, atrapa foco y cierra con Esc', async ({ page }) => {
    const { toggle, menu } = await openMenu(page);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menu.getByRole('link').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    expect(await bodyOverflow(page)).toBe('');
  });

  test('el menú es un diálogo modal con nombre accesible', async ({ page }) => {
    const { menu } = await openMenu(page);
    await expect(menu).toHaveAttribute('role', 'dialog');
    await expect(menu).toHaveAttribute('aria-modal', 'true');
    await expect(menu).toHaveAttribute('aria-label', 'Menú');
  });

  test('Tab y Shift+Tab dan la vuelta dentro del menú', async ({ page }) => {
    const { menu } = await openMenu(page);
    const first = menu.getByRole('link').first();
    const close = menu.getByRole('button', { name: 'Cerrar' });
    await expect(first).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(close).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(first).toBeFocused();
  });

  test('mientras está abierto el resto de la página es inert y el scroll se bloquea', async ({
    page,
  }) => {
    const { toggle, menu } = await openMenu(page);
    const main = page.locator('main');
    await expect(main).toHaveAttribute('inert', '');
    await expect(page.locator('header.nav')).toHaveAttribute('inert', '');
    await expect(page.locator('.skip-link')).toHaveAttribute('inert', '');
    await expect(menu).not.toHaveAttribute('inert', '');
    expect(await bodyOverflow(page)).toBe('hidden');
    await page.keyboard.press('Escape');
    await expect(main).not.toHaveAttribute('inert', '');
    await expect(page.locator('header.nav')).not.toHaveAttribute('inert', '');
    await expect(page.locator('.skip-link')).not.toHaveAttribute('inert', '');
    await expect(toggle).toBeFocused();
  });

  test('si el foco cae fuera del menú (tap en el overlay), Tab vuelve adentro', async ({
    page,
  }) => {
    const { menu } = await openMenu(page);
    await page.mouse.click(187, 450);
    await expect(menu).toBeVisible();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      await expect(menu.locator(':focus')).toHaveCount(1);
    }
    await page.mouse.click(187, 450);
    await page.keyboard.press('Shift+Tab');
    await expect(menu.locator(':focus')).toHaveCount(1);
  });

  test('cada vía de cierre restaura inert, aria-expanded y overflow', async ({ page }) => {
    const main = page.locator('main');
    const closers: Array<[string, (menu: Locator) => Promise<void>]> = [
      ['botón Cerrar', (menu) => menu.getByRole('button', { name: 'Cerrar' }).click()],
      ['link del menú', (menu) => menu.getByRole('link', { name: /Proyectos/ }).click()],
      ['ensanchar a desktop', () => page.setViewportSize({ width: 900, height: 812 })],
    ];
    for (const [via, close] of closers) {
      const { menu } = await openMenu(page);
      const toggle = page.locator('[data-menu-toggle]');
      await expect(main, via).toHaveAttribute('inert', '');
      await close(menu);
      await expect(menu, via).toBeHidden();
      await expect(toggle, via).toHaveAttribute('aria-expanded', 'false');
      await expect(main, via).not.toHaveAttribute('inert', '');
      expect(await bodyOverflow(page), via).toBe('');
      await page.setViewportSize({ width: 375, height: 812 });
    }
  });
});

test.describe('sin JS', () => {
  test.use({ viewport: { width: 375, height: 812 }, javaScriptEnabled: false });

  test('los links del nav se ven sin botón de menú', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.locator('.nav__links').getByRole('link', { name: /Proyectos/ }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menú' })).toBeHidden();
  });
});
