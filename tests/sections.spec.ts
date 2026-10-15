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

test('stack: 4 grupos con encabezado', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('[data-stack-group]')).toHaveCount(4);
  await expect(page.getByRole('heading', { level: 3, name: 'Tools' })).toBeVisible();
});

test('proyectos: filas Focusly y PhotoFinder en orden', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('[data-project-row] h3');
  await expect(rows).toHaveText(['Focusly', 'PhotoFinder']);
});

test('placeholders visibles y links pendientes no clickeables', async ({ page }) => {
  await page.goto('/');
  const row = page.locator('[data-project-row]').first();
  await expect(row.locator('[data-todo]').first()).toBeVisible();
  const pending = row.locator('.link--pending');
  await expect(pending).toHaveCount(2);
  await expect(pending.first()).toHaveAttribute('aria-disabled', 'true');
  await expect(row.locator('a.link--pending')).toHaveCount(0);
  await expect(row.getByText('Captura pendiente')).toBeVisible();
});

test('links pendientes fuera del orden de tabulación', async ({ page }) => {
  await page.goto('/');
  const pending = page.locator('[data-project-row] .link--pending');
  await expect(pending).toHaveCount(4);
  for (const el of await pending.all()) {
    expect(await el.evaluate((n) => (n as HTMLElement).tabIndex)).toBe(-1);
  }
  await expect(page.locator('[data-project-row] a')).toHaveCount(0);
});

test.describe('proyectos en mobile', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  test('sin scroll horizontal y placeholders dentro del viewport', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    for (const ph of await page.locator('[data-project-row] .ph').all()) {
      const box = await ph.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(375);
    }
  });
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
    await expect(first.locator('.w').first()).toHaveText('Soy');
    await expect(page.locator('[data-about] .about__body')).toBeVisible();
  });
});
