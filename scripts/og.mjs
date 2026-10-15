import { chromium } from '@playwright/test';

const variants = {
  es: {
    role: 'Software Developer & AI Engineer',
    line: 'Productos web y mobile de punta a punta.',
  },
  en: { role: 'Software Developer & AI Engineer', line: 'Web and mobile products, end to end.' },
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [locale, v] of Object.entries(variants)) {
  await page.setContent(`
    <body style="margin:0;width:1200px;height:630px;background:#0b0d0c;color:#e8eae6;
      font-family:system-ui,sans-serif;display:flex;flex-direction:column;justify-content:flex-end;padding:72px;box-sizing:border-box">
      <div style="display:flex;align-items:center;gap:12px;color:#8fd694;font:500 24px ui-monospace,monospace">
        <span style="width:14px;height:14px;border-radius:50%;background:#8fd694"></span>${v.role}
      </div>
      <div style="font-size:112px;font-weight:600;letter-spacing:-4px;line-height:1;margin:24px 0">Valentín Lanús</div>
      <div style="font-size:32px;color:#9ba39d">${v.line}</div>
    </body>`);
  await page.screenshot({ path: `public/og-${locale}.png` });
}
await browser.close();
console.log('OG generadas en public/');
