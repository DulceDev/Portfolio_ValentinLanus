import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // PLACEHOLDER: URL definitiva del sitio (dominio o *.vercel.app real)
  site: 'https://valentinlanus.vercel.app',
  trailingSlash: 'never',
  build: { format: 'file' },
  // Dev en 4330: el 4321 queda libre para el build+preview de Playwright.
  server: { port: 4330 },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap({ i18n: { defaultLocale: 'es', locales: { es: 'es', en: 'en' } } })],
});
