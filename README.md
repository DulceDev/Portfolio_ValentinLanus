# Portfolio de Valentín Lanús

Sitio estático y bilingüe (español en `/`, inglés en `/en`) hecho con Astro 7. Las animaciones usan GSAP y Lenis (solo en desktop), no hay framework de UI y todo el contenido se lee sin JavaScript. Se despliega en Vercel.

## Scripts

| Comando                      | Qué hace                                                                |
| ---------------------------- | ----------------------------------------------------------------------- |
| `npm run dev -- --port 4330` | Servidor de desarrollo en el puerto 4330.                               |
| `npm run build`              | Lista los placeholders pendientes y genera `dist/`.                     |
| `npm run preview`            | Sirve `dist/` en el puerto 4321 (hay que correr `build` antes).         |
| `npm run check`              | Chequeo de tipos con `astro check`.                                     |
| `npm test`                   | Tests de Playwright (incluye axe). Construye y levanta el preview solo. |
| `npm run todo`               | Lista los placeholders que faltan completar.                            |

## Completar los placeholders

1. Correr `npm run todo`: muestra archivo, línea y qué dato falta.
2. Links, repos, demos, capturas y contactos: `src/content/links.ts` (cada `TODO('...')` se reemplaza por el valor real; las capturas se guardan en `src/assets/projects/` y se importan).
3. URL del sitio: la propiedad `site` de `astro.config.mjs` (hoy es `https://valentinlanus.vercel.app`, provisoria). Alimenta el sitemap, `robots.txt`, las URLs canónicas y la URL absoluta de `og:image`.

## Imágenes OG

Se generan con Playwright y las tipografías del proyecto:

```bash
node scripts/og.mjs
```

Escribe `public/og-es.png` y `public/og-en.png`. El rol y la bajada están escritos en el propio script: hay que editarlos ahí y volver a correrlo si cambian.

## Lighthouse

No se instala `@lhci/cli`. Se corre ad hoc con la versión fijada, contra el build servido por `npm run preview`:

```bash
npm run build
npm run preview   # en otra terminal, puerto 4321

CHROME_PATH="<ruta a chrome.exe>" npx --yes lighthouse@13.5.0 <url> \
  --only-categories=performance,accessibility,seo,best-practices \
  --output=json --output-path=.lighthouseci/lh-<locale>-<n>.json \
  --chrome-flags="--headless=new" --quiet
```

- `<url>`: `http://localhost:4321/` y `http://localhost:4321/en`.
- Correr 3 veces por URL y tomar la mediana. El preset por defecto es mobile.
- `CHROME_PATH` puede ser el Chromium de Playwright (`%LOCALAPPDATA%\ms-playwright\chromium-*\chrome-win64\chrome.exe`) o cualquier Chrome o Edge instalado (en la máquina de desarrollo el `chrome.exe` de Playwright no arranca por un error de configuración en paralelo de Windows, así que las mediciones se hicieron con Edge: `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`).
- `.lighthouseci/` está ignorado por git.
- Umbrales: performance y accesibilidad de 0.90 o más en ambas URLs.

## Checklist antes del deploy

- [ ] Poner la URL real en `site` (`astro.config.mjs`).
- [ ] Completar `src/content/links.ts` y confirmar que `npm run todo` no lista nada.
- [ ] Correr `npm audit` completo (con dependencias de desarrollo) y revisar los hallazgos.
- [ ] Desplegar a un preview de Vercel y abrir la consola en `/` y `/en`, en desktop y en mobile con el menú abierto: no tiene que haber violaciones de CSP Report-Only.
- [ ] Verificar los headers con `curl -sI https://<preview>/` y `curl -sI https://<preview>/en` (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`).
- [ ] Si no hay violaciones, evaluar pasar la CSP de `Content-Security-Policy-Report-Only` a `Content-Security-Policy` en `vercel.json`.
