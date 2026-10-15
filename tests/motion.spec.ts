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
  await page.locator('.nav__links').getByRole('link', { name: /Stack/ }).click();
  await expect(page.locator('#stack')).toBeFocused({ timeout: 5000 });
  // La sección termina justo debajo del nav fijo (64px = scroll-margin-top), no al doble.
  // Lenis se acerca desde abajo con lerp: esperar a que llegue y medir el reposo.
  const top = () => page.locator('#stack').evaluate((el) => el.getBoundingClientRect().top);
  await expect.poll(top, { timeout: 5000 }).toBeLessThanOrEqual(68);
  expect(await top()).toBeGreaterThanOrEqual(60);
});

/** Junta las URLs de chunks JS pedidos, para afirmar qué NO se descargó. */
function trackScripts(page: import('@playwright/test').Page) {
  const urls: string[] = [];
  page.on('request', (req) => {
    if (req.resourceType() === 'script') urls.push(req.url());
  });
  return urls;
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('no descarga gsap ni lenis y no pinea nada', async ({ page }) => {
    const scripts = trackScripts(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(500);
    expect(scripts.filter((u) => /\/(gsap|ScrollTrigger|lenis)\.[^/]*\.js/.test(u))).toEqual([]);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
  });
});

test.describe('mobile', () => {
  test.use(mobile);
  test('motion en modo mobile, sin descargar Lenis', async ({ page }) => {
    const scripts = trackScripts(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'mobile');
    await page.waitForTimeout(500);
    expect(scripts.some((u) => /\/gsap\.[^/]*\.js/.test(u))).toBe(true);
    expect(scripts.filter((u) => /\/lenis\.[^/]*\.js/.test(u))).toEqual([]);
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
  await expect.poll(() => media.evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
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
  // Las decisiones están debajo del pin: su entrada no puede haberse disparado todavía.
  await expect(page.locator('[data-decisions] li').first()).toHaveCSS('opacity', '0');
  await page.locator('[data-decisions]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-decisions] li').last()).toHaveCSS('opacity', '1');
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
    await expect(page.locator('[data-signal-label]')).toHaveText('Synced');
    await expect(page.locator('[data-signal]')).toHaveAttribute('data-level', '4');
    await expect(page.locator('[data-step][data-active]')).toHaveCount(0);
    for (const step of await page.locator('[data-step]').all()) {
      await step.scrollIntoViewIfNeeded();
      await expect(step).toHaveCSS('opacity', '1');
    }
  });
});

test.describe('resize dentro de desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test('si el bloque deja de entrar se despinea, y vuelve a pinear al agrandar', async ({
    page,
  }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
    await page.locator('#lotecito').scrollIntoViewIfNeeded();
    await expect(page.locator('.pin-spacer')).toHaveCount(1);
    await page.setViewportSize({ width: 960, height: 768 });
    await expect(page.locator('.pin-spacer')).toHaveCount(0, { timeout: 5000 });
    await expect(page.locator('.lotecito.is-pinned')).toHaveCount(0);
    await expect(page.locator('[data-signal-label]')).toHaveText('Synced');
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('.pin-spacer')).toHaveCount(1, { timeout: 5000 });
    await expect(page.locator('.lotecito.is-pinned')).toHaveCount(1);
    await expect(page.locator('[data-step][data-active]')).toHaveCount(1);
    for (const step of await page.locator('[data-step]').all()) {
      await expect(step).toHaveCSS('opacity', '1');
    }
  });

  test('en el límite (bloque 1.25px más alto que el viewport) no oscila entre modos', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.textContent =
          '.lotecito.is-pinned [data-lotecito-pin]{min-height:calc(100vh + 1.25px)!important}';
        document.head.append(style);
      });
    });
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
    await page.locator('#lotecito').scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(400);
    const before = await page.evaluate(() => window.scrollY);
    await page.setViewportSize({ width: 1280, height: 801 });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1000);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await expect(page.locator('.lotecito.is-pinned')).toHaveCount(0);
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThan(50);
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
  await expect(page.locator('[data-signal]')).toHaveAttribute('data-level', '4');
  await expect(page.locator('[data-step][data-active]')).toHaveCount(0);
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
