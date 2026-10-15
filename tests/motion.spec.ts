import { test, expect } from '@playwright/test';

const mobile = { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true };

test('desktop: motion activo y barra de progreso llega al final', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect
    .poll(() =>
      page
        .locator('[data-progress]')
        .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a),
    )
    .toBeGreaterThan(0.95);
});

test('desktop: ancla del nav lleva a la sección y le da foco', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  // Lenis se importa async: esperar a que esté activo para no medir el salto nativo.
  await expect(page.locator('html.lenis')).toHaveCount(1);
  await page
    .locator('.nav__links')
    .getByRole('link', { name: /Contacto/ })
    .click();
  await expect(page.locator('#contact')).toBeFocused({ timeout: 5000 });
  const top = await page.locator('#contact').evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(0);
  expect(top).toBeLessThan(200);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('no carga motion ni pinea nada', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
  });
});

test.describe('mobile', () => {
  test.use(mobile);
  test('motion en modo mobile, sin Lenis', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'mobile');
    await expect(page.locator('html.lenis')).toHaveCount(0);
  });
});
