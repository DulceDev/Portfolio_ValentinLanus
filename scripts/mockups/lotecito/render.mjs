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
// El marco de navegador, la espera de recursos y la fotografía están en ../frame.mjs
// (los comparte con Focusly). Las rutas se resuelven desde este archivo, no desde el cwd.
// Para revisar las capturas sueltas: MOCKUP_DEBUG_DIR=<carpeta> npm run mockups

import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LIENZO,
  abrirNavegador,
  capturar,
  componer,
  cssNavegador,
  htmlNavegador,
  verificarImagen,
} from '../frame.mjs';

const aqui = fileURLToPath(new URL('./', import.meta.url));
const salida = fileURLToPath(new URL('../../../src/assets/projects/lotecito.png', import.meta.url));
const carpetaDebug = process.env.MOCKUP_DEBUG_DIR;

const FUENTE = 'Atkinson Hyperlegible Next';
const TOPE_BYTES = 2.5 * 1024 * 1024;
const ESPERA = {
  cargar: [`800 1em '${FUENTE}'`, `400 1em '${FUENTE}'`],
  requeridas: [FUENTE],
};

// Tamaños de pantalla de cada maqueta (px CSS) y factor de pixeles del render.
// El tablero tiene 1040 de alto (y no 900) para que entren las tarjetas de "Por sembrador".
// El celular es de 412 de ancho: a 390 con la letra grande de la app, "Todo enviado" cae
// al renglón de abajo.
const TABLERO = { ancho: 1440, alto: 1040, escala: 2 };
const CELULAR = { ancho: 412, alto: 915, escala: 3 };

// Cómo se acomodan las dos capturas en el lienzo.
const NAVEGADOR = { x: 100, y: 52, zoom: 1.3 };
const MARCO_CELULAR = { derecha: 48, abajo: 30, alto: 962, borde: 8 };

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

  const css = `${cssNavegador({ x: NAVEGADOR.x, y: NAVEGADOR.y, ancho: anchoNav, alto: altoNav })}

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
      }`;

  const cuerpo = `${htmlNavegador('tablero.png')}
    <div class="celular">
      <div class="pantalla">
        <img src="celular.png" alt="" />
        <span class="camara"></span>
      </div>
    </div>`;

  return { css, cuerpo };
}

const browser = await abrirNavegador();
try {
  const tablero = await capturar(browser, join(aqui, 'dashboard.html'), TABLERO, ESPERA);
  const celular = await capturar(browser, join(aqui, 'movil.html'), CELULAR, ESPERA);

  if (carpetaDebug) {
    await mkdir(carpetaDebug, { recursive: true });
    await writeFile(join(carpetaDebug, 'tablero.png'), tablero);
    await writeFile(join(carpetaDebug, 'celular.png'), celular);
  }

  const compuesta = await componer(browser, {
    titulo: 'Lotecito, composición',
    ...paginaComposicion(),
    archivos: { 'tablero.png': tablero, 'celular.png': celular },
  });

  const { ancho, alto, mb } = verificarImagen(compuesta, { topeBytes: TOPE_BYTES });

  await mkdir(fileURLToPath(new URL('../../../src/assets/projects/', import.meta.url)), {
    recursive: true,
  });
  await writeFile(salida, compuesta);
  if (carpetaDebug) await copyFile(salida, join(carpetaDebug, 'lotecito.png'));
  console.log(`Escrito ${salida} (${ancho}x${alto}, ${mb.toFixed(2)} MB)`);
} finally {
  await browser.close();
}
