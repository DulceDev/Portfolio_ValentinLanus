# Portfolio Valentín Lanús — Spec de diseño

Fecha: 2026-10-14 · Estado: pendiente de revisión
Fuente de contenido: [`CONTENT.md`](../../../CONTENT.md)

## 1. Objetivo
Landing personal de una sola página, oscura y minimalista, con animaciones de scroll de
nivel Awwwards que refuerzan el contenido. Sirve para conseguir clientes freelance y empleo.
Tono seguro y técnico, centrado en problemas resueltos y decisiones de arquitectura.
Nunca "Senior" ni años de experiencia inventados.

**Éxito =** Lighthouse ≥ 90 en performance y accesibilidad (mobile), legible sin JS,
reduced-motion respetado, mobile impecable, placeholders fáciles de encontrar y reemplazar.

## 2. Alcance
- Secciones, en orden: Hero → Sobre mí → Stack → Proyectos → Contacto.
- Proyectos, en orden: Lotecito (destacado), Focusly, PhotoFinder. Todo en la landing, sin páginas de caso.
- Bilingüe ES (default, `/`) y EN (`/en/`). El copy en inglés lo redacta Claude adaptando el tono, y Valentín lo revisa.
- Contacto: solo links (mail, WhatsApp, GitHub DulceDev, LinkedIn). Sin formulario ni backend.
- Sin foto personal. Deploy en Vercel `*.vercel.app`, sin dominio propio por ahora.

**Fuera de alcance:** formulario, blog, CV descargable, sección "Cómo trabajo", cursor custom,
marquee, loader bloqueante, WebGL, auto-redirect por idioma.

## 3. Dirección visual

**Concepto: "De la señal a producción".** El acento verde "señal" significa estado/sincronizado.
En Lotecito pasa de apagado a encendido. Es la única decoración del sitio.

| Referencia | Tomamos | Evitamos |
|---|---|---|
| mariavasilyeva.com | Animación como narrativa, índice numerado, líneas finas | Loader largo, bloquear la lectura |
| brittanychiang.com | Una columna clara, secciones escaneables, anclas, skip link | Inter, tarjetas imagen+texto repetidas |
| tamalsen.dev | Voz dev (`// proyectos`) con mesura, mono para metadatos | Grilla de 3 cards iguales, tabs de filtro |

> Nota: las animaciones reales de mariavasilyeva.com no se pudieron inspeccionar (solo cargó el loader).
> El mapa de animaciones es criterio propio inspirado en el sitio.

### Paleta (tema oscuro único)
| Token | Hex | Contraste sobre bg |
|---|---|---|
| `--bg` | `#0B0D0C` | — |
| `--surface` / `--surface-2` | `#121513` / `#181C1A` | — |
| `--text` | `#E8EAE6` | 16:1 |
| `--text-2` | `#9BA39D` | 7.4:1 |
| `--text-3` | `#7A837D` | ~4.8–5:1 (solo metadatos; piso del scrub, nunca más oscuro) |
| `--accent` | `#8FD694` | 11:1 (botón: texto `--bg` sobre accent) |
| `--border` / `--border-ui` | `#262B28` / `#5B645E` | decorativo / 3.3:1 |

Foco: outline de 2px en accent, offset 3px. Nunca `#000` ni `#fff` puros.

### Tipografía
- **Geist** (variable) para display y texto, **Geist Mono** para stack, estados y metadatos.
- Fontsource autohospedada (licencia OFL), subset latin, `font-display: swap`, fallback con `size-adjust`.
- Escala:
  - h1 `clamp(2.5rem, 1.2rem + 6vw, 6.5rem)`, peso 600, tracking -0.04em, lh 1.0
  - h2 `clamp(1.75rem, 1rem + 3vw, 3.5rem)`
  - h3 `clamp(1.25rem, 1rem + 1vw, 1.75rem)`
  - body `clamp(1rem, .95rem + .25vw, 1.125rem)`, lh 1.65, máx 62ch
  - mono `clamp(.75rem, .72rem + .1vw, .8125rem)`, en mayúsculas solo en metadatos

### Grilla y layout
- 12 columnas, ancho máximo 1200px.
- Márgenes 24 / 48 / 64px (mobile / tablet / desktop), gap 24px.
- Breakpoints 640 / 768 / 1024 / 1280. Radio único de 6px. Escala de 8px.
- Separación entre secciones: `clamp(6rem, 12vw, 12rem)`.

Por sección:
- **Nav:** fija, 64px. Nombre a la izquierda; anclas y selector ES/EN a la derecha. En mobile, nombre + ES/EN + menú overlay con focus trap y Esc.
- **Hero:** `min-h 100dvh`, alineado a la izquierda. H1 gigante, rol y una frase. Un CTA (Contacto) y un link secundario a Proyectos.
- **Sobre mí:** texto en las columnas 4–11. Los pilares van como lista tipográfica, no como cards.
- **Stack:** 4 grupos (Frontend · Backend y datos · Mobile · Herramientas e IA) con nombres en mono, sin logos.
- **Proyectos:** Lotecito ocupa pantalla completa. Focusly y PhotoFinder son filas compactas, cada una con layout distinto. Capturas con ratio 16:10, y 9:19.5 para Android.
- **Contacto:** 4 links tipográficos grandes, con área táctil de 56px en mobile.
- **Eyebrows:** máximo 2 en toda la página.

## 4. Mapa de animaciones
Reglas generales:
- Solo se animan `transform` y `opacity`.
- El texto siempre está en el DOM.
- Ningún pin dura más de ~1.5 viewports.

Contextos de `gsap.matchMedia`:
- `desktop`: `(min-width: 900px) and (pointer: fine)`
- `mobile`: el resto
- `reduce`: `prefers-reduced-motion: reduce`

| Sección | Qué se mueve / disparador | Por qué | Mobile | Reduced-motion |
|---|---|---|---|---|
| Global | Lenis (lerp 0.1) sincronizado con ScrollTrigger; anclas con `lenis.scrollTo` + foco | Fluidez sin secuestrar el scroll | Scroll nativo | Off, salto instantáneo |
| Progreso | Barra de 2px arriba, `scaleX` scrub | Orientación | Igual | Oculta |
| Idioma | Es navegación a la otra ruta, sin animación | Simple y funciona sin JS | Igual | Igual |
| Hero | Reveal por líneas (mask + translateY) con **CSS keyframes**, después rol y CTA (~0.9s) | Jerarquía; LCP sin depender de JS | Más corto | Visible al instante |
| Sobre mí | Palabra por palabra de `--text-3` a `--text`, scrub | Guía la lectura | Fade por párrafo | Color final fijo |
| Stack | Stagger corto por grupo, una vez al entrar | Ordena por categorías | Fade simple | Estático |
| **Lotecito** | Pin de ~1.5 viewports en 4 pasos: sin señal → guardado local → vuelve la señal → sincronizado sin duplicados; el acento se enciende; problema, decisiones y stack entran por pasos | Hace visible el offline-first y la idempotencia | Sin pin, pasos con fade | Estado final fijo |
| Focusly / PhotoFinder | Parallax de máximo 40px en la captura + entrada de metadatos | Profundidad sin ruido | Sin parallax | Estático |
| Contacto | Subrayado que se dibuja; hover magnético solo con puntero fino | Feedback del CTA | Solo `:active` | Sin magnetismo |

La narrativa de Lotecito también existe como lista estática legible. El pin solo resalta el paso activo.

## 5. Arquitectura

### Stack
- `astro@^5` con `output: 'static'` y TypeScript `strict`. Sin integraciones de framework UI.
- `gsap@^3.13` (core + ScrollTrigger) y `lenis@^1.3`.
- `@fontsource-variable/geist` y `@fontsource-variable/geist-mono`.
- `@astrojs/sitemap`.
- Deploy en Vercel, que detecta Astro estático sin adapter.

### i18n
- Routing nativo de Astro: `defaultLocale: 'es'`, `locales: ['es','en']`, `prefixDefaultLocale: false`, `trailingSlash: 'never'`. Rutas `/` y `/en/`.
- `<html lang>` se resuelve en el server. Cada idioma lleva canonical propio, hreflang es/en/x-default y sitemap con alternates.
- `LangSwitch` es un `<a>` común (`getRelativeLocaleUrl`), así que funciona sin JS.
- Contenido tipado:
  - `src/i18n/types.ts` define `SiteContent`.
  - `es.ts` y `en.ts` usan `satisfies SiteContent`, así que si un idioma queda incompleto, falla en compilación.
  - `index.ts` expone `getContent(locale)`.
  - Los componentes no tienen texto hardcodeado.

### Estructura
```
astro.config.mjs · vercel.json · package.json · tsconfig.json
src/pages/index.astro, en/index.astro        → <Home locale/>
src/layouts/Base.astro                        html lang, Seo, fuentes, script inline "js", Motion
src/components/Seo.astro, Nav.astro, LangSwitch.astro, ProgressBar.astro, Motion.astro
src/components/sections/Hero|About|Stack|Projects|Contact.astro
src/components/projects/LotecitoPinned.astro, ProjectRow.astro, Placeholder.astro
src/i18n/types.ts, es.ts, en.ts, index.ts
src/content/placeholders.ts
src/scripts/motion/index.ts, lenis.ts, hero.ts, about.ts, stack.ts, lotecito.ts, projects.ts, contact.ts, progress.ts
src/styles/tokens.css, global.css
src/assets/projects/        (capturas cuando existan)
public/favicon.svg, og-es.png, og-en.png, robots.txt
tests/smoke.spec.ts
```
Cada módulo de `motion/` exporta `init(gsap, ScrollTrigger, ctx)` y devuelve un cleanup. `index.ts` es el único punto de entrada.

### Carga de JS (protege Lighthouse)
1. Un script inline en `<head>` agrega la clase `js` a `<html>`. El CSS oculta solo `.js [data-reveal]`.
2. El hero se anima con CSS, sin GSAP. Las palabras de "Sobre mí" se parten en `<span>` al hacer el build.
3. `motion/index.ts`, en el orden en que corre:
   1. Con reduced-motion, retorna sin descargar nada.
   2. Si no, espera `requestIdleCallback` y hace `import()` dinámico de gsap y ScrollTrigger.
   3. Lenis se importa solo en el contexto desktop.
4. Fallback: si el init no terminó en ~2s, se quita la clase `js` para que nada quede oculto.
5. `ScrollTrigger.refresh()` corre después de `document.fonts.ready` y de la carga de imágenes. `ScrollTrigger.config({ ignoreMobileResize: true })`.

### Placeholders
- `src/content/placeholders.ts` exporta `TODO(label)`. Los tipos aceptan `Link | Todo` e `Img | Todo`.
- `Placeholder.astro` los renderiza visibles y claramente falsos: "Captura pendiente", o el link con `aria-disabled`. Lleva `data-todo` en el HTML.
- Para listarlos: `npm run todo` (grep en `src/i18n`). El build avisa con un warning cuántos quedan.
- Pendientes: capturas de los 3 proyectos, links a repos y demos, mail, WhatsApp, GitHub DulceDev, LinkedIn, URL de `site` y las imágenes OG.

### Imágenes, SEO y headers
- **Imágenes:** `<Picture>` de `astro:assets` en AVIF/WebP, widths 480/800/1200, `sizes` real, lazy. Los placeholders tienen `aspect-ratio` fijo para que no haya CLS.
- **Fuentes:** preload solo de Geist latin woff2.
- **SEO:** title y description por idioma, OG/Twitter de 1200×630 por idioma, JSON-LD `Person`, sitemap y robots.txt.
- **`vercel.json`:**
  - Headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restrictiva, `X-Frame-Options: DENY`.
  - CSP primero como **Report-Only**: `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'`, más hashes de los scripts inline. Pasa a enforced una vez verificada.
  - Cache inmutable en `/_astro/*`.

## 6. Verificación
- **Cada tarea:** `astro check` (tipos y paridad ES/EN) y `astro build`. Formato con Prettier + `prettier-plugin-astro`.
- **Playwright**, unos 6 smoke tests:
  1. `/` y `/en/` cargan con su `lang` y sus hreflang.
  2. Sin JS, todo el texto se ve.
  3. Con reduced-motion no hay pin-spacer ni transforms.
  4. A 375px no hay overflow horizontal ni pin.
  5. axe sin violaciones en ambos idiomas.
  6. El LangSwitch navega a la ruta equivalente.
- **Lighthouse CI** (`@lhci/cli`) contra `astro preview`, preset mobile, 3 corridas, performance y accesibilidad ≥ 0.9.
- **Manual:** Android Chrome e iOS Safari reales, teclado, y lector de pantalla en la sección pinneada.
- **Seguridad:** el agente `seguridad` revisa dependencias y `vercel.json` antes del deploy.

## 7. Riesgos
| Riesgo | Mitigación |
|---|---|
| LCP/CLS por hero oculto, pin-spacer o swap de fuentes | Hero con CSS, fallback de fuente con size-adjust, aspect-ratio fijo |
| Desincronía entre Lenis y ScrollTrigger | `lenis.on('scroll', ScrollTrigger.update)`, gsap.ticker, `lagSmoothing(0)` |
| Medidas desactualizadas (fuentes, imágenes, largo ES ≠ EN) | `refresh` tras cargar; probar el pin en ambos idiomas |
| Contraste del scrub en el límite AA | Piso de `#7A837D`, nunca más oscuro |
| La CSP rompe los scripts inline en silencio | Empezar como Report-Only |
| Trailing slash inconsistente entre Astro y Vercel | `trailingSlash: 'never'` en los dos lados |
