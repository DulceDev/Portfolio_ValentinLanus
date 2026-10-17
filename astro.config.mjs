import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // URL del sitio en Vercel: alimenta el sitemap, las canónicas y la URL de og:image.
  site: 'https://valentinlanus.vercel.app',
  trailingSlash: 'never',
  // CSS siempre externo: la CSP (style-src-elem 'self') bloquea los <style> inline.
  build: { format: 'file', inlineStylesheets: 'never' },
  // Dev en 4330: el 4321 queda libre para el build+preview de Playwright.
  server: { port: 4330 },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap({ i18n: { defaultLocale: 'es', locales: { es: 'es', en: 'en' } } })],
});
