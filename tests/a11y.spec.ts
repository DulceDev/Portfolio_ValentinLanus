import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const paths = ['/', '/en'];

// El reveal del hero es una animación CSS con opacity 0 → 1. Si axe corre a mitad de camino,
// mide el contraste con el color mezclado y da un falso positivo. Se espera a que terminen.
async function settle(page: Page) {
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((a) => a.finished.catch(() => null))),
  );
}

async function violations(page: Page) {
  await settle(page);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  return results.violations.map((v) => `${v.id}: ${v.nodes.length}`);
}

for (const path of paths) {
  test(`axe sin violaciones en ${path}`, async ({ page }) => {
    await page.goto(path);
    expect(await violations(page)).toEqual([]);
  });
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const path of paths) {
    test(`axe sin violaciones en ${path} con reduced motion`, async ({ page }) => {
      await page.goto(path);
      expect(await violations(page)).toEqual([]);
    });
  }
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  for (const path of paths) {
    test(`axe sin violaciones en ${path} en mobile 375x812`, async ({ page }) => {
      await page.goto(path);
      expect(await violations(page)).toEqual([]);
    });
  }

  // El menú abierto es un diálogo modal que pone inert al resto: se audita en ese estado.
  for (const path of paths) {
    test(`axe sin violaciones en ${path} con el menú mobile abierto`, async ({ page }) => {
      await page.goto(path);
      await page.locator('[data-menu-toggle]').click();
      await expect(page.locator('[data-menu]')).toBeVisible();
      expect(await violations(page)).toEqual([]);
    });
  }
});
