// Genera src/assets/projects/photofinder.webp: la pantalla principal de PhotoFinder (búsqueda
// "montañas" con la grilla de fotos) adentro de un marco de celular sobre el fondo del
// portfolio, en una imagen 9:19.5 de 1080 x 2340.
//
//   npm run mockups
//
// 1. Renderiza pantalla.html con Chromium de Playwright (412 x 915, triple densidad).
// 2. La mete en una segunda página con el mismo marco de celular fino que el de Lotecito
//    (a mayor escala) y la fotografía a 1080 x 2340.
// 3. La pasa a WebP: son fotos, en PNG pesaría varios MB.
//
// La maqueta pide Roboto a Google Fonts, igual que la app (la tipografía de Android), así
// que para renderizar hace falta internet. Si Roboto no carga, el script falla en vez de
// generar la imagen con otra tipografía. La espera de recursos y la composición están en
// ../frame.mjs. Las rutas se resuelven desde este archivo, no desde el cwd.
// Para revisar la captura suelta: MOCKUP_DEBUG_DIR=<carpeta> npm run mockups

import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { abrirNavegador, aWebp, capturar, componer } from '../frame.mjs';

const aqui = fileURLToPath(new URL('./', import.meta.url));
const salida = fileURLToPath(
  new URL('../../../src/assets/projects/photofinder.webp', import.meta.url),
);
const carpetaDebug = process.env.MOCKUP_DEBUG_DIR;

// Google Fonts parte cada familia en subconjuntos por unicode-range y solo baja los que la
// página usa, por eso no se exige que todas las fuentes declaradas figuren como cargadas.
const ESPERA = {
  cargar: [400, 500, 700].map((peso) => `${peso} 1em 'Roboto'`),
  requeridas: ['Roboto'],
  todasCargadas: false,
};

// Pantalla del celular (px CSS) y factor de pixeles del render. Mismo tamaño que Lotecito.
const CELULAR = { ancho: 412, alto: 915, escala: 3 };

// El lienzo es 9:19.5 exacto: así lo muestra el portfolio, en una caja de esa proporción.
const LIENZO_VERTICAL = { ancho: 1080, alto: 2340 };
const TOPE_BYTES = 600 * 1024;
const CALIDAD_WEBP = 0.9;

// Marco de celular: el de Lotecito (443 x 962, borde de 8 px, esquinas de 44 px) llevado a
// 1008 px de ancho, o sea a 2,28 veces. Con 36 px de margen a los costados el celular queda
// centrado y la pantalla conserva su proporción 412:915 (sobran 75 px arriba y abajo).
const MARCO = { ancho: 1008, borde: 18, linea: 2, margen: 36 };

function paginaComposicion() {
  const escala = MARCO.ancho / 443;
  const pantallaAncho = MARCO.ancho - 2 * (MARCO.borde + MARCO.linea);
  const pantallaAlto = Math.round((pantallaAncho * CELULAR.alto) / CELULAR.ancho);
  const marcoAlto = pantallaAlto + 2 * (MARCO.borde + MARCO.linea);
  const y = (LIENZO_VERTICAL.alto - marcoAlto) / 2;
  if (!Number.isInteger(y) || y < MARCO.margen) {
    throw new Error(`El celular (${marcoAlto} px de alto) no queda centrado en el lienzo`);
  }

  const r = (n) => Math.round(n * escala);
  // La pantalla sigue la curva del marco, descontando el borde y el relleno.
  const radioPantalla = r(44) - MARCO.borde - MARCO.linea;
  const css = `
      /* Marco de celular fino (el de Lotecito): borde oscuro, esquinas redondeadas y una cámara. */
      .celular {
        position: absolute;
        left: ${MARCO.margen}px;
        top: ${y}px;
        width: ${MARCO.ancho}px;
        height: ${marcoAlto}px;
        padding: ${MARCO.borde}px;
        border: ${MARCO.linea}px solid #2a302c;
        border-radius: ${r(44)}px;
        background: #0a0c0b;
        box-shadow:
          0 ${r(50)}px ${r(100)}px -${r(10)}px rgb(0 0 0 / 0.7),
          0 ${r(16)}px ${r(40)}px rgb(0 0 0 / 0.5),
          inset 0 0 0 ${MARCO.linea}px rgb(255 255 255 / 0.03);
      }
      .celular::after {
        content: '';
        position: absolute;
        right: -${r(4)}px;
        top: ${r(190)}px;
        width: ${r(3)}px;
        height: ${r(84)}px;
        border-radius: 0 ${r(2)}px ${r(2)}px 0;
        background: #1c211e;
      }
      .pantalla { position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: ${radioPantalla}px; }
      .pantalla img { width: 100%; height: 100%; }
      .camara {
        position: absolute;
        top: ${r(12)}px;
        left: 50%;
        width: ${r(13)}px;
        height: ${r(13)}px;
        margin-left: -${r(13) / 2}px;
        border-radius: 50%;
        background: #050706;
        box-shadow: 0 0 0 ${r(2)}px rgb(255 255 255 / 0.05);
      }`;

  const cuerpo = `
    <div class="celular">
      <div class="pantalla">
        <img src="pantalla.png" alt="" />
        <span class="camara"></span>
      </div>
    </div>`;

  return { css, cuerpo, pantalla: { ancho: pantallaAncho, alto: pantallaAlto } };
}

const browser = await abrirNavegador();
try {
  const pantalla = await capturar(browser, join(aqui, 'pantalla.html'), CELULAR, ESPERA);

  if (carpetaDebug) {
    await mkdir(carpetaDebug, { recursive: true });
    await writeFile(join(carpetaDebug, 'pantalla.png'), pantalla);
  }

  const { css, cuerpo } = paginaComposicion();
  const compuesta = await componer(browser, {
    titulo: 'PhotoFinder, composición',
    css,
    cuerpo,
    archivos: { 'pantalla.png': pantalla },
    lienzo: LIENZO_VERTICAL,
  });

  // El PNG de la composición trae su tamaño en el IHDR (bytes 16 a 23).
  const pngAncho = compuesta.readUInt32BE(16);
  const pngAlto = compuesta.readUInt32BE(20);
  if (pngAncho !== LIENZO_VERTICAL.ancho || pngAlto !== LIENZO_VERTICAL.alto) {
    throw new Error(
      `La composición salió de ${pngAncho}x${pngAlto} y se esperaba ${LIENZO_VERTICAL.ancho}x${LIENZO_VERTICAL.alto}`,
    );
  }

  const { webp, ancho, alto } = await aWebp(browser, compuesta, { calidad: CALIDAD_WEBP });
  if (ancho !== LIENZO_VERTICAL.ancho || alto !== LIENZO_VERTICAL.alto) {
    throw new Error(`El WebP salió de ${ancho}x${alto}`);
  }
  if (webp.length > TOPE_BYTES) {
    throw new Error(
      `La imagen pesa ${(webp.length / 1024).toFixed(0)} KB (tope ${TOPE_BYTES / 1024} KB): bajá la calidad`,
    );
  }

  await mkdir(fileURLToPath(new URL('../../../src/assets/projects/', import.meta.url)), {
    recursive: true,
  });
  await writeFile(salida, webp);
  if (carpetaDebug) await copyFile(salida, join(carpetaDebug, 'photofinder.webp'));
  console.log(`Escrito ${salida} (${ancho}x${alto}, ${(webp.length / 1024).toFixed(0)} KB)`);
} finally {
  await browser.close();
}
