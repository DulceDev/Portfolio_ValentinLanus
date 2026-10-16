// Genera src/assets/projects/focusly.png: la maqueta del Inicio de Focusly con datos de
// ejemplo, adentro de un marco de navegador sobre el fondo del portfolio (16:10).
//
//   npm run mockups
//
// 1. Renderiza dashboard.html con Chromium de Playwright (1440 x 900, doble densidad).
// 2. La mete en una segunda página con el mismo marco de navegador que Lotecito y la
//    fotografía a 2400 x 1500.
//
// La maqueta pide Sora y JetBrains Mono a Google Fonts, igual que la app real, así que para
// renderizar hace falta internet. Si Sora no carga, el script falla en vez de generar una
// imagen con otra tipografía. El marco y la espera de recursos están en ../frame.mjs.
// Las rutas se resuelven desde este archivo, no desde el cwd.
// Para revisar la captura suelta: MOCKUP_DEBUG_DIR=<carpeta> npm run mockups

import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALTO_BARRA,
  LIENZO,
  abrirNavegador,
  capturar,
  componer,
  cssNavegador,
  htmlNavegador,
  verificarImagen,
} from '../frame.mjs';

const aqui = fileURLToPath(new URL('./', import.meta.url));
const salida = fileURLToPath(new URL('../../../src/assets/projects/focusly.png', import.meta.url));
const carpetaDebug = process.env.MOCKUP_DEBUG_DIR;

const TOPE_BYTES = 2 * 1024 * 1024;

// Google Fonts parte cada familia en subconjuntos por unicode-range y solo baja los que la
// página usa, por eso no se exige que todas las fuentes declaradas figuren como cargadas.
// JetBrains Mono se pide en 400 y 500 (como la app): el 700 de las etiquetas es negrita
// sintetizada por el navegador, igual que en la app real.
const ESPERA = {
  cargar: [
    ...[400, 500, 600, 700, 800].map((peso) => `${peso} 1em 'Sora'`),
    `500 1em 'JetBrains Mono'`,
    `700 1em 'JetBrains Mono'`,
  ],
  requeridas: ['Sora', 'JetBrains Mono'],
  todasCargadas: false,
};

// Pantalla de escritorio de la maqueta (px CSS) y factor de pixeles del render. 1440 x 900
// alcanza para los dos paneles y el banner de abajo.
const PANTALLA = { ancho: 1440, alto: 900, escala: 2 };

// Cómo se acomoda en el lienzo: a zoom 1,5 la captura mide 2160 x 1350 y, con la barra y el
// borde del marco, deja los mismos 52 px de margen arriba y abajo que Lotecito.
const NAVEGADOR = { zoom: 1.5, y: 52 };

function paginaComposicion() {
  const ancho = PANTALLA.ancho * NAVEGADOR.zoom;
  const alto = PANTALLA.alto * NAVEGADOR.zoom;
  const x = (LIENZO.ancho - (ancho + 2)) / 2;

  const alturaMarco = alto + ALTO_BARRA + 2;
  if (NAVEGADOR.y * 2 + alturaMarco !== LIENZO.alto) {
    throw new Error(
      `El marco (${alturaMarco} px de alto) no queda centrado en el lienzo de ${LIENZO.alto} px`,
    );
  }

  return {
    css: cssNavegador({ x, y: NAVEGADOR.y, ancho, alto }),
    cuerpo: htmlNavegador('inicio.png'),
  };
}

const browser = await abrirNavegador();
try {
  const inicio = await capturar(browser, join(aqui, 'dashboard.html'), PANTALLA, ESPERA);

  if (carpetaDebug) {
    await mkdir(carpetaDebug, { recursive: true });
    await writeFile(join(carpetaDebug, 'inicio.png'), inicio);
  }

  const compuesta = await componer(browser, {
    titulo: 'Focusly, composición',
    ...paginaComposicion(),
    archivos: { 'inicio.png': inicio },
  });

  const { ancho, alto, mb } = verificarImagen(compuesta, { topeBytes: TOPE_BYTES });

  await mkdir(fileURLToPath(new URL('../../../src/assets/projects/', import.meta.url)), {
    recursive: true,
  });
  await writeFile(salida, compuesta);
  if (carpetaDebug) await copyFile(salida, join(carpetaDebug, 'focusly.png'));
  console.log(`Escrito ${salida} (${ancho}x${alto}, ${mb.toFixed(2)} MB)`);
} finally {
  await browser.close();
}
