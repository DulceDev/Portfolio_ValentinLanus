import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = fileURLToPath(new URL('../public/', import.meta.url));

// Tipografías embebidas en base64: la imagen no depende de las fuentes del sistema.
const fontFace = (family, pkg, file) => {
  const path = fileURLToPath(
    new URL(`../node_modules/@fontsource-variable/${pkg}/files/${file}`, import.meta.url),
  );
  const data = readFileSync(path).toString('base64');
  return `@font-face{font-family:'${family}';font-weight:100 900;font-style:normal;src:url(data:font/woff2;base64,${data}) format('woff2')}`;
};
const fonts = [
  fontFace('GeistOG', 'geist', 'geist-latin-wght-normal.woff2'),
  fontFace('GeistMonoOG', 'geist-mono', 'geist-mono-latin-wght-normal.woff2'),
].join('\n');

const variants = {
  es: {
    role: 'Software Developer & AI Engineer',
    line: 'Productos web y mobile de punta a punta.',
  },
  en: { role: 'Software Developer & AI Engineer', line: 'Web and mobile products, end to end.' },
};

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const [locale, v] of Object.entries(variants)) {
    await page.setContent(`
      <style>${fonts}</style>
      <body style="margin:0;width:1200px;height:630px;background:#0b0d0c;color:#e8eae6;
        font-family:'GeistOG',system-ui,sans-serif;display:flex;flex-direction:column;justify-content:flex-end;padding:72px;box-sizing:border-box">
        <div style="display:flex;align-items:center;gap:12px;color:#8fd694;font:500 24px 'GeistMonoOG',ui-monospace,monospace">
          <span style="width:14px;height:14px;border-radius:50%;background:#8fd694"></span>${v.role}
        </div>
        <div style="font-size:112px;font-weight:600;letter-spacing:-4px;line-height:1;margin:24px 0">Valentín Lanús</div>
        <div style="font-size:32px;color:#9ba39d">${v.line}</div>
      </body>`);
    // Con las fuentes sin cargar el screenshot saldría con la tipografía de reemplazo.
    const loaded = await page.evaluate(async () => {
      await Promise.all([
        document.fonts.load("600 112px 'GeistOG'", 'Valentín Lanús'),
        document.fonts.load("400 32px 'GeistOG'", 'Productos'),
        document.fonts.load("500 24px 'GeistMonoOG'", 'Software'),
      ]);
      await document.fonts.ready;
      return [...document.fonts].every((f) => f.status === 'loaded');
    });
    if (!loaded) throw new Error('Las fuentes embebidas no terminaron de cargar');
    await page.screenshot({ path: join(outDir, `og-${locale}.png`) });
  }
} finally {
  await browser.close();
}
console.log('OG generadas en public/');
