import { test, expect } from '@playwright/test';

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
  await expect(page).toHaveURL(/localhost:4321\/?$/);
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('menú abre, atrapa foco y cierra con Esc', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Menú' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const menu = page.locator('[data-menu]');
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('link').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(toggle).toBeFocused();
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
