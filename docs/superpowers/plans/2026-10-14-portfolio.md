# Portfolio Valentín Lanús: plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDA: usar superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan checkboxes (`- [ ]`) para el seguimiento.

**Objetivo:** construir una landing personal oscura y minimalista, bilingüe ES/EN, con animaciones de scroll que refuercen el contenido, en Astro estático con deploy en Vercel.

**Arquitectura:**
- Astro 5 estático. El routing i18n nativo genera `/` (es) y `/en`.
- Todo el texto vive en `src/i18n/es.ts` y `src/i18n/en.ts`, tipados con `SiteContent`. Los links y capturas compartidos entre idiomas viven en `src/content/links.ts`.
- La animación vive en `src/scripts/motion/`. `index.ts` es el único punto de entrada: importa GSAP dinámicamente en idle y reparte el trabajo por contexto con `gsap.matchMedia` (desktop, mobile y reduce).
- El hero se anima solo con CSS.

**Tech stack:** Astro 5 · TypeScript strict · GSAP 3.13+ (core + ScrollTrigger) · Lenis 1.3+ · Fontsource (Geist, Geist Mono) · @astrojs/sitemap · Playwright + axe · Lighthouse CI · Vercel.

**Spec:** [`docs/superpowers/specs/2026-10-14-portfolio-design.md`](../specs/2026-10-14-portfolio-design.md). Contenido fuente: [`CONTENT.md`](../../../CONTENT.md).

## Reparto de tareas

| # | Tarea | Tipo | Quién |
|---|---|---|---|
| 1 | Scaffold, routing i18n, Playwright | Simple | dev-junior (modelo liviano) |
| 2 | Modelo de contenido ES/EN + placeholders | Compleja | sesión principal |
| 3 | Tokens, fuentes, layout base, SEO | Visual | disenador-ui |
| 4 | Nav, selector de idioma, menú mobile, barra de progreso | Visual | disenador-ui |
| 5 | Hero | Visual | disenador-ui · **CHECKPOINT** |
| 6 | Sobre mí | Visual | disenador-ui · **CHECKPOINT** |
| 7 | Stack | Simple | dev-junior · **CHECKPOINT** |
| 8 | Proyectos: filas Focusly / PhotoFinder | Visual | disenador-ui |
| 9 | Proyectos: Lotecito (markup estático) | Visual | disenador-ui · **CHECKPOINT** |
| 10 | Contacto + footer | Simple | dev-junior · **CHECKPOINT** |
| 11 | Motion core: init, Lenis, progreso | Compleja | sesión principal |
| 12 | Motion de secciones: about, stack, proyectos, contacto | Compleja | sesión principal |
| 13 | Motion de Lotecito: pin y narrativa | Compleja | sesión principal · **CHECKPOINT** |
| 14 | Deploy: vercel.json, robots, favicon, OG | Simple | dev-junior + agente **seguridad** |
| 15 | Verificación final: axe, Lighthouse CI, manual | Simple | dev-junior + revisión de la sesión principal |

**CHECKPOINT** significa: levantar `npm run dev`, tomar capturas en desktop (1280px) y mobile (375px) con el navegador integrado, mostrárselas a Valentín y **esperar su aprobación** antes de seguir (Fase 3 del pedido).

## Restricciones globales

- Node 24, npm 11 y Windows. Los scripts de npm tienen que ser multiplataforma (Node, no grep/sed).
- `astro@^5`, `gsap@^3.13`, `lenis@^1.3`, `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`, `@astrojs/sitemap@^3`. No se suma ningún framework UI (React, Vue, etc.).
- Copy: nunca "Senior" ni años de experiencia. En el texto visible no van em-dashes (`—`): usar `·`, `:` o punto.
- Ningún componente tiene texto visible hardcodeado. Todo sale de `getContent(locale)`, salvo los símbolos decorativos (`/`, `↗`, números `01`).
- Tokens exactos:
  - Colores: `--bg #0B0D0C`, `--surface #121513`, `--surface-2 #181C1A`, `--text #E8EAE6`, `--text-2 #9BA39D`, `--text-3 #7A837D`, `--accent #8FD694`, `--border #262B28`, `--border-ui #5B645E`.
  - Radio único de 6px.
  - Grilla de 12 columnas, ancho máximo 1200px, márgenes de 24, 48 y 64px, gap de 24px.
- Animaciones: solo `transform` y `opacity`, más una excepción documentada (el scrub de `color` palabra por palabra en Sobre mí). El texto siempre está en el DOM. Ningún pin dura más de 1.5 viewports.
- `gsap.matchMedia`:
  - desktop: `(min-width: 900px) and (pointer: fine)`
  - mobile: `(max-width: 899px), (pointer: coarse), (pointer: none)`
  - reduce: `(prefers-reduced-motion: reduce)`
- Lenis corre solo en desktop. En mobile no hay pin ni parallax. Con reduce no hay ninguna animación JS.
- Se tiene que poder leer todo sin JS.
- Rutas: `/` y `/en`, con `trailingSlash: 'never'` y `build.format: 'file'`. En Vercel, `cleanUrls: true` y `trailingSlash: false`.
- `site` provisorio: `https://valentinlanus.vercel.app` (placeholder).
- Cada commit termina con la línea `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (va en el segundo `-m` de cada comando).
- Simplificación respecto de la spec: **no se oculta contenido por CSS antes del JS.** Las animaciones de entrada usan `gsap.from()`, que aplica el estado inicial recién cuando GSAP inicializa, sobre elementos que todavía están fuera de pantalla. Por eso desaparecen el riesgo de "texto oculto si el JS falla" y el fallback de 2s. La clase `js` en `<html>` se mantiene solo para el menú mobile.
- Cambio de layout respecto de la spec: en Lotecito se pinea solo el bloque narrativo (encabezado, problema, 4 pasos y señal). Las decisiones, la captura y el stack van debajo, con flujo normal y entrada escalonada, para que el bloque pineado entre en un viewport de 800px.

## Foco de revisión

Estos son los casos que la spec implica pero que nadie probaría sin pensarlo. Cada uno tiene su test en la tarea indicada.

1. **El copy en inglés es más largo y desborda el pin de Lotecito.** El bloque pineado tiene que entrar en 1280×800 en `/en`. Test en la Tarea 13.
2. **Se pasa de desktop a mobile en la misma sesión** (resize o rotación). Hay que revertir el pin y el parallax, sin `.pin-spacer` colgado. Test en la Tarea 13.
3. **Click en un ancla del nav con Lenis activo.** La sección queda visible debajo del nav fijo y recibe el foco. Test en la Tarea 11.
4. **Links pendientes.** No son clickeables (sin `href`, con `aria-disabled`) y se ven distintos. Test en la Tarea 8.
5. **Pantallas de 320px y palabras largas** ("Desarrollo asistido por IA", "AI-assisted development"). No puede haber scroll horizontal en ningún idioma. Test en la Tarea 10.

---

### Tarea 1: scaffold, routing i18n y Playwright · Simple (dev-junior)

**Archivos:**
- Crear: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `.prettierrc`, `playwright.config.ts`, `scripts/todo.mjs`, `.claude/launch.json`
- Crear: `src/i18n/locales.ts`, `src/layouts/Base.astro` (mínimo; se reescribe en la Tarea 3), `src/pages/index.astro`, `src/pages/en/index.astro`
- Test: `tests/i18n.spec.ts`

**Interfaces:**
- Produce: `type Locale = 'es' | 'en'` y `LOCALES` en `src/i18n/locales.ts`. También los scripts de npm `dev`, `build`, `preview`, `check`, `test`, `todo`, `format` y `lhci`.

- [ ] **Paso 1: inicializar git y npm**

```bash
git init
npm init -y
```

- [ ] **Paso 2: reemplazar `package.json` completo**

```json
{
  "name": "portfolio-valentin-lanus",
  "type": "module",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "todo": "node scripts/todo.mjs",
    "build": "node scripts/todo.mjs && astro build",
    "preview": "astro preview --port 4321",
    "check": "astro check",
    "format": "prettier --write .",
    "test": "playwright test",
    "lhci": "lhci autorun"
  }
}
```

- [ ] **Paso 3: instalar dependencias**

```bash
npm i astro@^5 @astrojs/sitemap@^3 gsap@^3.13 lenis@^1.3 @fontsource-variable/geist @fontsource-variable/geist-mono
npm i -D @astrojs/check typescript prettier prettier-plugin-astro @playwright/test @axe-core/playwright @lhci/cli
npx playwright install chromium
```

- [ ] **Paso 4: archivos de configuración**

`astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // PLACEHOLDER: URL definitiva del sitio (dominio o *.vercel.app real)
  site: 'https://valentinlanus.vercel.app',
  trailingSlash: 'never',
  build: { format: 'file' },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({ i18n: { defaultLocale: 'es', locales: { es: 'es-AR', en: 'en' } } }),
  ],
});
```

`tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

`.gitignore`:
```
node_modules/
dist/
.astro/
.vercel/
test-results/
playwright-report/
.lighthouseci/
```

`.prettierrc`:
```json
{ "plugins": ["prettier-plugin-astro"], "singleQuote": true, "printWidth": 100 }
```

`.claude/launch.json`:
```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "portfolio-dev", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 4321 }
  ]
}
```

`playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: 'list',
  use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

`scripts/todo.mjs` (lista los placeholders; `build` lo corre primero y avisa cuántos quedan):
```js
import { readFileSync, existsSync } from 'node:fs';

const files = ['src/content/links.ts', 'astro.config.mjs'];
const pattern = /TODO\(\s*['"`](.+?)['"`]\s*\)|PLACEHOLDER:\s*(.+)$/;
let total = 0;

for (const file of files) {
  if (!existsSync(file)) continue;
  readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line, i) => {
      const m = line.match(pattern);
      if (!m) return;
      total++;
      console.log(`  ${file}:${i + 1}  ${m[1] ?? m[2]}`);
    });
}

console.log(total ? `\n⚠ ${total} placeholders pendientes\n` : '\n✓ Sin placeholders\n');
```

`src/i18n/locales.ts`:
```ts
export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
```

- [ ] **Paso 5: escribir el test que falla**

`tests/i18n.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('/ sirve español y /en inglés', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
```

- [ ] **Paso 6: correrlo y verificar que falla**

Correr `npx playwright test tests/i18n.spec.ts`.
Esperado: FAIL. El build o el `goto` fallan porque todavía no hay páginas.

- [ ] **Paso 7: layout mínimo y páginas**

`src/layouts/Base.astro`:
```astro
---
import type { Locale } from '../i18n/locales';
interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
---

<!doctype html>
<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Valentín Lanús</title>
  </head>
  <body><slot /></body>
</html>
```

`src/pages/index.astro`:
```astro
---
import Base from '../layouts/Base.astro';
---

<Base locale="es"><h1>Valentín Lanús</h1></Base>
```

`src/pages/en/index.astro`:
```astro
---
import Base from '../../layouts/Base.astro';
---

<Base locale="en"><h1>Valentín Lanús</h1></Base>
```

- [ ] **Paso 8: correr y verificar que pasa**

Correr `npx playwright test tests/i18n.spec.ts` y después `npm run check`.
Esperado: el test PASS y `astro check` con 0 errores.

- [ ] **Paso 9: commit**

```bash
git add -A
git commit -m "chore: scaffold Astro con i18n, Playwright y script de placeholders" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Tarea 2: modelo de contenido ES/EN + placeholders · Compleja (sesión principal)

**Archivos:**
- Crear: `src/content/placeholders.ts`, `src/content/links.ts`, `src/i18n/types.ts`, `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/index.ts`

**Interfaces:**
- Consume: `Locale` de `src/i18n/locales.ts`.
- Produce:
  - `interface Todo { todo: true; label: string }`, `TODO(label: string): Todo` e `isTodo(v: unknown): v is Todo` en `placeholders.ts`.
  - `links` en `links.ts`.
  - `SiteContent`, `Project`, `FeaturedProject`, `LotecitoStep`, `ContactLink`, `MaybeUrl`, `MaybeImg`, `Ratio` y `Locale` en `types.ts`.
  - `getContent(locale: Locale): SiteContent` en `i18n/index.ts`.

- [ ] **Paso 1: placeholders y tipos**

`src/content/placeholders.ts`:
```ts
export interface Todo {
  todo: true;
  label: string;
}

/** Marca un dato pendiente. `npm run todo` lista todos los TODO(...) de src/content/links.ts. */
export const TODO = (label: string): Todo => ({ todo: true, label });

export const isTodo = (v: unknown): v is Todo =>
  typeof v === 'object' && v !== null && (v as Todo).todo === true;
```

`src/i18n/types.ts`:
```ts
import type { ImageMetadata } from 'astro';
import type { Todo } from '../content/placeholders';
import type { Locale } from './locales';

export type { Locale };
export type MaybeUrl = string | Todo;
export type MaybeImg = ImageMetadata | Todo;
export type Ratio = '16/10' | '9/19.5';

export interface Project {
  id: string;
  name: string;
  status: string;
  summary: string;
  points: string[];
  stack: string[];
  image: MaybeImg;
  imageAlt: string;
  imageRatio: Ratio;
  repo: MaybeUrl;
  demo: MaybeUrl;
}

export interface LotecitoStep {
  status: string;
  title: string;
  body: string;
}

export interface FeaturedProject extends Omit<Project, 'points'> {
  problem: string;
  steps: [LotecitoStep, LotecitoStep, LotecitoStep, LotecitoStep];
  decisions: string[];
  facts: string[];
}

export interface ContactLink {
  kind: 'mail' | 'whatsapp' | 'github' | 'linkedin';
  label: string;
  href: MaybeUrl;
}

export interface SiteContent {
  meta: { title: string; description: string; ogImage: string };
  nav: {
    skip: string;
    label: string;
    about: string;
    stack: string;
    projects: string;
    contact: string;
    menu: string;
    close: string;
    lang: { current: string; other: string; otherName: string };
  };
  hero: {
    eyebrow: string;
    name: [string, string];
    role: string;
    tagline: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  about: { heading: string; paragraphs: string[]; pillars: string[] };
  stack: { heading: string; groups: { name: string; items: string[] }[] };
  projects: {
    eyebrow: string;
    heading: string;
    labels: {
      problem: string;
      decisions: string;
      stack: string;
      repo: string;
      demo: string;
      imagePending: string;
      linkPending: string;
    };
    lotecito: FeaturedProject;
    others: [Project, Project];
  };
  contact: { heading: string; intro: string; links: ContactLink[] };
  footer: { note: string };
}
```

`src/content/links.ts`:
```ts
import { TODO } from './placeholders';
import type { MaybeImg, MaybeUrl } from '../i18n/types';

// Datos compartidos entre idiomas. Reemplazá cada TODO(...) por el valor real.
// Capturas: guardalas en src/assets/projects/ e importalas, p.ej.:
//   import lotecitoShot from '../assets/projects/lotecito.png';
//   lotecito: { image: lotecitoShot, ... }
interface ProjectLinks {
  image: MaybeImg;
  repo: MaybeUrl;
  demo: MaybeUrl;
}

export const links: {
  lotecito: ProjectLinks;
  focusly: ProjectLinks;
  photofinder: ProjectLinks;
  contact: Record<'mail' | 'whatsapp' | 'github' | 'linkedin', MaybeUrl>;
} = {
  lotecito: {
    image: TODO('Captura Lotecito (16:10)'),
    repo: TODO('Repo Lotecito'),
    demo: TODO('Demo Lotecito'),
  },
  focusly: {
    image: TODO('Captura Focusly (16:10)'),
    repo: TODO('Repo Focusly'),
    demo: TODO('Demo Focusly'),
  },
  photofinder: {
    image: TODO('Captura PhotoFinder (9:19.5)'),
    repo: TODO('Repo PhotoFinder'),
    demo: TODO('Demo PhotoFinder'),
  },
  contact: {
    mail: TODO('Mail (mailto:...)'),
    whatsapp: TODO('WhatsApp (https://wa.me/...)'),
    github: TODO('GitHub DulceDev (https://github.com/...)'),
    linkedin: TODO('LinkedIn (https://linkedin.com/in/...)'),
  },
};
```

- [ ] **Paso 2: contenido en español**

`src/i18n/es.ts`:
```ts
import { links } from '../content/links';
import type { SiteContent } from './types';

export default {
  meta: {
    title: 'Valentín Lanús · Software Developer & AI Engineer',
    description:
      'Desarrollador full-stack. Construyo productos web y mobile de punta a punta, con IA integrada donde suma de verdad.',
    ogImage: '/og-es.png',
  },
  nav: {
    skip: 'Saltar al contenido',
    label: 'Principal',
    about: 'Sobre mí',
    stack: 'Stack',
    projects: 'Proyectos',
    contact: 'Contacto',
    menu: 'Menú',
    close: 'Cerrar',
    lang: { current: 'ES', other: 'EN', otherName: 'English' },
  },
  hero: {
    eyebrow: '// portfolio',
    name: ['Valentín', 'Lanús'],
    role: 'Software Developer & AI Engineer',
    tagline:
      'Construyo productos web y mobile de punta a punta, del backend a la interfaz, con IA integrada donde suma de verdad.',
    ctaPrimary: 'Hablemos',
    ctaSecondary: 'Ver proyectos',
  },
  about: {
    heading: 'Sobre mí',
    paragraphs: [
      'Soy desarrollador full-stack y trabajo con flujos de desarrollo potenciados por IA. Diseño y construyo aplicaciones completas: APIs, bases de datos, autenticación, interfaces y apps móviles nativas.',
      'Me enfoco en código mantenible, arquitecturas claras y en entregar software que funcione en producción, no solo en la demo.',
      'Trabajo de forma remota con clientes y equipos; abierto a freelance y full-time.',
    ],
    pillars: ['APIs y bases de datos', 'Autenticación', 'Interfaces web', 'Apps móviles nativas'],
  },
  stack: {
    heading: 'Stack',
    groups: [
      { name: 'Frontend', items: ['React', 'Vite', 'PWA', 'JavaScript'] },
      { name: 'Backend y datos', items: ['Node.js', 'PostgreSQL', 'Supabase', 'JWT'] },
      { name: 'Mobile', items: ['Kotlin', 'Jetpack Compose', 'Room', 'Retrofit', 'Firebase Auth'] },
      { name: 'Herramientas e IA', items: ['Vercel', 'Git', 'Desarrollo asistido por IA'] },
    ],
  },
  projects: {
    eyebrow: '// proyectos',
    heading: 'Proyectos',
    labels: {
      problem: 'Problema',
      decisions: 'Decisiones clave',
      stack: 'Stack',
      repo: 'Código',
      demo: 'Demo',
      imagePending: 'Captura pendiente',
      linkPending: 'link pendiente',
    },
    lotecito: {
      id: 'lotecito',
      name: 'Lotecito',
      status: 'En producción',
      summary:
        'PWA offline-first para una empresa de servicios agrícolas. Reemplaza el registro en papel y WhatsApp: el sembrador carga cada lote desde el celular sin señal y el dueño lo revisa, corrige y exporta a Excel desde la oficina.',
      problem:
        'El dato nace en el campo sin cobertura y se usa en la oficina para liquidar. Perder o duplicar una carga son hectáreas mal cobradas.',
      steps: [
        { status: 'Sin señal', title: 'Carga en el campo', body: 'El sembrador registra el lote desde el celular, sin cobertura.' },
        { status: 'Guardado local', title: 'Nada se pierde', body: 'La carga queda en el dispositivo sin depender de red ni de sesión.' },
        { status: 'Sincronizando', title: 'Vuelve la señal', body: 'Las cargas pendientes se sincronizan solas, sin que nadie toque nada.' },
        { status: 'Sincronizado', title: 'Sin duplicados', body: 'Los envíos son idempotentes: un corte de señal no duplica hectáreas.' },
      ],
      decisions: [
        'Offline-first desde el día uno, no un "modo offline" agregado.',
        'Cargas guardadas sin depender de red ni de sesión, sincronizadas solas.',
        'Envíos idempotentes para que un corte de señal no duplique hectáreas.',
        'Auditoría de cada corrección y borrado.',
        'Exportación a Excel lista para liquidar.',
        'UX pensada para usuarios no técnicos, al sol y con poco tiempo.',
      ],
      facts: ['En producción', '24 migraciones de base de datos'],
      stack: ['React', 'Vite', 'PWA', 'Supabase', 'Vercel'],
      imageAlt: 'Captura de Lotecito: carga de un lote desde el celular',
      imageRatio: '16/10',
      ...links.lotecito,
    },
    others: [
      {
        id: 'focusly',
        name: 'Focusly',
        status: 'Equipo de 4',
        summary:
          'Web app que genera planes de estudio personalizados según materias, fechas de examen y disponibilidad.',
        points: [
          'Algoritmo propio de generación de planes.',
          'Autenticación con JWT.',
          'Fechas a prueba de zonas horarias.',
          'Desarrollo full-stack en equipo de 4.',
        ],
        stack: ['Vite', 'Node', 'PostgreSQL', 'JWT'],
        imageAlt: 'Captura de Focusly: plan de estudio generado',
        imageRatio: '16/10',
        ...links.focusly,
      },
      {
        id: 'photofinder',
        name: 'PhotoFinder',
        status: 'Android nativa',
        summary: 'Buscar, explorar y guardar fotos en alta calidad consumiendo la API de Unsplash.',
        points: ['Arquitectura MVVM con repositorios.', 'Caché local con Room.', 'Login con Google.'],
        stack: ['Kotlin', 'Jetpack Compose', 'MVVM', 'Retrofit', 'Room', 'Firebase Auth'],
        imageAlt: 'Captura de PhotoFinder en Android: grilla de fotos',
        imageRatio: '9/19.5',
        ...links.photofinder,
      },
    ],
  },
  contact: {
    heading: 'Contacto',
    intro: 'Abierto a proyectos freelance y posiciones full-time. Escribime por donde te quede cómodo.',
    links: [
      { kind: 'mail', label: 'Mail', href: links.contact.mail },
      { kind: 'whatsapp', label: 'WhatsApp', href: links.contact.whatsapp },
      { kind: 'github', label: 'GitHub · DulceDev', href: links.contact.github },
      { kind: 'linkedin', label: 'LinkedIn', href: links.contact.linkedin },
    ],
  },
  footer: { note: 'Diseñado y desarrollado por Valentín Lanús.' },
} satisfies SiteContent;
```

- [ ] **Paso 3: contenido en inglés** (adaptado, no literal; Valentín lo revisa en el checkpoint de la Tarea 5)

`src/i18n/en.ts`:
```ts
import { links } from '../content/links';
import type { SiteContent } from './types';

export default {
  meta: {
    title: 'Valentín Lanús · Software Developer & AI Engineer',
    description:
      'Full-stack developer. I build web and mobile products end to end, with AI built in where it actually adds value.',
    ogImage: '/og-en.png',
  },
  nav: {
    skip: 'Skip to content',
    label: 'Main',
    about: 'About',
    stack: 'Stack',
    projects: 'Projects',
    contact: 'Contact',
    menu: 'Menu',
    close: 'Close',
    lang: { current: 'EN', other: 'ES', otherName: 'Español' },
  },
  hero: {
    eyebrow: '// portfolio',
    name: ['Valentín', 'Lanús'],
    role: 'Software Developer & AI Engineer',
    tagline:
      'I build web and mobile products end to end, from the backend to the interface, with AI built in where it actually adds value.',
    ctaPrimary: "Let's talk",
    ctaSecondary: 'See projects',
  },
  about: {
    heading: 'About',
    paragraphs: [
      'I’m a full-stack developer working with AI-powered development workflows. I design and build complete applications: APIs, databases, authentication, interfaces and native mobile apps.',
      'I care about maintainable code, clear architecture and shipping software that works in production, not just in the demo.',
      'I work remotely with clients and teams, and I’m open to freelance and full-time roles.',
    ],
    pillars: ['APIs & databases', 'Authentication', 'Web interfaces', 'Native mobile apps'],
  },
  stack: {
    heading: 'Stack',
    groups: [
      { name: 'Frontend', items: ['React', 'Vite', 'PWA', 'JavaScript'] },
      { name: 'Backend & data', items: ['Node.js', 'PostgreSQL', 'Supabase', 'JWT'] },
      { name: 'Mobile', items: ['Kotlin', 'Jetpack Compose', 'Room', 'Retrofit', 'Firebase Auth'] },
      { name: 'Tools & AI', items: ['Vercel', 'Git', 'AI-assisted development'] },
    ],
  },
  projects: {
    eyebrow: '// projects',
    heading: 'Projects',
    labels: {
      problem: 'Problem',
      decisions: 'Key decisions',
      stack: 'Stack',
      repo: 'Code',
      demo: 'Demo',
      imagePending: 'Screenshot coming soon',
      linkPending: 'link coming soon',
    },
    lotecito: {
      id: 'lotecito',
      name: 'Lotecito',
      status: 'In production',
      summary:
        'Offline-first PWA for an agricultural services company. It replaces paper logs and WhatsApp: the operator records each field lot from a phone with no signal, and the owner reviews, corrects and exports it to Excel from the office.',
      problem:
        'The data is born in the field with no coverage and used in the office for billing. Losing or duplicating a record means hectares billed wrong.',
      steps: [
        { status: 'No signal', title: 'Logged in the field', body: 'The operator records the lot from a phone, with no coverage.' },
        { status: 'Saved locally', title: 'Nothing gets lost', body: 'The record stays on the device, independent of network or session.' },
        { status: 'Syncing', title: 'Signal comes back', body: 'Pending records sync on their own, with no one touching anything.' },
        { status: 'Synced', title: 'No duplicates', body: 'Submissions are idempotent: a dropped connection never duplicates hectares.' },
      ],
      decisions: [
        'Offline-first from day one, not an "offline mode" bolted on later.',
        'Records saved independent of network or session, synced automatically.',
        'Idempotent submissions so a dropped signal never duplicates hectares.',
        'An audit trail for every correction and deletion.',
        'Excel export ready for billing.',
        'UX designed for non-technical users, in direct sunlight, short on time.',
      ],
      facts: ['In production', '24 database migrations'],
      stack: ['React', 'Vite', 'PWA', 'Supabase', 'Vercel'],
      imageAlt: 'Lotecito screenshot: logging a field lot from a phone',
      imageRatio: '16/10',
      ...links.lotecito,
    },
    others: [
      {
        id: 'focusly',
        name: 'Focusly',
        status: 'Team of 4',
        summary:
          'Web app that generates personalized study plans based on subjects, exam dates and availability.',
        points: [
          'Custom plan-generation algorithm.',
          'JWT authentication.',
          'Timezone-proof dates.',
          'Full-stack development in a team of 4.',
        ],
        stack: ['Vite', 'Node', 'PostgreSQL', 'JWT'],
        imageAlt: 'Focusly screenshot: a generated study plan',
        imageRatio: '16/10',
        ...links.focusly,
      },
      {
        id: 'photofinder',
        name: 'PhotoFinder',
        status: 'Native Android',
        summary: 'Search, explore and save high-quality photos from the Unsplash API.',
        points: ['MVVM architecture with repositories.', 'Local cache with Room.', 'Google sign-in.'],
        stack: ['Kotlin', 'Jetpack Compose', 'MVVM', 'Retrofit', 'Room', 'Firebase Auth'],
        imageAlt: 'PhotoFinder screenshot on Android: photo grid',
        imageRatio: '9/19.5',
        ...links.photofinder,
      },
    ],
  },
  contact: {
    heading: 'Contact',
    intro: 'Open to freelance projects and full-time roles. Reach out wherever suits you.',
    links: [
      { kind: 'mail', label: 'Email', href: links.contact.mail },
      { kind: 'whatsapp', label: 'WhatsApp', href: links.contact.whatsapp },
      { kind: 'github', label: 'GitHub · DulceDev', href: links.contact.github },
      { kind: 'linkedin', label: 'LinkedIn', href: links.contact.linkedin },
    ],
  },
  footer: { note: 'Designed and built by Valentín Lanús.' },
} satisfies SiteContent;
```

`src/i18n/index.ts`:
```ts
import es from './es';
import en from './en';
import type { Locale, SiteContent } from './types';

const content: Record<Locale, SiteContent> = { es, en };

export const getContent = (locale: Locale): SiteContent => content[locale];
```

- [ ] **Paso 4: verificar que la paridad ES/EN la exigen los tipos (test negativo)**

Borrar temporalmente la línea `footer: {...}` de `en.ts`. Correr `npm run check`.
Esperado: FAIL, con un error que dice que falta la propiedad `footer`. Restaurar la línea y volver a correr `npm run check`.
Esperado: 0 errores.

- [ ] **Paso 5: verificar el listado de placeholders**

Correr `npm run todo`.
Esperado: 14 líneas (9 de proyectos, 4 de contacto y 1 de `astro.config.mjs`) y el aviso `⚠ 14 placeholders pendientes`.

- [ ] **Paso 6: commit**

```bash
git add -A
git commit -m "feat: modelo de contenido tipado ES/EN y placeholders centralizados" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Tarea 3: tokens, fuentes, layout base y SEO · Visual (disenador-ui)

**Archivos:**
- Crear: `src/styles/tokens.css`, `src/styles/global.css`, `src/components/Seo.astro`, `src/components/Home.astro`
- Reescribir: `src/layouts/Base.astro`, `src/pages/index.astro`, `src/pages/en/index.astro`
- Test: `tests/i18n.spec.ts` (agregar casos)

**Interfaces:**
- Consume: `getContent`, `SiteContent` y `Locale` (Tarea 2).
- Produce:
  - `Base.astro`, con props `{ locale: Locale; content: SiteContent }`.
  - `Home.astro`, con props `{ locale: Locale }`, que renderiza `<main id="main" tabindex="-1">`. Las tareas siguientes agregan secciones ahí.
  - Clases globales `.container`, `.grid`, `.section`, `.section__title`, `.mono`, `.label`, `.eyebrow`, `.visually-hidden`, `.skip-link`, `.btn`, `.btn--primary`, `.btn--ghost`, `.tags` y `.link--pending`.
  - Variables CSS: los tokens globales más `--nav-h`, `--gutter`, `--max-w`, `--ease-out`, `--fs-*` y `--section-space`.

- [ ] **Paso 1: escribir los tests que fallan**

Agregar a `tests/i18n.spec.ts`:
```ts
const SITE = 'https://valentinlanus.vercel.app';

test('SEO en inglés: title, canonical y hreflang', async ({ page }) => {
  await page.goto('/en');
  await expect(page).toHaveTitle('Valentín Lanús · Software Developer & AI Engineer');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/en`);
  await expect(page.locator('link[hreflang="es"]')).toHaveAttribute('href', `${SITE}/`);
  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', `${SITE}/en`);
  await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute('href', `${SITE}/`);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${SITE}/og-en.png`);
});

test('SEO en español: descripción y og:locale', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Desarrollador full-stack/);
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'es_AR');
  await expect(page.locator('main#main')).toHaveCount(1);
});
```

- [ ] **Paso 2: correrlos y verificar que fallan**

Correr `npx playwright test tests/i18n.spec.ts`.
Esperado: los 2 tests nuevos FAIL porque no hay canonical ni `main`.

- [ ] **Paso 3: estilos**

`src/styles/tokens.css`:
```css
:root {
  color-scheme: dark;
  --bg: #0b0d0c;
  --surface: #121513;
  --surface-2: #181c1a;
  --text: #e8eae6;
  --text-2: #9ba39d;
  --text-3: #7a837d;
  --accent: #8fd694;
  --border: #262b28;
  --border-ui: #5b645e;

  --font-sans: 'Geist Variable', 'Geist Fallback', system-ui, sans-serif;
  --font-mono: 'Geist Mono Variable', ui-monospace, 'Cascadia Mono', monospace;
  --fs-h1: clamp(2.5rem, 1.2rem + 6vw, 6.5rem);
  --fs-h2: clamp(1.75rem, 1rem + 3vw, 3.5rem);
  --fs-h3: clamp(1.25rem, 1rem + 1vw, 1.75rem);
  --fs-body: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --fs-mono: clamp(0.75rem, 0.72rem + 0.1vw, 0.8125rem);

  --radius: 6px;
  --nav-h: 64px;
  --max-w: 1200px;
  --gutter: 24px;
  --section-space: clamp(6rem, 12vw, 12rem);
  --ease-out: cubic-bezier(0.2, 0.7, 0, 1);
}
@media (min-width: 768px) {
  :root { --gutter: 48px; }
}
@media (min-width: 1024px) {
  :root { --gutter: 64px; }
}
```

`src/styles/global.css`:
```css
/* Fallback métrico para reducir el CLS del swap de Geist. Ajustar si Lighthouse marca CLS > 0.02. */
@font-face {
  font-family: 'Geist Fallback';
  src: local('Arial');
  size-adjust: 104%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}

*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }
html { -webkit-text-size-adjust: 100%; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: var(--fs-body);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  overflow-x: clip;
}
img, picture, svg { display: block; max-width: 100%; height: auto; }
a { color: inherit; text-decoration-thickness: 1px; text-underline-offset: 0.2em; }
ul, ol { padding: 0; list-style: none; }
button { font: inherit; color: inherit; }
h1, h2, h3 { font-weight: 600; line-height: 1.05; letter-spacing: -0.03em; text-wrap: balance; }
p { text-wrap: pretty; overflow-wrap: break-word; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 2px; }
[tabindex='-1']:focus { outline: none; }
::selection { background: var(--accent); color: var(--bg); }

.container {
  width: 100%;
  max-width: calc(var(--max-w) + 2 * var(--gutter));
  margin-inline: auto;
  padding-inline: var(--gutter);
}
.grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: 24px; }
.grid > * { grid-column: 1 / -1; }
.section { padding-block: var(--section-space); scroll-margin-top: var(--nav-h); }
.section__title { font-size: var(--fs-h2); }
.mono { font-family: var(--font-mono); font-size: var(--fs-mono); letter-spacing: 0.02em; }
.label { text-transform: uppercase; color: var(--text-2); }
.eyebrow { color: var(--accent); margin-bottom: 1rem; }

.visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
.skip-link {
  position: fixed; top: 8px; left: 8px; z-index: 100;
  padding: 12px 16px; border-radius: var(--radius);
  background: var(--accent); color: var(--bg); font-weight: 600; text-decoration: none;
  transform: translateY(-200%);
}
.skip-link:focus { transform: none; }

.btn {
  display: inline-flex; align-items: center; min-height: 48px; padding: 0 20px;
  border-radius: var(--radius); font-weight: 500; text-decoration: none;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}
.btn--primary { background: var(--accent); color: var(--bg); }
.btn--primary:hover { background: var(--text); }
.btn--ghost { border: 1px solid var(--border-ui); }
.btn--ghost:hover { border-color: var(--text-2); }

.tags { display: flex; flex-wrap: wrap; gap: 8px; color: var(--text-2); }
.tags li { padding: 4px 10px; border: 1px solid var(--border); border-radius: var(--radius); }
.link--pending { color: var(--text-3); cursor: not-allowed; text-decoration: none; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Paso 4: verificar el nombre del woff2 que se precarga**

Correr `ls node_modules/@fontsource-variable/geist/files | grep latin-wght-normal`.
Esperado: `geist-latin-wght-normal.woff2`. Si el nombre es otro, usar el que aparezca en el paso 5.

- [ ] **Paso 5: SEO, layout y Home**

`src/components/Seo.astro`:
```astro
---
import type { Locale, SiteContent } from '../i18n/types';
interface Props {
  locale: Locale;
  meta: SiteContent['meta'];
}
const { locale, meta } = Astro.props;
const site = Astro.site!;
const urls = { es: new URL('/', site).href, en: new URL('/en', site).href };
const canonical = urls[locale];
const ogImage = new URL(meta.ogImage, site).href;
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Valentín Lanús',
  jobTitle: 'Software Developer & AI Engineer',
  url: urls.es,
};
---

<title>{meta.title}</title>
<meta name="description" content={meta.description} />
<link rel="canonical" href={canonical} />
<link rel="alternate" hreflang="es" href={urls.es} />
<link rel="alternate" hreflang="en" href={urls.en} />
<link rel="alternate" hreflang="x-default" href={urls.es} />
<meta property="og:type" content="website" />
<meta property="og:locale" content={locale === 'es' ? 'es_AR' : 'en_US'} />
<meta property="og:title" content={meta.title} />
<meta property="og:description" content={meta.description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogImage} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="theme-color" content="#0b0d0c" />
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

`src/layouts/Base.astro` (reemplaza el archivo completo):
```astro
---
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import geistLatin from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';
import '../styles/tokens.css';
import '../styles/global.css';
import Seo from '../components/Seo.astro';
import type { Locale, SiteContent } from '../i18n/types';
interface Props {
  locale: Locale;
  content: SiteContent;
}
const { locale, content } = Astro.props;
---

<!doctype html>
<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preload" href={geistLatin} as="font" type="font/woff2" crossorigin />
    <script is:inline>document.documentElement.classList.add('js');</script>
    <Seo locale={locale} meta={content.meta} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

`src/components/Home.astro`:
```astro
---
import Base from '../layouts/Base.astro';
import { getContent } from '../i18n';
import type { Locale } from '../i18n/types';
interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const c = getContent(locale);
---

<Base locale={locale} content={c}>
  <main id="main" tabindex="-1">
    <!-- secciones: se agregan en las tareas 5 a 10 -->
  </main>
</Base>
```

`src/pages/index.astro`:
```astro
---
import Home from '../components/Home.astro';
---

<Home locale="es" />
```

`src/pages/en/index.astro`:
```astro
---
import Home from '../../components/Home.astro';
---

<Home locale="en" />
```

- [ ] **Paso 6: correr y verificar que pasa**

Correr `npx playwright test tests/i18n.spec.ts` y `npm run check`.
Esperado: 3 tests PASS y 0 errores.

- [ ] **Paso 7: commit**

```bash
git add -A
git commit -m "feat: tokens, fuentes autohospedadas, layout base y SEO por idioma" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Tarea 4: nav, selector de idioma, menú mobile y barra de progreso · Visual (disenador-ui)

**Archivos:**
- Crear: `src/components/Nav.astro`, `src/components/LangSwitch.astro`, `src/components/ProgressBar.astro`
- Modificar: `src/components/Home.astro`
- Test: `tests/nav.spec.ts`

**Interfaces:**
- Consume: `SiteContent['nav']` y `Locale`.
- Produce:
  - Anclas `#top`, `#about`, `#stack`, `#projects` y `#contact`. Las secciones de las Tareas 5 a 10 tienen que usar exactamente esos `id`.
  - El elemento `[data-progress]`, que anima la Tarea 11.

- [ ] **Paso 1: escribir los tests que fallan**

`tests/nav.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('skip link es lo primero enfocable y apunta a main', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Saltar al contenido' });
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute('href', '#main');
});

test('selector de idioma navega a la ruta equivalente', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /English/ }).click();
  await expect(page).toHaveURL(/\/en$/);
  await page.getByRole('link', { name: /Español/ }).click();
  await expect(page).toHaveURL(/localhost:4321\/?$/);
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('menú abre, atrapa foco y cierra con Esc', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Menú' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const menu = page.locator('[data-menu]');
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('link').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(toggle).toBeFocused();
  });
});

test.describe('sin JS', () => {
  test.use({ viewport: { width: 375, height: 812 }, javaScriptEnabled: false });

  test('los links del nav se ven sin botón de menú', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav__links').getByRole('link', { name: /Proyectos/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menú' })).toBeHidden();
  });
});
```

- [ ] **Paso 2: correrlos y verificar que fallan**

Correr `npx playwright test tests/nav.spec.ts`.
Esperado: los 4 tests FAIL.

- [ ] **Paso 3: componentes**

`src/components/LangSwitch.astro`:
```astro
---
import { getRelativeLocaleUrl } from 'astro:i18n';
import type { Locale, SiteContent } from '../i18n/types';
interface Props {
  locale: Locale;
  lang: SiteContent['nav']['lang'];
}
const { locale, lang } = Astro.props;
const other: Locale = locale === 'es' ? 'en' : 'es';
const href = getRelativeLocaleUrl(other, '') || '/';
---

<div class="lang mono">
  <span class="lang__current" aria-hidden="true">{lang.current}</span>
  <span aria-hidden="true">/</span>
  <a href={href} hreflang={other} lang={other}>
    <span aria-hidden="true">{lang.other}</span>
    <span class="visually-hidden">{lang.otherName}</span>
  </a>
</div>

<style>
  .lang { display: inline-flex; align-items: center; gap: 6px; color: var(--text-3); }
  .lang__current { color: var(--text); }
  .lang a {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 44px; min-height: 44px; color: var(--text-2); text-decoration: none;
  }
  .lang a:hover { color: var(--text); }
</style>
```

`src/components/ProgressBar.astro`:
```astro
<div class="progress" aria-hidden="true" data-progress></div>

<style>
  .progress {
    position: fixed; inset: 0 0 auto; z-index: 70; height: 2px;
    background: var(--accent); transform: scaleX(0); transform-origin: left;
  }
</style>
```

`src/components/Nav.astro`:
```astro
---
import LangSwitch from './LangSwitch.astro';
import type { Locale, SiteContent } from '../i18n/types';
interface Props {
  locale: Locale;
  nav: SiteContent['nav'];
  name: string;
}
const { locale, nav, name } = Astro.props;
const items = [
  { href: '#about', label: nav.about },
  { href: '#stack', label: nav.stack },
  { href: '#projects', label: nav.projects },
  { href: '#contact', label: nav.contact },
];
---

<a class="skip-link" href="#main">{nav.skip}</a>
<header class="nav">
  <div class="nav__inner container">
    <a class="nav__name" href="#top">{name}</a>
    <nav class="nav__links" aria-label={nav.label}>
      <ol>
        {items.map((item, i) => (
          <li>
            <a href={item.href}>
              <span class="mono" aria-hidden="true">0{i + 1}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
    <LangSwitch locale={locale} lang={nav.lang} />
    <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
      {nav.menu}
    </button>
  </div>
</header>
<div id="menu" class="menu" hidden data-menu>
  <nav aria-label={nav.label}>
    <ol>
      {items.map((item, i) => (
        <li>
          <a href={item.href} data-menu-link>
            <span class="mono" aria-hidden="true">0{i + 1}</span>
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  </nav>
  <button class="menu__close btn btn--ghost" type="button" data-menu-close>{nav.close}</button>
</div>

<script>
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (toggle && menu) {
    const focusables = () => Array.from(menu.querySelectorAll<HTMLElement>('a, button'));
    const open = () => {
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      focusables()[0]?.focus();
    };
    const close = (returnFocus = true) => {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (returnFocus) toggle.focus();
    };
    toggle.addEventListener('click', open);
    menu.querySelector('[data-menu-close]')?.addEventListener('click', () => close());
    menu.querySelectorAll('[data-menu-link]').forEach((a) => a.addEventListener('click', () => close(false)));
    document.addEventListener('keydown', (e) => {
      if (menu.hidden) return;
      if (e.key === 'Escape') return close();
      if (e.key !== 'Tab') return;
      const f = focusables();
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
    matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
      if (e.matches && !menu.hidden) close(false);
    });
  }
</script>

<style>
  .nav {
    position: fixed; inset: 0 0 auto; z-index: 50; height: var(--nav-h);
    background: color-mix(in srgb, var(--bg) 85%, transparent);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border);
  }
  .nav__inner { height: 100%; display: flex; align-items: center; gap: 24px; }
  .nav__name { margin-right: auto; font-weight: 600; text-decoration: none; }
  .nav__links ol { display: flex; gap: 28px; }
  .nav__links a {
    display: inline-flex; align-items: baseline; gap: 8px;
    color: var(--text-2); font-size: 0.9375rem; text-decoration: none;
  }
  .nav__links a:hover { color: var(--text); }
  .nav__links .mono, .menu .mono { color: var(--accent); }
  .nav__toggle {
    display: none; align-items: center; min-height: 44px; padding: 0 14px;
    background: none; border: 1px solid var(--border-ui); border-radius: var(--radius); cursor: pointer;
  }
  .menu {
    position: fixed; inset: 0; z-index: 60; background: var(--bg);
    padding: calc(var(--nav-h) + 24px) var(--gutter) 32px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .menu[hidden] { display: none; }
  .menu ol { display: grid; gap: 4px; }
  .menu a {
    display: flex; align-items: baseline; gap: 12px; min-height: 56px;
    font-size: var(--fs-h2); font-weight: 600; text-decoration: none;
  }
  .menu__close { align-self: flex-start; background: none; cursor: pointer; }

  @media (max-width: 767px) {
    :global(.js) .nav__links { display: none; }
    :global(.js) .nav__toggle { display: inline-flex; }
    :global(html:not(.js)) .nav { position: static; height: auto; }
    :global(html:not(.js)) .nav__inner { flex-wrap: wrap; padding-block: 12px; }
    :global(html:not(.js)) .nav__links ol { flex-wrap: wrap; gap: 4px 16px; }
  }
</style>
```

- [ ] **Paso 4: montar en Home**

En `src/components/Home.astro`, agregar los imports en el frontmatter:
```astro
import Nav from './Nav.astro';
import ProgressBar from './ProgressBar.astro';
```
Y dentro de `<Base>`, antes de `<main>`:
```astro
  <ProgressBar />
  <Nav locale={locale} nav={c.nav} name={c.hero.name.join(' ')} />
```

- [ ] **Paso 5: correr y verificar que pasa**

Correr `npx playwright test tests/nav.spec.ts` y `npm run check`.
Esperado: 4 tests PASS y 0 errores.

- [ ] **Paso 6: commit**

```bash
git add -A
git commit -m "feat: nav con skip link, selector de idioma y menú mobile accesible" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Tarea 5: Hero · Visual (disenador-ui) · CHECKPOINT

**Archivos:**
- Crear: `src/components/sections/Hero.astro`
- Modificar: `src/components/Home.astro`
- Test: `tests/sections.spec.ts`

**Interfaces:**
- Consume: `SiteContent['hero']`.
- Produce: `<section id="top" tabindex="-1">`.

- [ ] **Paso 1: escribir los tests que fallan**

`tests/sections.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('hero: h1 con el nombre y CTAs a contacto y proyectos', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Valentín Lanús' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Hablemos' })).toHaveAttribute('href', '#contact');
  await expect(page.getByRole('link', { name: 'Ver proyectos' })).toHaveAttribute('href', '#projects');
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
```

- [ ] **Paso 2: correrlos y verificar que fallan**

Correr `npx playwright test tests/sections.spec.ts`.
Esperado: FAIL, porque no hay h1.

- [ ] **Paso 3: implementar**

`src/components/sections/Hero.astro`:
```astro
---
import type { SiteContent } from '../../i18n/types';
interface Props {
  hero: SiteContent['hero'];
}
const { hero } = Astro.props;
---

<section id="top" class="hero container" aria-labelledby="hero-title" tabindex="-1">
  <p class="mono eyebrow reveal" style="--i:0">{hero.eyebrow}</p>
  <h1 id="hero-title" class="hero__title">
    {hero.name.map((word, i) => (
      <>
        <span class="line"><span class="line__inner" style={`--i:${i + 1}`}>{word}</span></span>{' '}
      </>
    ))}
  </h1>
  <p class="hero__role reveal" style="--i:3">{hero.role}</p>
  <p class="hero__tagline reveal" style="--i:4">{hero.tagline}</p>
  <div class="hero__ctas reveal" style="--i:5">
    <a class="btn btn--primary" href="#contact">{hero.ctaPrimary}</a>
    <a class="btn btn--ghost" href="#projects">{hero.ctaSecondary}</a>
  </div>
</section>

<style>
  .hero {
    min-height: 100dvh;
    display: flex; flex-direction: column; justify-content: flex-end;
    padding-top: calc(var(--nav-h) + 4rem);
    padding-bottom: clamp(3rem, 10vh, 7rem);
  }
  .hero__title {
    font-size: var(--fs-h1); font-weight: 600; letter-spacing: -0.04em; line-height: 1;
    margin-bottom: 1.5rem;
  }
  .line { display: block; overflow: hidden; padding-bottom: 0.08em; }
  .line__inner {
    display: inline-block;
    animation: line-in 0.9s var(--ease-out) both;
    animation-delay: calc(var(--i) * 90ms);
  }
  .hero__role { font-family: var(--font-mono); color: var(--accent); margin-bottom: 1rem; }
  .hero__tagline { max-width: 52ch; color: var(--text-2); font-size: clamp(1.0625rem, 1rem + 0.4vw, 1.375rem); }
  .hero__ctas { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 2.5rem; }
  .reveal {
    animation: fade-up 0.7s var(--ease-out) both;
    animation-delay: calc(var(--i) * 90ms + 200ms);
  }
  @keyframes line-in { from { transform: translateY(105%); } }
  @keyframes fade-up { from { opacity: 0; transform: translateY(12px); } }
  @media (max-width: 767px) {
    .line__inner, .reveal { animation-duration: 0.6s; }
  }
  @media (prefers-reduced-motion: reduce) {
    .line__inner, .reveal { animation: none; }
  }
</style>
```

En `Home.astro`, agregar `import Hero from './sections/Hero.astro';` y dentro de `<main>`, `<Hero hero={c.hero} />`.

- [ ] **Paso 4: correr y verificar que pasa**

Correr `npx playwright test tests/sections.spec.ts` y `npm run check`.
Esperado: PASS.

- [ ] **Paso 5: commit**

```bash
git add -A
git commit -m "feat: hero con reveal por líneas en CSS" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Paso 6: CHECKPOINT.** Levantar `portfolio-dev` (preview_start) y tomar capturas de `/` y `/en` a 1280px y 375px. Mostrárselas a Valentín junto con el copy en inglés de `en.ts` para que lo revise, y **esperar su aprobación**.

---

### Tarea 6: Sobre mí · Visual (disenador-ui) · CHECKPOINT

**Archivos:**
- Crear: `src/components/sections/About.astro`
- Modificar: `src/components/Home.astro`
- Test: `tests/sections.spec.ts`

**Interfaces:**
- Consume: `SiteContent['about']`.
- Produce:
  - `<section id="about" data-about>`.
  - Párrafos `[data-about-p]` con palabras `span.w`, que anima la Tarea 12.
  - El contenedor `.about__body`.

- [ ] **Paso 1: escribir los tests que fallan**

Agregar a `tests/sections.spec.ts`:
```ts
test.describe('sin JS', () => {
  test.use({ javaScriptEnabled: false });
  test('sobre mí legible completo, con espacios entre palabras', async ({ page }) => {
    await page.goto('/');
    const first = page.locator('[data-about-p]').first();
    await expect(first).toBeVisible();
    await expect(first).toHaveText(/^Soy desarrollador full-stack y trabajo con flujos/);
    await expect(page.locator('[data-about-p]')).toHaveCount(3);
  });
});
```

- [ ] **Paso 2: correr y verificar que falla**

Correr `npx playwright test tests/sections.spec.ts -g "sobre mí"`.
Esperado: FAIL.

- [ ] **Paso 3: implementar**

`src/components/sections/About.astro`:
```astro
---
import type { SiteContent } from '../../i18n/types';
interface Props {
  about: SiteContent['about'];
}
const { about } = Astro.props;
---

<section id="about" class="section container" aria-labelledby="about-title" tabindex="-1" data-about>
  <div class="grid">
    <h2 id="about-title" class="section__title about__title">{about.heading}</h2>
    <div class="about__body">
      {about.paragraphs.map((p) => (
        <p class="about__p" data-about-p>
          {p.split(' ').map((w) => (
            <>
              <span class="w">{w}</span>{' '}
            </>
          ))}
        </p>
      ))}
      <ul class="about__pillars mono">
        {about.pillars.map((pillar, i) => (
          <li><span aria-hidden="true">0{i + 1}</span>{pillar}</li>
        ))}
      </ul>
    </div>
  </div>
</section>

<style>
  .about__title { margin-bottom: 2rem; }
  .about__p {
    font-size: clamp(1.25rem, 1rem + 1.1vw, 2rem); line-height: 1.35; letter-spacing: -0.01em;
    max-width: 30ch; margin-bottom: 1.5rem;
  }
  .about__pillars {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px 24px;
    margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border);
    color: var(--text-2); text-transform: uppercase;
  }
  .about__pillars span { color: var(--accent); margin-right: 10px; }
  @media (min-width: 1024px) {
    .about__title { grid-column: 1 / 4; }
    .about__body { grid-column: 4 / 12; }
  }
</style>
```

En `Home.astro`, agregar `import About from './sections/About.astro';` y después de `<Hero>`, `<About about={c.about} />`.

- [ ] **Paso 4: correr y verificar que pasa**

Correr `npx playwright test tests/sections.spec.ts`.
Esperado: PASS.

- [ ] **Paso 5: commit**

```bash
git add -A
git commit -m "feat: sección Sobre mí con palabras partidas en build" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Paso 6: CHECKPOINT.** Mostrar capturas a 1280px y 375px y esperar la aprobación.

---

### Tarea 7: Stack · Simple (dev-junior) · CHECKPOINT

**Archivos:**
- Crear: `src/components/sections/Stack.astro`
- Modificar: `src/components/Home.astro`
- Test: `tests/sections.spec.ts`

**Interfaces:**
- Consume: `SiteContent['stack']`.
- Produce: `<section id="stack" data-stack>` con grupos `[data-stack-group]`, que anima la Tarea 12.

- [ ] **Paso 1: escribir el test que falla**

Agregar a `tests/sections.spec.ts`:
```ts
test('stack: 4 grupos con encabezado', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('[data-stack-group]')).toHaveCount(4);
  await expect(page.getByRole('heading', { level: 3, name: 'Tools & AI' })).toBeVisible();
});
```

- [ ] **Paso 2: correr y verificar que falla**

Correr `npx playwright test tests/sections.spec.ts -g "stack"`.
Esperado: FAIL.

- [ ] **Paso 3: implementar**

`src/components/sections/Stack.astro`:
```astro
---
import type { SiteContent } from '../../i18n/types';
interface Props {
  stack: SiteContent['stack'];
}
const { stack } = Astro.props;
---

<section id="stack" class="section container" aria-labelledby="stack-title" tabindex="-1" data-stack>
  <h2 id="stack-title" class="section__title">{stack.heading}</h2>
  <div class="stack__groups">
    {stack.groups.map((group) => (
      <div class="stack__group" data-stack-group>
        <h3 class="mono label">{group.name}</h3>
        <ul>
          {group.items.map((item) => <li>{item}</li>)}
        </ul>
      </div>
    ))}
  </div>
</section>

<style>
  .stack__groups { display: grid; gap: 40px 24px; margin-top: 3rem; }
  .stack__group { padding-top: 1.25rem; border-top: 1px solid var(--border); }
  .stack__group h3 { font-size: var(--fs-mono); font-weight: 500; letter-spacing: 0.02em; margin-bottom: 1rem; }
  .stack__group li { font-size: clamp(1.125rem, 1rem + 0.5vw, 1.375rem); line-height: 1.5; }
  @media (min-width: 640px) { .stack__groups { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1024px) { .stack__groups { grid-template-columns: repeat(4, 1fr); } }
</style>
```

En `Home.astro`, agregar `import Stack from './sections/Stack.astro';` y después de `<About>`, `<Stack stack={c.stack} />`.

- [ ] **Paso 4: correr y verificar que pasa**

Correr `npx playwright test tests/sections.spec.ts`.
Esperado: PASS.

- [ ] **Paso 5: commit**

```bash
git add -A
git commit -m "feat: sección Stack agrupada por área" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Paso 6: CHECKPOINT.** Mostrar capturas y **pedirle a Valentín que confirme la lista de tecnologías**. "JavaScript", "Git" y "Desarrollo asistido por IA" no figuran literal en CONTENT.md. Esperar su aprobación.

---

### Tarea 8: Proyectos, filas Focusly y PhotoFinder · Visual (disenador-ui)

**Archivos:**
- Crear: `src/components/SmartLink.astro`, `src/components/projects/Placeholder.astro`, `src/components/projects/ProjectMedia.astro`, `src/components/projects/ProjectRow.astro`, `src/components/sections/Projects.astro`
- Modificar: `src/components/Home.astro`
- Test: `tests/sections.spec.ts`

**Interfaces:**
- Consume: `SiteContent['projects']`, `Project`, `MaybeUrl`, `MaybeImg`, `Ratio`, `isTodo`.
- Produce:
  - `SmartLink`, con props `{ href: MaybeUrl; pendingText: string; class?: string }`.
  - `Placeholder`, con props `{ todo: string; text: string }`.
  - `ProjectMedia`, con props `{ image: MaybeImg; alt: string; ratio: Ratio; pendingText: string }`.
  - `ProjectRow`, con props `{ project: Project; labels: SiteContent['projects']['labels']; index: number; variant: 'a' | 'b' }`.
  - En el DOM: `[data-project-row]`, `[data-parallax]` y `[data-meta]`, que anima la Tarea 12. Más el comentario `<!-- LOTECITO -->` en `Projects.astro`, que reemplaza la Tarea 9.

- [ ] **Paso 1: escribir los tests que fallan** (Foco de revisión 4)

Agregar a `tests/sections.spec.ts`:
```ts
test('proyectos: filas Focusly y PhotoFinder en orden', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('[data-project-row] h3');
  await expect(rows).toHaveText(['Focusly', 'PhotoFinder']);
});

test('placeholders visibles y links pendientes no clickeables', async ({ page }) => {
  await page.goto('/');
  const row = page.locator('[data-project-row]').first();
  await expect(row.locator('[data-todo]').first()).toBeVisible();
  const pending = row.locator('.link--pending');
  await expect(pending).toHaveCount(2);
  await expect(pending.first()).toHaveAttribute('aria-disabled', 'true');
  await expect(row.locator('a.link--pending')).toHaveCount(0);
  await expect(row.getByText('Captura pendiente')).toBeVisible();
});
```

- [ ] **Paso 2: correr y verificar que fallan**

Correr `npx playwright test tests/sections.spec.ts -g "proyectos|placeholders"`.
Esperado: FAIL.

- [ ] **Paso 3: componentes compartidos**

`src/components/SmartLink.astro`:
```astro
---
import { isTodo } from '../content/placeholders';
import type { MaybeUrl } from '../i18n/types';
interface Props {
  href: MaybeUrl;
  pendingText: string;
  class?: string;
}
const { href, pendingText, class: cls } = Astro.props;
const external = !isTodo(href) && /^https?:/.test(href);
---

{isTodo(href) ? (
  <span class:list={['link--pending', cls]} aria-disabled="true" data-todo={href.label}>
    <slot /> <span class="mono">({pendingText})</span>
  </span>
) : (
  <a class={cls} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
    <slot />
  </a>
)}
```

`src/components/projects/Placeholder.astro`:
```astro
---
interface Props {
  todo: string;
  text: string;
}
const { todo, text } = Astro.props;
---

<div class="ph" role="img" aria-label={text} data-todo={todo}>
  <span class="mono">{text}</span>
</div>

<style>
  .ph {
    width: 100%; height: 100%; display: grid; place-items: center;
    background:
      repeating-linear-gradient(135deg, transparent 0 12px, var(--surface-2) 12px 13px),
      var(--surface);
    border: 1px dashed var(--border-ui); border-radius: var(--radius); color: var(--text-2);
  }
</style>
```

`src/components/projects/ProjectMedia.astro`:
```astro
---
import { Picture } from 'astro:assets';
import Placeholder from './Placeholder.astro';
import { isTodo } from '../../content/placeholders';
import type { MaybeImg, Ratio } from '../../i18n/types';
interface Props {
  image: MaybeImg;
  alt: string;
  ratio: Ratio;
  pendingText: string;
}
const { image, alt, ratio, pendingText } = Astro.props;
const sizes = ratio === '16/10' ? '(min-width: 1024px) 680px, 100vw' : '(min-width: 1024px) 320px, 70vw';
---

<div class:list={['media', { 'media--phone': ratio === '9/19.5' }]} style={`aspect-ratio:${ratio}`}>
  {isTodo(image) ? (
    <Placeholder todo={image.label} text={pendingText} />
  ) : (
    <Picture
      src={image}
      alt={alt}
      formats={['avif', 'webp']}
      widths={[480, 800, 1200]}
      sizes={sizes}
      loading="lazy"
      decoding="async"
    />
  )}
</div>

<style>
  .media { width: 100%; border-radius: var(--radius); overflow: hidden; }
  .media :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .media--phone { max-width: 300px; margin-inline: auto; }
</style>
```

- [ ] **Paso 4: fila de proyecto y sección**

`src/components/projects/ProjectRow.astro`:
```astro
---
import ProjectMedia from './ProjectMedia.astro';
import SmartLink from '../SmartLink.astro';
import type { Project, SiteContent } from '../../i18n/types';
interface Props {
  project: Project;
  labels: SiteContent['projects']['labels'];
  index: number;
  variant: 'a' | 'b';
}
const { project, labels, index, variant } = Astro.props;
---

<article class:list={['row', 'grid', `row--${variant}`]} aria-labelledby={`${project.id}-title`} data-project-row>
  <div class="row__media" data-parallax>
    <ProjectMedia image={project.image} alt={project.imageAlt} ratio={project.imageRatio} pendingText={labels.imagePending} />
  </div>
  <div class="row__body" data-meta>
    <p class="mono row__index"><span aria-hidden="true">0{index} · </span>{project.status}</p>
    <h3 id={`${project.id}-title`} class="row__title">{project.name}</h3>
    <p class="row__summary">{project.summary}</p>
    <ul class="row__points">
      {project.points.map((point) => <li>{point}</li>)}
    </ul>
    <ul class="tags mono" aria-label={labels.stack}>
      {project.stack.map((tech) => <li>{tech}</li>)}
    </ul>
    <div class="row__links">
      <SmartLink href={project.repo} pendingText={labels.linkPending}>{labels.repo}</SmartLink>
      <SmartLink href={project.demo} pendingText={labels.linkPending}>{labels.demo}</SmartLink>
    </div>
  </div>
</article>

<style>
  .row { row-gap: 2rem; align-items: center; padding-block: clamp(4rem, 8vw, 7rem); border-top: 1px solid var(--border); }
  .row__index { color: var(--accent); margin-bottom: 0.75rem; }
  .row__title { font-size: var(--fs-h2); margin-bottom: 1rem; }
  .row__summary { color: var(--text-2); max-width: 52ch; margin-bottom: 1.25rem; }
  .row__points { display: grid; gap: 6px; margin-bottom: 1.5rem; }
  .row__points li::before { content: '/ '; color: var(--accent); font-family: var(--font-mono); }
  .row__links { display: flex; flex-wrap: wrap; gap: 8px 24px; margin-top: 1.5rem; }
  .row__links a { min-height: 44px; display: inline-flex; align-items: center; }
  @media (min-width: 1024px) {
    .row--a .row__media { grid-column: 1 / 8; }
    .row--a .row__body { grid-column: 9 / 13; }
    .row--b .row__body { grid-column: 1 / 7; grid-row: 1; }
    .row--b .row__media { grid-column: 8 / 12; grid-row: 1; }
  }
</style>
```

`src/components/sections/Projects.astro`:
```astro
---
import ProjectRow from '../projects/ProjectRow.astro';
import type { SiteContent } from '../../i18n/types';
interface Props {
  projects: SiteContent['projects'];
}
const { projects } = Astro.props;
---

<section id="projects" class="section projects" aria-labelledby="projects-title" tabindex="-1">
  <div class="container">
    <p class="mono eyebrow">{projects.eyebrow}</p>
    <h2 id="projects-title" class="section__title">{projects.heading}</h2>
  </div>
  <!-- LOTECITO -->
  <div class="container">
    {projects.others.map((project, i) => (
      <ProjectRow project={project} labels={projects.labels} index={i + 2} variant={i === 0 ? 'a' : 'b'} />
    ))}
  </div>
</section>
```

En `Home.astro`, agregar `import Projects from './sections/Projects.astro';` y después de `<Stack>`, `<Projects projects={c.projects} />`.

- [ ] **Paso 5: correr y verificar que pasa**

Correr `npx playwright test tests/sections.spec.ts` y `npm run check`.
Esperado: PASS.

- [ ] **Paso 6: commit**

```bash
git add -A
git commit -m "feat: filas de proyecto con placeholders y links pendientes accesibles" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Tarea 9: Lotecito, markup estático · Visual (disenador-ui) · CHECKPOINT

**Archivos:**
- Crear: `src/components/projects/LotecitoPinned.astro`
- Modificar: `src/components/sections/Projects.astro` (reemplazar `<!-- LOTECITO -->`)
- Test: `tests/sections.spec.ts`

**Interfaces:**
- Consume: `FeaturedProject`, `SmartLink`, `ProjectMedia`.
- Produce, en el DOM, lo que usa la Tarea 13:
  - `[data-lotecito]` (el article) y `[data-lotecito-pin]` (el bloque que se pinea).
  - `[data-step]`, con `data-status`.
  - `[data-signal]`, con `data-level="1..4"`.
  - `[data-signal-label]` y `[data-decisions]`.
- Estado sin JS: los 4 pasos con el mismo peso, `data-level="4"` y la etiqueta en el último status.
- La clase `.is-pinned` la agrega la Tarea 13 y activa el resaltado de `[data-active]`.

- [ ] **Paso 1: escribir el test que falla**

Agregar dentro del `test.describe('sin JS', ...)` de `tests/sections.spec.ts`:
```ts
  test('lotecito: narrativa completa legible sin JS', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-step]')).toHaveCount(4);
    for (const step of await page.locator('[data-step]').all()) await expect(step).toBeVisible();
    await expect(page.locator('[data-signal]')).toHaveAttribute('data-level', '4');
    await expect(page.locator('[data-signal-label]')).toHaveText('Sincronizado');
    await expect(page.locator('[data-decisions] li')).toHaveCount(6);
    await expect(page.getByText('24 migraciones de base de datos')).toBeVisible();
  });
```

- [ ] **Paso 2: correr y verificar que falla**

Correr `npx playwright test tests/sections.spec.ts -g "lotecito"`.
Esperado: FAIL.

- [ ] **Paso 3: implementar**

`src/components/projects/LotecitoPinned.astro`:
```astro
---
import ProjectMedia from './ProjectMedia.astro';
import SmartLink from '../SmartLink.astro';
import type { FeaturedProject, SiteContent } from '../../i18n/types';
interface Props {
  project: FeaturedProject;
  labels: SiteContent['projects']['labels'];
}
const { project, labels } = Astro.props;
const last = project.steps[project.steps.length - 1];
---

<article id="lotecito" class="lotecito" aria-labelledby="lotecito-title" data-lotecito>
  <div class="lotecito__pin container" data-lotecito-pin>
    <div class="lotecito__grid grid">
      <header class="lotecito__head">
        <p class="mono lotecito__status"><span class="dot" aria-hidden="true"></span>01 · {project.status}</p>
        <h3 id="lotecito-title" class="lotecito__title">{project.name}</h3>
        <p class="lotecito__summary">{project.summary}</p>
        <p class="mono label">{labels.problem}</p>
        <p class="lotecito__problem">{project.problem}</p>
      </header>
      <div class="lotecito__story">
        <div class="signal" aria-hidden="true" data-signal data-level={project.steps.length}>
          <span class="signal__bars"><span></span><span></span><span></span><span></span></span>
          <span class="mono signal__label" data-signal-label>{last.status}</span>
        </div>
        <ol class="steps">
          {project.steps.map((step, i) => (
            <li class="step" data-step data-status={step.status}>
              <span class="mono step__n" aria-hidden="true">0{i + 1}</span>
              <div>
                <p class="step__title"><span class="mono step__status">{step.status}</span> {step.title}</p>
                <p class="step__body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </div>

  <div class="lotecito__details container grid">
    <div class="lotecito__media">
      <ProjectMedia image={project.image} alt={project.imageAlt} ratio={project.imageRatio} pendingText={labels.imagePending} />
    </div>
    <div class="lotecito__info">
      <p class="mono label">{labels.decisions}</p>
      <ul class="decisions" data-decisions>
        {project.decisions.map((d) => <li>{d}</li>)}
      </ul>
      <ul class="facts mono">
        {project.facts.map((f) => <li>{f}</li>)}
      </ul>
      <ul class="tags mono" aria-label={labels.stack}>
        {project.stack.map((tech) => <li>{tech}</li>)}
      </ul>
      <div class="lotecito__links">
        <SmartLink href={project.repo} pendingText={labels.linkPending}>{labels.repo}</SmartLink>
        <SmartLink href={project.demo} pendingText={labels.linkPending}>{labels.demo}</SmartLink>
      </div>
    </div>
  </div>
</article>

<style>
  .lotecito { padding-block: clamp(3rem, 6vw, 5rem); }
  .lotecito__grid { row-gap: 2.5rem; align-items: start; }
  .lotecito__status { display: flex; align-items: center; gap: 10px; color: var(--accent); margin-bottom: 0.75rem; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 12px var(--accent); }
  .lotecito__title { font-size: var(--fs-h2); margin-bottom: 1rem; }
  .lotecito__summary { color: var(--text-2); max-width: 52ch; margin-bottom: 1.5rem; }
  .lotecito__problem { max-width: 48ch; margin-top: 0.5rem; }

  .signal { display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; }
  .signal__bars { display: inline-flex; align-items: flex-end; gap: 3px; height: 18px; }
  .signal__bars span { width: 4px; background: var(--border-ui); border-radius: 1px; transition: background-color 0.3s; }
  .signal__bars span:nth-child(1) { height: 25%; }
  .signal__bars span:nth-child(2) { height: 50%; }
  .signal__bars span:nth-child(3) { height: 75%; }
  .signal__bars span:nth-child(4) { height: 100%; }
  .signal[data-level='1'] span:nth-child(-n + 1),
  .signal[data-level='2'] span:nth-child(-n + 2),
  .signal[data-level='3'] span:nth-child(-n + 3),
  .signal[data-level='4'] span:nth-child(-n + 4) { background: var(--accent); }
  .signal__label { color: var(--accent); text-transform: uppercase; }

  .steps { display: grid; gap: 1.25rem; }
  .step { display: grid; grid-template-columns: 2.5rem 1fr; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--border); transition: color 0.3s; }
  .step__n { color: var(--accent); padding-top: 0.2em; }
  .step__title { font-weight: 600; }
  .step__status { color: var(--text-2); text-transform: uppercase; margin-right: 6px; }
  .step__body { color: var(--text-2); }

  /* Activado por motion/lotecito.ts solo en desktop */
  .lotecito.is-pinned .lotecito__pin { min-height: 100vh; display: grid; align-content: center; padding-top: var(--nav-h); }
  .lotecito.is-pinned .step,
  .lotecito.is-pinned .step .step__body,
  .lotecito.is-pinned .step .step__status { color: var(--text-3); }
  .lotecito.is-pinned .step[data-active] { color: var(--text); border-top-color: var(--accent); }
  .lotecito.is-pinned .step[data-active] .step__body { color: var(--text-2); }

  .lotecito__details { row-gap: 2rem; margin-top: clamp(3rem, 6vw, 5rem); align-items: start; }
  .decisions { display: grid; gap: 10px; margin: 0.75rem 0 1.5rem; }
  .decisions li::before { content: '/ '; color: var(--accent); font-family: var(--font-mono); }
  .facts { display: flex; flex-wrap: wrap; gap: 8px 20px; color: var(--accent); margin-bottom: 1rem; }
  .lotecito__links { display: flex; flex-wrap: wrap; gap: 8px 24px; margin-top: 1.5rem; }
  .lotecito__links a { min-height: 44px; display: inline-flex; align-items: center; }

  @media (min-width: 1024px) {
    .lotecito__head { grid-column: 1 / 6; }
    .lotecito__story { grid-column: 7 / 13; }
    .lotecito__media { grid-column: 1 / 8; }
    .lotecito__info { grid-column: 9 / 13; }
  }
</style>
```

En `src/components/sections/Projects.astro`, agregar `import LotecitoPinned from '../projects/LotecitoPinned.astro';` y reemplazar `<!-- LOTECITO -->` por:
```astro
  <LotecitoPinned project={projects.lotecito} labels={projects.labels} />
```

- [ ] **Paso 4: correr y verificar que pasa**

Correr `npx playwright test tests/sections.spec.ts` y `npm run check`.
Esperado: PASS.

- [ ] **Paso 5: commit**

```bash
git add -A
git commit -m "feat: Lotecito con narrativa offline-first legible sin JS" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Paso 6: CHECKPOINT.** Mostrar capturas de toda la sección Proyectos a 1280px y 375px y esperar la aprobación.

---

### Tarea 10: Contacto + footer · Simple (dev-junior) · CHECKPOINT

**Archivos:**
- Crear: `src/components/sections/Contact.astro`
- Modificar: `src/components/Home.astro`
- Test: `tests/sections.spec.ts`

**Interfaces:**
- Consume: `SiteContent['contact']`, `SiteContent['footer']`, `SmartLink`.
- Produce, para la Tarea 12: `[data-contact]` y `[data-contact-link]` (cada `li`), y `[data-magnet]` (el label interno).

- [ ] **Paso 1: escribir los tests que fallan** (Foco de revisión 5)

Agregar a `tests/sections.spec.ts`:
```ts
test('contacto: 4 canales, pendientes marcados', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-contact-link]')).toHaveCount(4);
  await expect(page.locator('[data-contact] [aria-disabled="true"]')).toHaveCount(4);
});

for (const path of ['/', '/en']) {
  test.describe(`320px ${path}`, () => {
    test.use({ viewport: { width: 320, height: 640 } });
    test(`sin scroll horizontal en ${path}`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}

test.describe('mobile tap targets', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  test('cada canal de contacto mide al menos 56px de alto', async ({ page }) => {
    await page.goto('/');
    for (const item of await page.locator('[data-contact-link]').all()) {
      const box = await item.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(56);
    }
  });
});
```

- [ ] **Paso 2: correr y verificar que fallan**

Correr `npx playwright test tests/sections.spec.ts -g "contacto|320px|tap"`.
Esperado: FAIL en contacto y en tap targets. El de 320px puede pasar o no; tiene que terminar pasando.

- [ ] **Paso 3: implementar**

`src/components/sections/Contact.astro`:
```astro
---
import SmartLink from '../SmartLink.astro';
import type { SiteContent } from '../../i18n/types';
interface Props {
  contact: SiteContent['contact'];
  pendingText: string;
}
const { contact, pendingText } = Astro.props;
---

<section id="contact" class="section container" aria-labelledby="contact-title" tabindex="-1" data-contact>
  <h2 id="contact-title" class="section__title">{contact.heading}</h2>
  <p class="contact__intro">{contact.intro}</p>
  <ul class="contact__list">
    {contact.links.map((link) => (
      <li data-contact-link>
        <SmartLink href={link.href} pendingText={pendingText} class="contact__link">
          <span class="contact__label" data-magnet>{link.label}</span>
          <span class="contact__arrow" aria-hidden="true">↗</span>
        </SmartLink>
      </li>
    ))}
  </ul>
</section>

<style>
  .contact__intro { color: var(--text-2); max-width: 48ch; margin: 1rem 0 3rem; }
  .contact__list { border-top: 1px solid var(--border); }
  .contact__list li { border-bottom: 1px solid var(--border); }
  .contact__list :global(.contact__link) {
    position: relative; display: flex; align-items: center; justify-content: space-between; gap: 16px;
    min-height: 56px; padding-block: clamp(0.75rem, 2vw, 1.5rem);
    font-size: clamp(1.5rem, 1rem + 3vw, 3rem); font-weight: 600; letter-spacing: -0.03em;
    text-decoration: none; overflow-wrap: anywhere;
  }
  .contact__list :global(.contact__link .mono) { font-size: var(--fs-mono); font-weight: 400; letter-spacing: 0.02em; }
  .contact__label { display: inline-block; }
  .contact__arrow { color: var(--accent); transition: transform 0.3s var(--ease-out); }
  .contact__list :global(a.contact__link)::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px;
    background: var(--accent); transform: scaleX(0); transform-origin: left;
    transition: transform 0.5s var(--ease-out);
  }
  .contact__list :global(a.contact__link:hover)::after,
  .contact__list :global(a.contact__link:focus-visible)::after { transform: scaleX(1); }
  .contact__list :global(a.contact__link:hover) .contact__arrow { transform: translate(4px, -4px); }
</style>
```

En `Home.astro`, agregar `import Contact from './sections/Contact.astro';`, después de `<Projects>` agregar `<Contact contact={c.contact} pendingText={c.projects.labels.linkPending} />`, y después de `</main>`:
```astro
  <footer class="footer container"><p class="mono">{c.footer.note}</p></footer>
```
Más este estilo al final de `Home.astro`:
```astro
<style>
  .footer { padding-block: 3rem; color: var(--text-3); border-top: 1px solid var(--border); }
</style>
```

- [ ] **Paso 4: correr toda la suite**

Correr `npm test` y `npm run check`.
Esperado: todo PASS. Si falla el de 320px, corregir el elemento que desborda (inspeccionar con `scrollWidth` por sección) antes de seguir.

- [ ] **Paso 5: commit**

```bash
git add -A
git commit -m "feat: contacto con canales pendientes marcados y footer" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Paso 6: CHECKPOINT.** Mostrar la página completa (estática, sin animaciones de scroll todavía) a 1280px y 375px, en ES y EN. Esperar la aprobación antes de pasar a la parte de motion.

---

### Tarea 11: motion core, init, Lenis y progreso · Compleja (sesión principal)

**Archivos:**
- Crear: `src/components/Motion.astro`, `src/scripts/motion/types.ts`, `src/scripts/motion/index.ts`, `src/scripts/motion/lenis.ts`, `src/scripts/motion/progress.ts`
- Modificar: `src/layouts/Base.astro` (montar `<Motion />`)
- Test: `tests/motion.spec.ts`

**Interfaces:**
- Consume: `[data-progress]` y las anclas `#...` con `tabindex="-1"`.
- Produce:
  - `MotionModule = (gsap: Gsap, ScrollTrigger: ScrollTriggerT, ctx: MotionCtx) => void | (() => void)` y `MotionCtx = { desktop: boolean }`.
  - El array `modules` en `index.ts`, al que las Tareas 12 y 13 agregan sus módulos.
  - `document.documentElement.dataset.motion`, que vale `'off' | 'desktop' | 'mobile'` y lo usan los tests.

- [ ] **Paso 1: escribir los tests que fallan** (Foco de revisión 3)

`tests/motion.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

const mobile = { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true };

test('desktop: motion activo y barra de progreso llega al final', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect
    .poll(() =>
      page.locator('[data-progress]').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a),
    )
    .toBeGreaterThan(0.95);
});

test('desktop: ancla del nav lleva a la sección y le da foco', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await page.locator('.nav__links').getByRole('link', { name: /Contacto/ }).click();
  await expect(page.locator('#contact')).toBeFocused({ timeout: 5000 });
  const top = await page.locator('#contact').evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(0);
  expect(top).toBeLessThan(200);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('no carga motion ni pinea nada', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
  });
});

test.describe('mobile', () => {
  test.use(mobile);
  test('motion en modo mobile, sin Lenis', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'mobile');
    await expect(page.locator('html.lenis')).toHaveCount(0);
  });
});
```

- [ ] **Paso 2: correr y verificar que fallan**

Correr `npx playwright test tests/motion.spec.ts`.
Esperado: FAIL, porque no existe `data-motion`.

- [ ] **Paso 3: tipos y módulos**

`src/scripts/motion/types.ts`:
```ts
import type { gsap } from 'gsap';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';

export type Gsap = typeof gsap;
export type ScrollTriggerT = typeof ScrollTrigger;
export interface MotionCtx {
  desktop: boolean;
}
export type MotionModule = (gsap: Gsap, st: ScrollTriggerT, ctx: MotionCtx) => void | (() => void);
```

`src/scripts/motion/progress.ts`:
```ts
import type { MotionModule } from './types';

export const progress: MotionModule = (gsap) => {
  const bar = document.querySelector('[data-progress]');
  if (!bar) return;
  gsap.fromTo(
    bar,
    { scaleX: 0 },
    { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } },
  );
};
```

`src/scripts/motion/lenis.ts`:
```ts
import type { Gsap, ScrollTriggerT } from './types';

/** Scroll suave solo en desktop. Devuelve cleanup síncrono aunque Lenis cargue async. */
export function initLenis(gsap: Gsap, ScrollTrigger: ScrollTriggerT): () => void {
  let disposed = false;
  let cleanup = () => {};

  import('lenis').then(({ default: Lenis }) => {
    if (disposed) return;
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a || a.hash.length < 2) return;
      const target = document.querySelector<HTMLElement>(a.hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, {
        offset: a.hash === '#top' ? 0 : -64,
        onComplete: () => target.focus({ preventScroll: true }),
      });
      history.pushState(null, '', a.hash);
    };
    document.addEventListener('click', onClick);

    cleanup = () => {
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  });

  return () => {
    disposed = true;
    cleanup();
  };
}
```

`src/scripts/motion/index.ts`:
```ts
import { initLenis } from './lenis';
import { progress } from './progress';
import type { MotionModule } from './types';

// Las tareas 12 y 13 agregan sus módulos acá.
const modules: MotionModule[] = [progress];

const root = document.documentElement;

const whenIdle = (cb: () => void) =>
  'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 200);

async function start() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const mm = gsap.matchMedia();
  mm.add(
    {
      desktop: '(min-width: 900px) and (pointer: fine)',
      mobile: '(max-width: 899px), (pointer: coarse), (pointer: none)',
      reduce: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const { desktop, reduce } = context.conditions as Record<string, boolean>;
      if (reduce) {
        root.dataset.motion = 'off';
        return;
      }
      root.dataset.motion = desktop ? 'desktop' : 'mobile';
      const cleanups: Array<() => void> = [];
      if (desktop) cleanups.push(initLenis(gsap, ScrollTrigger));
      for (const init of modules) {
        const off = init(gsap, ScrollTrigger, { desktop });
        if (off) cleanups.push(off);
      }
      return () => cleanups.forEach((off) => off());
    },
  );

  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  root.dataset.motion = 'off';
} else {
  whenIdle(() => void start());
}
```

`src/components/Motion.astro`:
```astro
<script>
  import '../scripts/motion/index';
</script>
```

En `src/layouts/Base.astro`, agregar `import Motion from '../components/Motion.astro';` y poner `<Motion />` justo antes de `</body>`.

- [ ] **Paso 4: correr y verificar que pasa**

Correr `npx playwright test tests/motion.spec.ts` y después `npm test` y `npm run check`.
Esperado: todo PASS.

- [ ] **Paso 5: verificar que GSAP no está en el bundle inicial**

Correr `npm run build` y después `grep -l "ScrollTrigger" dist/_astro/*.js`.
Esperado: aparece en chunks separados y no en el chunk de `Motion` (que pesa menos de 3 KB).

- [ ] **Paso 6: commit**

```bash
git add -A
git commit -m "feat: init de motion con import diferido, matchMedia, Lenis y barra de progreso" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Tarea 12: motion de secciones, about, stack, proyectos y contacto · Compleja (sesión principal)

**Archivos:**
- Crear: `src/scripts/motion/about.ts`, `src/scripts/motion/stack.ts`, `src/scripts/motion/projects.ts`, `src/scripts/motion/contact.ts`
- Modificar: `src/scripts/motion/index.ts` (array `modules`)
- Test: `tests/motion.spec.ts`

**Interfaces:**
- Consume: `MotionModule` y los `data-*` de las Tareas 6, 7, 8, 9 y 10.
- Produce: los módulos `about`, `stack`, `projects` y `contact`.

- [ ] **Paso 1: escribir los tests que fallan**

Agregar a `tests/motion.spec.ts`:
```ts
test('desktop: sobre mí termina con todas las palabras en color texto', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await page.locator('#stack').scrollIntoViewIfNeeded();
  await expect
    .poll(() => page.locator('[data-about] .w').last().evaluate((el) => getComputedStyle(el).color))
    .toBe('rgb(232, 234, 230)');
});

test('desktop: parallax aplicado a la captura de Focusly', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  const media = page.locator('[data-project-row] [data-parallax]').first();
  await media.scrollIntoViewIfNeeded();
  await expect.poll(() => media.evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
});

test.describe('mobile sin parallax', () => {
  test.use(mobile);
  test('captura sin transform', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'mobile');
    const media = page.locator('[data-project-row] [data-parallax]').first();
    await media.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    expect(await media.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
  });
});
```

- [ ] **Paso 2: correr y verificar que fallan**

Correr `npx playwright test tests/motion.spec.ts -g "sobre mí|parallax"`.
Esperado: FAIL en el de parallax desktop. El de "sobre mí" puede pasar trivialmente porque todavía no hay animación; queda como guarda de regresión del estado final.

- [ ] **Paso 3: implementar los módulos**

`src/scripts/motion/about.ts`:
```ts
import type { MotionModule } from './types';

// Excepción documentada: anima `color` (no transform/opacity) en ~100 spans de texto. Piso de color = --text-3 (AA).
export const about: MotionModule = (gsap, _st, { desktop }) => {
  const section = document.querySelector<HTMLElement>('[data-about]');
  if (!section) return;
  if (desktop) {
    gsap.from(section.querySelectorAll('.w'), {
      color: '#7a837d',
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: { trigger: section.querySelector('.about__body'), start: 'top 75%', end: 'bottom 55%', scrub: true },
    });
    return;
  }
  section.querySelectorAll('[data-about-p]').forEach((p) =>
    gsap.from(p, {
      opacity: 0,
      y: 16,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: p, start: 'top 85%', once: true },
    }),
  );
};
```

`src/scripts/motion/stack.ts`:
```ts
import type { MotionModule } from './types';

export const stack: MotionModule = (gsap, _st, { desktop }) => {
  const section = document.querySelector('[data-stack]');
  if (!section) return;
  gsap.from(section.querySelectorAll('[data-stack-group]'), {
    opacity: 0,
    y: desktop ? 24 : 0,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power2.out',
    scrollTrigger: { trigger: section, start: 'top 75%', once: true },
  });
};
```

`src/scripts/motion/projects.ts`:
```ts
import type { MotionModule } from './types';

export const projects: MotionModule = (gsap, _st, { desktop }) => {
  document.querySelectorAll<HTMLElement>('[data-project-row]').forEach((row) => {
    const media = row.querySelector('[data-parallax]');
    const meta = row.querySelector('[data-meta]');
    if (desktop && media) {
      gsap.fromTo(
        media,
        { y: 20 },
        { y: -20, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    }
    if (meta) {
      gsap.from(meta.children, {
        opacity: 0,
        y: desktop ? 16 : 0,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: { trigger: meta, start: 'top 80%', once: true },
      });
    }
  });
};
```

`src/scripts/motion/contact.ts`:
```ts
import type { MotionModule } from './types';

export const contact: MotionModule = (gsap, _st, { desktop }) => {
  const section = document.querySelector('[data-contact]');
  if (!section) return;
  const items = Array.from(section.querySelectorAll<HTMLElement>('[data-contact-link]'));
  gsap.from(items, {
    opacity: 0,
    y: desktop ? 24 : 0,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power2.out',
    scrollTrigger: { trigger: section, start: 'top 75%', once: true },
  });
  if (!desktop) return;

  // Hover magnético leve sobre el label (no sobre el li, que ya anima `y` al entrar).
  const offs = items.map((item) => {
    const label = item.querySelector<HTMLElement>('[data-magnet]');
    if (!label) return () => {};
    const xTo = gsap.quickTo(label, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(label, 'y', { duration: 0.4, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const r = label.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.15);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    item.addEventListener('pointermove', move);
    item.addEventListener('pointerleave', leave);
    return () => {
      item.removeEventListener('pointermove', move);
      item.removeEventListener('pointerleave', leave);
    };
  });
  return () => offs.forEach((off) => off());
};
```

En `src/scripts/motion/index.ts`, reemplazar el import y el array:
```ts
import { about } from './about';
import { contact } from './contact';
import { initLenis } from './lenis';
import { progress } from './progress';
import { projects } from './projects';
import { stack } from './stack';
import type { MotionModule } from './types';

// La tarea 13 agrega `lotecito` acá.
const modules: MotionModule[] = [progress, about, stack, projects, contact];
```

- [ ] **Paso 4: correr y verificar que pasa**

Correr `npm test` y `npm run check`.
Esperado: todo PASS.

- [ ] **Paso 5: commit**

```bash
git add -A
git commit -m "feat: animaciones de scroll por sección con degradación mobile" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Tarea 13: motion de Lotecito, pin y narrativa · Compleja (sesión principal) · CHECKPOINT

**Archivos:**
- Crear: `src/scripts/motion/lotecito.ts`
- Modificar: `src/scripts/motion/index.ts`
- Test: `tests/motion.spec.ts`

**Interfaces:**
- Consume: `[data-lotecito]`, `[data-lotecito-pin]`, `[data-step][data-status]`, `[data-signal]`, `[data-signal-label]`, `[data-decisions]` y la clase `.is-pinned` (Tarea 9).
- Produce: el módulo `lotecito`.

- [ ] **Paso 1: escribir los tests que fallan** (Foco de revisión 1 y 2)

Agregar a `tests/motion.spec.ts`:
```ts
async function scrollIntoPin(page: import('@playwright/test').Page, fraction: number) {
  await page.evaluate((f) => {
    const spacer = document.querySelector('[data-lotecito-pin]')!.parentElement!; // .pin-spacer
    const top = spacer.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + window.innerHeight * 1.5 * f);
  }, fraction);
}

test('desktop: el pin avanza la narrativa de Lotecito', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await page.locator('#lotecito').scrollIntoViewIfNeeded();
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  await scrollIntoPin(page, 0.05);
  await expect(page.locator('[data-signal-label]')).toHaveText('Sin señal');
  await expect(page.locator('[data-signal]')).toHaveAttribute('data-level', '1');
  await scrollIntoPin(page, 0.6);
  await expect(page.locator('[data-signal-label]')).toHaveText('Sincronizando');
  await expect(page.locator('[data-step][data-active]')).toHaveCount(1);
});

test.describe('desktop 1280x800 en inglés', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test('el bloque pineado entra en el viewport', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
    await page.locator('#lotecito').scrollIntoViewIfNeeded();
    await expect(page.locator('.lotecito.is-pinned')).toHaveCount(1);
    const h = await page.locator('[data-lotecito-pin]').evaluate((el) => el.scrollHeight);
    expect(h).toBeLessThanOrEqual(800);
  });
});

test('pasar de desktop a mobile revierte el pin', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'desktop');
  await page.locator('#lotecito').scrollIntoViewIfNeeded();
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'mobile');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('.lotecito.is-pinned')).toHaveCount(0);
  await expect(page.locator('[data-signal-label]')).toHaveText('Sincronizado');
});

test.describe('mobile Lotecito', () => {
  test.use(mobile);
  test('sin pin y con los 4 pasos visibles', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'mobile');
    await page.locator('#lotecito').scrollIntoViewIfNeeded();
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    for (const step of await page.locator('[data-step]').all()) {
      await step.scrollIntoViewIfNeeded();
      await expect(step).toBeVisible();
    }
  });
});
```

Nota: `page.setViewportSize` cambia el ancho, pero el `pointer` sigue siendo `fine`. Igual entra en mobile porque `(max-width: 899px)` matchea.

- [ ] **Paso 2: correr y verificar que fallan**

Correr `npx playwright test tests/motion.spec.ts -g "pin|Lotecito|1280"`.
Esperado: FAIL, porque no hay `.pin-spacer`.

- [ ] **Paso 3: implementar**

`src/scripts/motion/lotecito.ts`:
```ts
import type { MotionModule } from './types';

export const lotecito: MotionModule = (gsap, ScrollTrigger, { desktop }) => {
  const section = document.querySelector<HTMLElement>('[data-lotecito]');
  const pin = section?.querySelector<HTMLElement>('[data-lotecito-pin]');
  const signal = section?.querySelector<HTMLElement>('[data-signal]');
  const label = section?.querySelector<HTMLElement>('[data-signal-label]');
  if (!section || !pin || !signal || !label) return;
  const steps = Array.from(section.querySelectorAll<HTMLElement>('[data-step]'));
  const decisions = section.querySelectorAll('[data-decisions] li');

  gsap.from(decisions, {
    opacity: 0,
    y: desktop ? 16 : 0,
    duration: 0.5,
    stagger: 0.06,
    ease: 'power2.out',
    scrollTrigger: { trigger: '[data-decisions]', start: 'top 80%', once: true },
  });

  if (!desktop) {
    steps.forEach((step) =>
      gsap.from(step, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: step, start: 'top 85%', once: true },
      }),
    );
    return;
  }

  let current = -1;
  const setActive = (i: number) => {
    if (i === current) return;
    current = i;
    steps.forEach((s, j) => s.toggleAttribute('data-active', j === i));
    signal.dataset.level = String(i + 1);
    label.textContent = steps[i].dataset.status ?? '';
  };

  section.classList.add('is-pinned');
  setActive(0);
  const trigger = ScrollTrigger.create({
    trigger: pin,
    start: 'top top',
    end: '+=150%',
    pin: true,
    onUpdate: (self) => setActive(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))),
  });

  return () => {
    trigger.kill();
    section.classList.remove('is-pinned');
    steps.forEach((s) => s.removeAttribute('data-active'));
    signal.dataset.level = String(steps.length);
    label.textContent = steps[steps.length - 1].dataset.status ?? '';
  };
};
```

En `src/scripts/motion/index.ts`, agregar `import { lotecito } from './lotecito';` y dejar el array así:
```ts
const modules: MotionModule[] = [progress, about, stack, lotecito, projects, contact];
```
`lotecito` va antes de `projects` porque el pin agrega altura y los triggers que vienen después tienen que calcularse con ella.

- [ ] **Paso 4: correr y verificar que pasa**

Correr `npm test` y `npm run check`.
Esperado: todo PASS. Si falla el test de 1280×800 en inglés, ajustar el CSS de `.is-pinned` en `LotecitoPinned.astro` (achicar `.lotecito__summary` o los gaps de `.steps`), sin sacar contenido.

- [ ] **Paso 5: commit**

```bash
git add -A
git commit -m "feat: pin narrativo de Lotecito (sin señal a sincronizado) solo en desktop" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Paso 6: CHECKPOINT.** Grabar o mostrar el scroll completo en desktop (capturas en 4 puntos del pin) y en mobile. Esperar la aprobación de las animaciones.

---

### Tarea 14: deploy, vercel.json, robots, favicon y OG · Simple (dev-junior) + agente seguridad

**Archivos:**
- Crear: `vercel.json`, `public/robots.txt`, `public/favicon.svg`, `scripts/og.mjs`, `public/og-es.png`, `public/og-en.png` (generadas)
- Test: `tests/i18n.spec.ts`

- [ ] **Paso 1: escribir los tests que fallan**

Agregar a `tests/i18n.spec.ts`:
```ts
test('sitemap con ambas rutas, robots y OG', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  expect(sitemap).toContain('https://valentinlanus.vercel.app/en');
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Sitemap: https://valentinlanus.vercel.app/sitemap-index.xml');
  for (const og of ['/og-es.png', '/og-en.png', '/favicon.svg']) {
    expect((await request.get(og)).status()).toBe(200);
  }
});
```

- [ ] **Paso 2: correr y verificar que falla**

Correr `npx playwright test tests/i18n.spec.ts -g "sitemap"`.
Esperado: FAIL en robots y OG.

- [ ] **Paso 3: archivos estáticos**

`public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://valentinlanus.vercel.app/sitemap-index.xml
```

`public/favicon.svg` (el punto "señal" del concepto):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#0b0d0c"/><circle cx="16" cy="16" r="6" fill="#8fd694"/></svg>
```

`scripts/og.mjs` (genera las imágenes OG con el Chromium de Playwright, sin servicios externos):
```js
import { chromium } from '@playwright/test';

const variants = {
  es: { role: 'Software Developer & AI Engineer', line: 'Productos web y mobile de punta a punta.' },
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
```

Correr `node scripts/og.mjs`.
Esperado: `OG generadas en public/`. Abrir las dos imágenes para verificarlas a ojo.

- [ ] **Paso 4: headers en `vercel.json`**

Correr `npm run build`. Después correr `grep -o "<script[^>]*>[^<]*</script>" dist/index.html` para listar los scripts inline. Por cada uno que no sea `application/ld+json`, calcular el hash con:
```bash
node -e "const c=require('crypto');console.log('sha256-'+c.createHash('sha256').update(process.argv[1]).digest('base64'))" "document.documentElement.classList.add('js');"
```
(pasar el contenido exacto entre las etiquetas). Los hashes van en `script-src`.

`vercel.json` (reemplazar `HASH_JS_CLASS` por el valor calculado, y sumar los demás si hay):
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        {
          "key": "Content-Security-Policy-Report-Only",
          "value": "default-src 'self'; script-src 'self' 'HASH_JS_CLASS'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'; object-src 'none'"
        }
      ]
    },
    {
      "source": "/_astro/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

- [ ] **Paso 5: correr y verificar que pasa**

Correr `npm test`.
Esperado: todo PASS.

- [ ] **Paso 6: revisión de seguridad (obligatoria según CLAUDE.md: toca dependencias y deploy)**

Correr `npm audit --omit=dev` y despachar al agente `seguridad` con este pedido: "Revisá `package.json`, `package-lock.json`, `vercel.json`, `astro.config.mjs` y los `target=_blank` de `src/components/SmartLink.astro`. Reportá hallazgos por severidad."
Los críticos y altos se corrigen antes de seguir.

- [ ] **Paso 7: commit**

```bash
git add -A
git commit -m "chore: headers de seguridad, CSP report-only, robots, favicon e imágenes OG" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Tarea 15: verificación final, axe, Lighthouse CI y manual · Simple (dev-junior) + revisión de la sesión principal

**Archivos:**
- Crear: `tests/a11y.spec.ts`, `lighthouserc.json`

- [ ] **Paso 1: test de axe**

`tests/a11y.spec.ts`:
```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const path of ['/', '/en']) {
  test(`axe sin violaciones en ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
}
```

Correr `npx playwright test tests/a11y.spec.ts`.
Esperado: PASS. Si hay violaciones, corregirlas en el componente que corresponda y volver a correr.

- [ ] **Paso 2: Lighthouse CI**

`lighthouserc.json`:
```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run preview",
      "startServerReadyPattern": "4321",
      "url": ["http://localhost:4321/", "http://localhost:4321/en"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }]
      }
    },
    "upload": { "target": "filesystem", "outputDir": ".lighthouseci" }
  }
}
```

Correr `npm run build` y después `npm run lhci`.
Esperado: las aserciones pasan (preset mobile por defecto). Si performance da menos de 0.9, mirar LCP y CLS en `.lighthouseci/*.html`. Lo más probable es que sea el reveal del hero: bajar `translateY(105%)` a `translateY(40%)` o acortar los delays.

- [ ] **Paso 3: suite completa y build limpio**

Correr `npm run check`, `npm test` y `npm run build`.
Esperado: 0 errores de tipos, todos los tests PASS, y el build lista 14 placeholders pendientes y termina OK.

- [ ] **Paso 4: verificación manual con la sesión principal**

Ir marcando cada punto:
- [ ] Con el navegador integrado, recorrer `/` y `/en` a 1280px y 375px con teclado (Tab desde arriba): skip link, nav, foco visible en cada link y menú mobile.
- [ ] La consola del navegador no muestra errores. Las violaciones de CSP Report-Only, si aparecen, quedan anotadas.
- [ ] Emular `prefers-reduced-motion: reduce` y confirmar que no hay movimiento y que todo se lee.
- [ ] Dejarle a Valentín la lista para probar en dispositivos reales (Android Chrome e iOS Safari) y con lector de pantalla (NVDA en la sección Lotecito). Esta prueba la hace él; no se puede automatizar acá.

- [ ] **Paso 5: commit**

```bash
git add -A
git commit -m "test: axe por idioma y Lighthouse CI con umbral 90" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Paso 6: cierre.** Mostrarle a Valentín los puntajes de Lighthouse, la salida de `npm run todo` (qué falta completar) y los pasos para el deploy (`vercel` CLI o importar el repo en vercel.com). El deploy lo hace él o se hace con su confirmación explícita.
