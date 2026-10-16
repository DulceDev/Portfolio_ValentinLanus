// Genera src/assets/projects/lotecito.png: las dos maquetas de Lotecito (el tablero del
// dueño en la compu y el Inicio del sembrador en el celular), con datos de ejemplo,
// compuestas en una sola imagen 16:10.
//
//   npm run mockups
//
// 1. Renderiza dashboard.html y movil.html con Chromium de Playwright.
// 2. Los mete en una tercera página (marco de navegador + marco de celular sobre el
//    fondo del portfolio) y la fotografía a 2400 x 1500.
//
// Las rutas se resuelven desde este archivo, no desde el cwd. Para revisar las capturas
// sueltas: MOCKUP_DEBUG_DIR=<carpeta> npm run mockups

import { chromium } from '@playwright/test';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const aqui = fileURLToPath(new URL('./', import.meta.url));
const salida = fileURLToPath(new URL('../../../src/assets/projects/lotecito.png', import.meta.url));
const carpetaDebug = process.env.MOCKUP_DEBUG_DIR;

const FUENTE = 'Atkinson Hyperlegible Next';
const TOPE_BYTES = 2.5 * 1024 * 1024;

// Tamaños de pantalla de cada maqueta (px CSS) y factor de pixeles del render.
// El tablero tiene 1040 de alto (y no 900) para que entren las tarjetas de "Por sembrador".
// El celular es de 412 de ancho: a 390 con la letra grande de la app, "Todo enviado" cae
// al renglón de abajo.
const TABLERO = { ancho: 1440, alto: 1040, escala: 2 };
const CELULAR = { ancho: 412, alto: 915, escala: 3 };

// El lienzo final (16:10) y cómo se acomodan las dos capturas adentro.
const LIENZO = { ancho: 2400, alto: 1500 };
const NAVEGADOR = { x: 100, y: 52, zoom: 1.3, barra: 44 };
const MARCO_CELULAR = { derecha: 48, abajo: 30, alto: 962, borde: 8 };

async function esperarRecursos(page, { conFuente }) {
  const estado = await page.evaluate(
    async ({ fuente, conFuente }) => {
      if (conFuente) {
        await document.fonts.load(`800 1em '${fuente}'`);
        await document.fonts.load(`400 1em '${fuente}'`);
      }
      await document.fonts.ready;
      const imgs = Array.from(document.images);
      await Promise.all(imgs.map((img) => img.decode().catch(() => {})));
      return {
        fuentes: Array.from(document.fonts, (f) => `${f.family}: ${f.status}`),
        rotas: imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src),
      };
    },
    { fuente: FUENTE, conFuente },
  );
  if (conFuente && !estado.fuentes.some((f) => f === `${FUENTE}: loaded`)) {
    throw new Error(
      `La tipografía ${FUENTE} no cargó (${estado.fuentes.join(', ') || 'sin @font-face'})`,
    );
  }
  if (estado.fuentes.some((f) => !f.endsWith(': loaded'))) {
    throw new Error(`Hay tipografías sin cargar: ${estado.fuentes.join(', ')}`);
  }
  if (estado.rotas.length) {
    throw new Error(`Imágenes que no cargaron: ${estado.rotas.join(', ')}`);
  }
}

async function capturar(browser, archivo, { ancho, alto, escala }) {
  const contexto = await browser.newContext({
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: escala,
  });
  try {
    const page = await contexto.newPage();
    await page.goto(pathToFileURL(join(aqui, archivo)).href);
    await esperarRecursos(page, { conFuente: true });
    return await page.screenshot({ animations: 'disabled' });
  } finally {
    await contexto.close();
  }
}

// La página que compone: fondo del portfolio, marco de navegador con el tablero y marco
// de celular encima, apoyado en la esquina de abajo a la derecha.
function paginaComposicion() {
  const anchoNav = TABLERO.ancho * NAVEGADOR.zoom;
  const altoNav = TABLERO.alto * NAVEGADOR.zoom;
  const pantallaAlto = MARCO_CELULAR.alto - 2 * MARCO_CELULAR.borde - 2;
  const pantallaAncho = Math.round((pantallaAlto * CELULAR.ancho) / CELULAR.alto);
  const celularAncho = pantallaAncho + 2 * MARCO_CELULAR.borde + 2;
  const celularX = LIENZO.ancho - MARCO_CELULAR.derecha - celularAncho;
  const celularY = LIENZO.alto - MARCO_CELULAR.abajo - MARCO_CELULAR.alto;

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Lotecito, composición</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { width: ${LIENZO.ancho}px; height: ${LIENZO.alto}px; }
      body { position: relative; overflow: hidden; background: #121513; }
      img { display: block; }

      /* Marco de navegador mínimo: tres puntos y nada más. */
      .navegador {
        position: absolute;
        left: ${NAVEGADOR.x}px;
        top: ${NAVEGADOR.y}px;
        width: ${anchoNav + 2}px;
        overflow: hidden;
        border: 1px solid #262b28;
        border-radius: 12px;
        background: #181c1a;
        box-shadow: 0 40px 100px -10px rgb(0 0 0 / 0.6), 0 14px 36px rgb(0 0 0 / 0.4);
      }
      .barra {
        display: flex;
        align-items: center;
        gap: 8px;
        height: ${NAVEGADOR.barra}px;
        padding: 0 18px;
        border-bottom: 1px solid #262b28;
      }
      .barra i { width: 12px; height: 12px; border-radius: 50%; background: #353c38; }
      .navegador img { width: ${anchoNav}px; height: ${altoNav}px; }

      /* Marco de celular fino: borde oscuro, esquinas redondeadas y una cámara. */
      .celular {
        position: absolute;
        left: ${celularX}px;
        top: ${celularY}px;
        width: ${celularAncho}px;
        height: ${MARCO_CELULAR.alto}px;
        padding: ${MARCO_CELULAR.borde}px;
        border: 1px solid #2a302c;
        border-radius: 44px;
        background: #0a0c0b;
        box-shadow:
          0 50px 100px -10px rgb(0 0 0 / 0.7),
          0 16px 40px rgb(0 0 0 / 0.5),
          inset 0 0 0 1px rgb(255 255 255 / 0.03);
      }
      .celular::after {
        content: '';
        position: absolute;
        right: -4px;
        top: 190px;
        width: 3px;
        height: 84px;
        border-radius: 0 2px 2px 0;
        background: #1c211e;
      }
      .pantalla { position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: 36px; }
      .pantalla img { width: 100%; height: 100%; }
      .camara {
        position: absolute;
        top: 12px;
        left: 50%;
        width: 13px;
        height: 13px;
        margin-left: -6px;
        border-radius: 50%;
        background: #050706;
        box-shadow: 0 0 0 2px rgb(255 255 255 / 0.05);
      }
    </style>
  </head>
  <body>
    <div class="navegador">
      <div class="barra" aria-hidden="true"><i></i><i></i><i></i></div>
      <img src="tablero.png" alt="" />
    </div>
    <div class="celular">
      <div class="pantalla">
        <img src="celular.png" alt="" />
        <span class="camara"></span>
      </div>
    </div>
  </body>
</html>`;
}

async function componer(browser, tablero, celular) {
  const temporal = await mkdtemp(join(tmpdir(), 'lotecito-mockup-'));
  try {
    await writeFile(join(temporal, 'tablero.png'), tablero);
    await writeFile(join(temporal, 'celular.png'), celular);
    await writeFile(join(temporal, 'composicion.html'), paginaComposicion());

    const contexto = await browser.newContext({
      viewport: { width: LIENZO.ancho, height: LIENZO.alto },
      deviceScaleFactor: 1,
    });
    try {
      const page = await contexto.newPage();
      await page.goto(pathToFileURL(join(temporal, 'composicion.html')).href);
      await esperarRecursos(page, { conFuente: false });
      return await page.screenshot({ animations: 'disabled' });
    } finally {
      await contexto.close();
    }
  } finally {
    await rm(temporal, { recursive: true, force: true });
  }
}

const browser = await chromium.launch({ args: ['--disable-lcd-text'] });
try {
  const tablero = await capturar(browser, 'dashboard.html', TABLERO);
  const celular = await capturar(browser, 'movil.html', CELULAR);

  if (carpetaDebug) {
    await mkdir(carpetaDebug, { recursive: true });
    await writeFile(join(carpetaDebug, 'tablero.png'), tablero);
    await writeFile(join(carpetaDebug, 'celular.png'), celular);
  }

  const compuesta = await componer(browser, tablero, celular);

  // El ancho y el alto viajan en el IHDR del PNG (bytes 16 a 23).
  const ancho = compuesta.readUInt32BE(16);
  const alto = compuesta.readUInt32BE(20);
  if (ancho !== LIENZO.ancho || alto !== LIENZO.alto) {
    throw new Error(
      `La imagen salió de ${ancho}x${alto} y se esperaba ${LIENZO.ancho}x${LIENZO.alto}`,
    );
  }
  if (compuesta.length > TOPE_BYTES) {
    throw new Error(
      `La imagen pesa ${(compuesta.length / 1024 / 1024).toFixed(2)} MB (tope 2,5 MB): pasala a webp.`,
    );
  }

  await mkdir(fileURLToPath(new URL('../../../src/assets/projects/', import.meta.url)), {
    recursive: true,
  });
  await writeFile(salida, compuesta);
  if (carpetaDebug) await copyFile(salida, join(carpetaDebug, 'lotecito.png'));
  console.log(
    `Escrito ${salida} (${ancho}x${alto}, ${(compuesta.length / 1024 / 1024).toFixed(2)} MB)`,
  );
} finally {
  await browser.close();
}
