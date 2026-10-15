# Portfolio de Valentín Lanús

Sitio estático y bilingüe (español en `/`, inglés en `/en`) hecho con Astro 7. Las animaciones usan GSAP y Lenis (solo en desktop), no hay framework de UI y todo el contenido se lee sin JavaScript. Se despliega en Vercel.

## Requisitos e instalación

- Node 22.12 o superior (el `.nvmrc` fija la 22).
- `npm install`
- `npx playwright install chromium` (los tests de Playwright y `scripts/og.mjs` usan Chromium).

## Scripts

| Comando           | Qué hace                                                                |
| ----------------- | ----------------------------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo en el puerto 4330 (definido en `astro.config`).  |
| `npm run build`   | Lista los placeholders pendientes y genera `dist/`.                     |
| `npm run preview` | Sirve `dist/` en el puerto 4321 (hay que correr `build` antes).         |
| `npm run check`   | Chequeo de tipos con `astro check`.                                     |
| `npm test`        | Tests de Playwright (incluye axe). Construye y levanta el preview solo. |
| `npm run todo`    | Lista los placeholders que faltan completar.                            |

El dev server corre en 4330 a propósito: `npm test` hace `build` y `preview` en el 4321, y Playwright REUSA cualquier servidor que ya esté escuchando en ese puerto (fuera de CI). Si hay un preview viejo en el 4321, los tests se corren contra un build desactualizado sin avisar. Para testear, dejá el 4321 libre.

## Completar los placeholders

1. Correr `npm run todo`: muestra archivo, línea y qué dato falta.
2. Links, repos, demos, capturas y contactos: `src/content/links.ts` (cada `TODO('...')` se reemplaza por el valor real). Las capturas se guardan en `src/assets/projects/` (la carpeta todavía no existe: crearla) y se importan desde ese archivo.
3. URL del sitio: la propiedad `site` de `astro.config.mjs` (hoy es `https://valentinlanus.vercel.app`, provisoria). Alimenta el sitemap, `robots.txt`, las URLs canónicas y la URL absoluta de `og:image`. Los tests la leen de ahí, no hay que tocarlos al cambiarla.

Los tests de Playwright derivan los conteos de placeholders de `src/content/links.ts`: al completar un dato se adaptan solos (los chequeos que solo aplican a un link pendiente se saltean).

## Imágenes OG

Se generan con Playwright y las tipografías del proyecto:

```bash
node scripts/og.mjs
```

Escribe `public/og-es.png` y `public/og-en.png`. El rol y la bajada están escritos en el propio script: hay que editarlos ahí y volver a correrlo si cambian.

## Lighthouse

No se instala `@lhci/cli`. Se corre ad hoc con la versión fijada, contra el build servido por `npm run preview`. Por defecto usa el preset mobile.

PowerShell (el entorno de desarrollo):

```powershell
npm run build
npm run preview   # en otra terminal, puerto 4321

New-Item -ItemType Directory -Force .lighthouseci | Out-Null
$env:CHROME_PATH = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
npx --yes lighthouse@13.5.0 http://localhost:4321/ --only-categories=performance,accessibility,seo,best-practices --output=html --output-path=.lighthouseci/es.html --chrome-flags="--headless=new"
```

Bash:

```bash
npm run build
npm run preview   # en otra terminal, puerto 4321

mkdir -p .lighthouseci
CHROME_PATH="<ruta a chrome o msedge>" npx --yes lighthouse@13.5.0 http://localhost:4321/ --only-categories=performance,accessibility,seo,best-practices --output=html --output-path=.lighthouseci/es.html --chrome-flags="--headless=new"
```

- Repetir con `http://localhost:4321/en` (cambiar el nombre del archivo de salida, p. ej. `en.html`). Correr 3 veces por URL y tomar la mediana.
- En Windows el `chrome.exe` de Playwright puede no arrancar (error de configuración en paralelo, "side-by-side"), por eso se usa el Edge o el Chrome instalados en `CHROME_PATH`.
- `.lighthouseci/` está ignorado por git.
- Umbrales: performance y accesibilidad de 0.90 o más en ambas URLs.
- Repetir contra la URL desplegada antes de dar el sitio por cerrado.

## Verificar los headers

`vercel.json` define los headers de seguridad. Con el sitio desplegado, en PowerShell usar `curl.exe` (el `curl` a secas es un alias de `Invoke-WebRequest`):

```powershell
curl.exe -sI https://<url>/
curl.exe -sI https://<url>/en
curl.exe -sI https://<url>/_astro/<archivo>.css
```

Tienen que aparecer, en `/` y `/en`:

- `Strict-Transport-Security` (lo agrega Vercel, no está en `vercel.json`)
- `Content-Security-Policy-Report-Only`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `X-Frame-Options`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`

Y en un asset de `/_astro/*`: `Cache-Control: public, max-age=31536000, immutable`.

Los deploys de preview de Vercel pueden tener Deployment Protection activa: `curl` recibe un 401. Verificar sobre la URL de producción, o desactivar la protección del preview para esa prueba.

## Pasar la CSP a modo enforcing

La CSP viaja hoy como `Content-Security-Policy-Report-Only`. Para activarla:

1. En `vercel.json`, renombrar la clave del header a `Content-Security-Policy`.
2. Actualizar `tests/csp.spec.ts`: hoy afirma que existe el header Report-Only y que no hay ninguno enforcing.

La directiva `script-src` lleva los hashes `sha256` de los dos scripts inline (la clase `js` de `Base.astro` y el script del menú de `Nav.astro`). Cualquier cambio en esos scripts cambia el hash: el test de CSP falla y muestra los hashes nuevos para copiar a `vercel.json`.

## Checklist antes del deploy

- [ ] Crear primero el proyecto en Vercel y usar SU URL real en `site` (`astro.config.mjs`): el nombre `*.vercel.app` que se quiere puede estar tomado. Después redesplegar.
- [ ] Completar `src/content/links.ts` y confirmar que `npm run todo` no lista nada.
- [ ] Con links y capturas completos: `npm run build && npm test`.
- [ ] Revisión visual con el contenido real: los links externos abren en pestaña nueva, `mailto:` y `wa.me` funcionan, el subrayado y el imán del contacto andan, y las imágenes (`Picture`) cargan bien.
- [ ] Verificación manual del render de `SmartLink` (`target` y `rel` en links externos): no hay test automático, requeriría vitest y la Container API de Astro.
- [ ] Pruebas manuales en un Android con Chrome real, en iOS Safari y con NVDA (sobre todo la sección Lotecito).
- [ ] Correr Lighthouse contra la URL desplegada (ver la sección anterior).
- [ ] Correr `npm audit` completo (con dependencias de desarrollo) el día del deploy y revisar los hallazgos.
- [ ] Desplegar a un preview de Vercel y abrir la consola en `/` y `/en`, en desktop y en mobile con el menú abierto: no tiene que haber violaciones de CSP Report-Only.
- [ ] Verificar los headers (ver "Verificar los headers").
- [ ] Si no hay violaciones, pasar la CSP a enforcing (ver la sección correspondiente).
