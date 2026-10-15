import { test, expect, type Locator } from '@playwright/test';

// El estado de cada dato (pendiente o real) se lee del DOM renderizado, nunca de src/content:
// links.ts puede importar capturas .png, y Playwright no sabe cargar ese módulo.
// Así los tests valen para cualquier mezcla de placeholders y contenido real.
const PENDING_IMAGE_TEXT = { '/': 'Captura pendiente', '/en': 'Screenshot coming soon' };
// Bloques de proyecto: Lotecito (pineado aparte) y las filas que le siguen.
const PROJECT_BLOCKS = '[data-lotecito], [data-project-row]';
const PROJECT_LINKS = '.row__links, .lotecito__links';

interface LinkState {
  tag: string;
  pending: boolean;
  href: string | null;
  ariaDisabled: string | null;
  tabIndex: number;
  focusable: boolean;
}

// Estado real de cada elemento: tag, atributos, tabIndex y si acepta foco.
const readLinks = (links: Locator): Promise<LinkState[]> =>
  links.evaluateAll((els) =>
    els.map((el) => {
      const node = el as HTMLElement;
      node.focus({ preventScroll: true });
      const focusable = document.activeElement === node;
      node.blur();
      return {
        tag: node.tagName.toLowerCase(),
        pending: node.classList.contains('link--pending'),
        href: node.getAttribute('href'),
        ariaDisabled: node.getAttribute('aria-disabled'),
        tabIndex: node.tabIndex,
        focusable,
      };
    }),
  );

// Un link es real (a[href], tabulable) o pendiente (span aria-disabled, sin href, fuera del tab order).
function expectLinkState(state: LinkState, where: string) {
  if (state.pending) {
    expect(state, `${where}: pendiente`).toMatchObject({
      tag: 'span',
      ariaDisabled: 'true',
      href: null,
      tabIndex: -1,
      focusable: false,
    });
  } else {
    expect(state, `${where}: real`).toMatchObject({
      tag: 'a',
      ariaDisabled: null,
      tabIndex: 0,
      focusable: true,
    });
    expect(state.href, `${where}: href vacío`).toBeTruthy();
  }
}

// Los 2 links (repo y demo) de un bloque de proyecto.
const projectLinks = (block: Locator) => block.locator(PROJECT_LINKS).locator(':scope > *');

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

for (const [path, pendingText] of Object.entries(PENDING_IMAGE_TEXT)) {
  test(`proyectos ${path}: cada captura es un placeholder visible o una imagen con alt`, async ({
    page,
  }) => {
    await page.goto(path);
    const blocks = page.locator(PROJECT_BLOCKS);
    await expect(blocks).toHaveCount(3);
    for (const block of await blocks.all()) {
      const media = block.locator('.media');
      await expect(media).toHaveCount(1);
      const placeholder = media.locator('[data-todo][role="img"]');
      const image = media.locator('picture img');
      if ((await placeholder.count()) > 0) {
        await expect(placeholder).toHaveCount(1);
        await expect(media.locator('.ph')).toHaveCount(1);
        await expect(image).toHaveCount(0);
        await expect(placeholder).toBeVisible();
        await expect(placeholder.getByText(pendingText)).toBeVisible();
      } else {
        await expect(media.locator('.ph')).toHaveCount(0);
        await expect(image).toHaveCount(1);
        await expect(image).toHaveAttribute('alt', /\S/);
        await expect(image).toBeVisible();
      }
    }
  });
}

test('proyectos: cada bloque tiene 2 links, reales o pendientes', async ({ page }) => {
  await page.goto('/');
  const blocks = page.locator(PROJECT_BLOCKS);
  await expect(blocks).toHaveCount(3);
  for (const [i, block] of (await blocks.all()).entries()) {
    await expect(block.locator(PROJECT_LINKS)).toHaveCount(1);
    const entries = projectLinks(block);
    await expect(entries).toHaveCount(2);
    for (const [j, state] of (await readLinks(entries)).entries()) {
      expectLinkState(state, `bloque ${i + 1}, link ${j + 1}`);
    }
  }
});

test('links pendientes de proyectos: no clickeables', async ({ page }) => {
  await page.goto('/');
  const pending = page.locator(PROJECT_LINKS).locator('.link--pending');
  test.skip((await pending.count()) === 0, 'Ningún link de proyecto está pendiente');
  for (const el of await pending.all()) {
    await expect(el).toHaveAttribute('aria-disabled', 'true');
    await expect(el).not.toHaveAttribute('href', /.*/);
  }
  // Un pendiente nunca es un <a>: no hay nada que clickear.
  await expect(page.locator('a.link--pending')).toHaveCount(0);
});

test('links pendientes fuera del orden de tabulación', async ({ page }) => {
  await page.goto('/');
  const pending = page.locator(PROJECT_LINKS).locator('.link--pending');
  test.skip((await pending.count()) === 0, 'Ningún link de proyecto está pendiente');
  for (const state of await readLinks(pending)) {
    expect(state.tabIndex).toBe(-1);
    expect(state.focusable).toBe(false);
  }
});

test('links reales de proyectos: tabulables', async ({ page }) => {
  await page.goto('/');
  const real = page.locator(PROJECT_LINKS).locator('a[href]');
  test.skip((await real.count()) === 0, 'Ningún link de proyecto está completo todavía');
  for (const state of await readLinks(real)) {
    expect(state.tabIndex).toBe(0);
    expect(state.focusable).toBe(true);
  }
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

test('contacto: 4 canales, cada uno real o pendiente', async ({ page }) => {
  await page.goto('/');
  const items = page.locator('[data-contact-link]');
  await expect(items).toHaveCount(4);
  const pendingCount = await page.locator('[data-contact] .link--pending').count();
  let pendingItems = 0;
  for (const [i, item] of (await items.all()).entries()) {
    const entry = item.locator(':scope > *');
    await expect(entry).toHaveCount(1);
    const [state] = await readLinks(entry);
    expectLinkState(state, `canal ${i + 1}`);
    if (state.pending) pendingItems++;
  }
  expect(pendingItems).toBe(pendingCount);
  await expect(page.locator('[data-contact] [aria-disabled="true"]')).toHaveCount(pendingCount);
  await expect(page.locator('[data-contact] a.link--pending')).toHaveCount(0);
  await expect(page.locator('[data-contact] a.contact__link[href]')).toHaveCount(4 - pendingCount);
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

// Mientras haya canales pendientes el motion del link real (flecha, subrayado, imán) no se ejerce.
// Se simula: antes del init idle de motion se reemplaza el primer canal pendiente por el <a> que
// renderiza SmartLink, conservando label y flecha. Si no queda ninguno pendiente, el init script no
// hace nada y se prueba el primer link real.
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
