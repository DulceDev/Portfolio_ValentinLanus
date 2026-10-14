import { test, expect } from '@playwright/test';

test('hero: h1 con el nombre y CTAs a contacto y proyectos', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Valentín Lanús' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Hablemos' })).toHaveAttribute('href', '#contact');
  await expect(page.getByRole('link', { name: 'Ver proyectos' })).toHaveAttribute(
    'href',
    '#projects',
  );
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('hero sin animación de entrada', async ({ page }) => {
    await page.goto('/');
    const duration = await page
      .locator('.line__inner')
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).animationDuration));
    expect(duration).toBeLessThanOrEqual(0.001);
  });
});

test.describe('sin JS', () => {
  test.use({ javaScriptEnabled: false });
  test('sobre mí legible completo, con espacios entre palabras', async ({ page }) => {
    await page.goto('/');
    const first = page.locator('[data-about-p]').first();
    await expect(first).toBeVisible();
    await expect(first).toHaveText(/^Soy desarrollador full-stack y trabajo con flujos/);
    await expect(page.locator('[data-about-p]')).toHaveCount(3);
  });
});
