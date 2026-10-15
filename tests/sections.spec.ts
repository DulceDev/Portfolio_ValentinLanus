import { test, expect } from '@playwright/test';
import { links } from '../src/content/links';
import { isTodo } from '../src/content/placeholders';

// Los conteos esperados salen del contenido: al completar un link o una captura, los tests se adaptan.
const pendingIn = (...values: unknown[]) => values.filter(isTodo).length;
// Filas de proyecto bajo Lotecito (que va pineado aparte), en el orden en que se renderizan.
const projectRows = [links.focusly, links.photofinder];
const firstRow = projectRows[0];
const firstRowPendingLinks = pendingIn(firstRow.repo, firstRow.demo);
const rowsPendingLinks = projectRows.reduce((n, row) => n + pendingIn(row.repo, row.demo), 0);
const contactCount = Object.keys(links.contact).length;
const contactPending = pendingIn(...Object.values(links.contact));

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

test('primera fila: captura y links reflejan el contenido (pendiente o real)', async ({ page }) => {
  await page.goto('/');
  const row = page.locator('[data-project-row]').first();
  await expect(row.locator('.link--pending')).toHaveCount(firstRowPendingLinks);
  await expect(row.locator('a[href]')).toHaveCount(2 - firstRowPendingLinks);
  if (isTodo(firstRow.image)) {
    await expect(row.locator('[data-todo]').first()).toBeVisible();
    await expect(row.getByText('Captura pendiente')).toBeVisible();
    await expect(row.locator('.ph')).toHaveCount(1);
  } else {
    await expect(row.locator('.ph')).toHaveCount(0);
    await expect(row.locator('picture img')).toHaveCount(1);
  }
});

test('links pendientes de proyectos: no clickeables', async ({ page }) => {
  test.skip(firstRowPendingLinks === 0, 'El primer proyecto ya no tiene links pendientes');
  await page.goto('/');
  const row = page.locator('[data-project-row]').first();
  const pending = row.locator('.link--pending');
  await expect(pending).toHaveCount(firstRowPendingLinks);
  await expect(pending.first()).toHaveAttribute('aria-disabled', 'true');
  await expect(row.locator('a.link--pending')).toHaveCount(0);
});

test('links pendientes fuera del orden de tabulación', async ({ page }) => {
  test.skip(rowsPendingLinks === 0, 'Los proyectos ya no tienen links pendientes');
  await page.goto('/');
  const pending = page.locator('[data-project-row] .link--pending');
  await expect(pending).toHaveCount(rowsPendingLinks);
  for (const el of await pending.all()) {
    expect(await el.evaluate((n) => (n as HTMLElement).tabIndex)).toBe(-1);
  }
  // Los links ya completados sí son anchors y se pueden tabular.
  await expect(page.locator('[data-project-row] a')).toHaveCount(
    projectRows.length * 2 - rowsPendingLinks,
  );
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

  test('lotecito: narrativa completa legible sin JS', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-step]')).toHaveCount(4);
    for (const step of await page.locator('[data-step]').all()) await expect(step).toBeVisible();
    await expect(page.locator('[data-signal]')).toHaveAttribute('data-level', '4');
    await expect(page.locator('[data-signal-label]')).toHaveText('Sincronizado');
    // La etiqueta no puede quedar sobre un fondo del mismo color y las barras encendidas sí van en acento.
    await expect(page.locator('[data-signal-label]')).toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    );
    await expect(page.locator('.signal__bars span').first()).toHaveCSS(
      'background-color',
      'rgb(143, 214, 148)',
    );
    await expect(page.locator('[data-decisions] li')).toHaveCount(6);
    await expect(page.getByText('24 migraciones de base de datos')).toBeVisible();
  });
});

test('contacto: 4 canales, pendientes marcados', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-contact-link]')).toHaveCount(contactCount);
  await expect(page.locator('[data-contact] [aria-disabled="true"]')).toHaveCount(contactPending);
  await expect(page.locator('[data-contact] a[href]')).toHaveCount(contactCount - contactPending);
});

for (const path of ['/', '/en']) {
  test.describe(`320px ${path}`, () => {
    test.use({ viewport: { width: 320, height: 640 } });
    test(`sin scroll horizontal en ${path}`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      const offenders = await page.evaluate(() =>
        [...document.querySelectorAll('main *, footer *')]
          .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
          .map((el) => `${el.tagName.toLowerCase()}.${el.className}`),
      );
      expect(offenders).toEqual([]);
    });
  });
}

test.describe('mobile tap targets', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  test('cada canal de contacto mide al menos 56px de alto', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-contact-link]')).toHaveCount(4);
    for (const item of await page.locator('[data-contact-link]').all()) {
      const box = await item.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(56);
    }
  });
});

// Con el contenido actual todos los canales están pendientes, así que el motion del link real
// (flecha, subrayado, imán) no se ejerce. Se simula: antes del init idle de motion se reemplaza
// el primer canal pendiente por el <a> que renderiza SmartLink, conservando label y flecha.
// Si el canal ya es un link real, el init script no hace nada y se prueba ese.
test('contacto con link real: flecha visible, subrayado en hover e imán acotado (desktop)', async ({
  page,
}) => {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const pending = document.querySelector('[data-contact] .link--pending');
      if (!pending) return;
      const a = document.createElement('a');
      a.className = 'contact__link';
      a.href = 'https://example.com/x';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.append(...pending.querySelectorAll(':scope > .contact__label, :scope > .contact__arrow'));
      pending.replaceWith(a);
    });
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');

  const link = page.locator('[data-contact] a.contact__link').first();
  const label = link.locator('.contact__label');
  await link.scrollIntoViewIfNeeded();
  // Esperar a la entrada del canal (opacity/y) para medir el reposo.
  await expect(link.locator('xpath=..')).toHaveCSS('opacity', '1');
  await expect(link.locator('.contact__arrow')).toBeVisible();

  const underline = () =>
    link.evaluate((el) => new DOMMatrix(getComputedStyle(el, '::after').transform).a);
  const labelX = () => label.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).e);

  expect(await underline()).toBe(0);
  const box = (await link.boundingBox())!;
  const midY = box.y + box.height / 2;
  await page.mouse.move(box.x + 40, midY);
  await expect.poll(underline).toBeGreaterThan(0.95);

  // Puntero en el extremo derecho de la fila: sin tope el label se iría ~150px.
  await page.mouse.move(box.x + box.width - 8, midY, { steps: 6 });
  await expect.poll(labelX).toBeGreaterThan(6);
  await page.waitForTimeout(600);
  expect(Math.abs(await labelX())).toBeLessThanOrEqual(12.01);
});
