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

test('desktop: sobre mí arranca atenuado y termina en color texto', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  const lastWord = page.locator('[data-about] .w').last();
  await expect
    .poll(() => lastWord.evaluate((el) => getComputedStyle(el).color))
    .toBe('rgb(122, 131, 125)');
  await page.locator('#stack').scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator('[data-about] .w')
        .last()
        .evaluate((el) => getComputedStyle(el).color),
    )
    .toBe('rgb(232, 234, 230)');
});

test('desktop: parallax aplicado a la captura de Focusly', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  const media = page.locator('[data-project-row] [data-parallax]').first();
  const translateY = () => media.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).f);
  await media.scrollIntoViewIfNeeded();
  await expect.poll(translateY).not.toBe(0);
  const before = await translateY();
  await page.mouse.wheel(0, 400);
  await expect.poll(translateY).toBeLessThan(before);
  expect(Math.abs(await translateY())).toBeLessThanOrEqual(20);
});

test.describe('mobile sin parallax', () => {
  test.use(mobile);
  test('captura sin transform', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'mobile');
    const media = page.locator('[data-project-row] [data-parallax]').first();
    await media.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    expect(await media.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
  });
});

async function scrollIntoPin(page: import('@playwright/test').Page, fraction: number) {
  await page.evaluate((f) => {
    const spacer = document.querySelector('[data-lotecito-pin]')!.parentElement!; // .pin-spacer
    const top = spacer.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + window.innerHeight * 1.5 * f);
  }, fraction);
}

test('desktop: el pin avanza la narrativa de Lotecito', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await page.locator('#lotecito').scrollIntoViewIfNeeded();
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  await scrollIntoPin(page, 0.05);
  await expect(page.locator('[data-signal-label]')).toHaveText('Sin señal');
  await expect(page.locator('[data-signal]')).toHaveAttribute('data-level', '1');
  await scrollIntoPin(page, 0.6);
  await expect(page.locator('[data-signal-label]')).toHaveText('Sincronizando');
  await expect(page.locator('[data-step][data-active]')).toHaveCount(1);
});

test.describe('desktop 1280x800 en inglés', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test('el bloque pineado entra en el viewport', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
    await page.locator('#lotecito').scrollIntoViewIfNeeded();
    await expect(page.locator('.lotecito.is-pinned')).toHaveCount(1);
    const h = await page.locator('[data-lotecito-pin]').evaluate((el) => el.scrollHeight);
    expect(h).toBeLessThanOrEqual(800);
  });
});

test.describe('desktop angosto donde el bloque no entra', () => {
  test.use({ viewport: { width: 960, height: 768 } });
  test('no pinea y deja los 4 pasos legibles', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
    await page.locator('#lotecito').scrollIntoViewIfNeeded();
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await expect(page.locator('.lotecito.is-pinned')).toHaveCount(0);
    for (const step of await page.locator('[data-step]').all()) {
      await step.scrollIntoViewIfNeeded();
      await expect(step).toBeVisible();
    }
  });
});

test('pasar de desktop a mobile revierte el pin', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await page.locator('#lotecito').scrollIntoViewIfNeeded();
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'mobile');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('.lotecito.is-pinned')).toHaveCount(0);
  await expect(page.locator('[data-signal-label]')).toHaveText('Sincronizado');
});

test.describe('mobile Lotecito', () => {
  test.use(mobile);
  test('sin pin y con los 4 pasos visibles', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'mobile');
    await page.locator('#lotecito').scrollIntoViewIfNeeded();
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    for (const step of await page.locator('[data-step]').all()) {
      await step.scrollIntoViewIfNeeded();
      await expect(step).toBeVisible();
    }
  });
});
