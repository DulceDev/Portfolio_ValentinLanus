import { test, expect } from '@playwright/test';

test('/ sirve español y /en inglés', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

const SITE = 'https://valentinlanus.vercel.app';

test('SEO en inglés: title, canonical y hreflang', async ({ page }) => {
  await page.goto('/en');
  await expect(page).toHaveTitle('Valentín Lanús · Software Developer & AI Engineer');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/en`);
  await expect(page.locator('link[hreflang="es"]')).toHaveAttribute('href', `${SITE}/`);
  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', `${SITE}/en`);
  await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute('href', `${SITE}/`);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    `${SITE}/og-en.png`,
  );
});

test('SEO en español: descripción y og:locale', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /Desarrollador full-stack/,
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'es_AR');
  await expect(page.locator('main#main')).toHaveCount(1);
});

test('sitemap con ambas rutas, robots y OG', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  expect(sitemap).toContain('https://valentinlanus.vercel.app/en');
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain(
    'Sitemap: https://valentinlanus.vercel.app/sitemap-index.xml',
  );
  for (const og of ['/og-es.png', '/og-en.png', '/favicon.svg']) {
    expect((await request.get(og)).status()).toBe(200);
  }
});
