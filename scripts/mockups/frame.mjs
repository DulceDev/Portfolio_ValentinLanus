// Piezas compartidas por los generadores de capturas (scripts/mockups/<proyecto>/render.mjs):
// la espera de recursos, la fotografía de cada maqueta y el marco de navegador sobre el
// fondo del portfolio. Así las imágenes de todos los proyectos comparten el mismo marco.
//
// Las rutas las resuelve cada render desde su propio archivo, no desde el cwd.

import { chromium } from '@playwright/test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// El lienzo final (16:10) y la altura de la barra del marco de navegador.
export const LIENZO = { ancho: 2400, alto: 1500 };
export const ALTO_BARRA = 44;

// Chromium con el suavizado de texto en escala de grises (sin LCD), igual en cualquier equipo.
export function abrirNavegador() {
  return chromium.launch({ args: ['--disable-lcd-text'] });
}

// Espera tipografías e imágenes y falla si algo no cargó.
//   cargar:          descriptores de fuente a forzar, p.ej. "800 1em 'Sora'"
//   requeridas:      familias que tienen que figurar como cargadas (error si no)
//   todasCargadas:   exige que ninguna fuente declarada quede sin cargar. Con Google Fonts
//                    hay que apagarlo: cada familia viene en varios subconjuntos por
//                    unicode-range y los que la página no usa quedan "unloaded" a propósito.
export async function esperarRecursos(
  page,
  { cargar = [], requeridas = [], todasCargadas = true },
) {
  const estado = await page.evaluate(async (cargar) => {
    for (const descriptor of cargar) await document.fonts.load(descriptor);
    await document.fonts.ready;
    const imgs = Array.from(document.images);
    await Promise.all(imgs.map((img) => img.decode().catch(() => {})));
    return {
      fuentes: Array.from(document.fonts, (f) => ({
        familia: f.family.replace(/^["']|["']$/g, ''),
        estado: f.status,
      })),
      rotas: imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src),
    };
  }, cargar);

  const resumen = estado.fuentes.map((f) => `${f.familia}: ${f.estado}`);
  for (const familia of requeridas) {
    if (!estado.fuentes.some((f) => f.familia === familia && f.estado === 'loaded')) {
      throw new Error(
        `La tipografía ${familia} no cargó (${resumen.join(', ') || 'sin @font-face'})`,
      );
    }
  }
  if (todasCargadas && estado.fuentes.some((f) => f.estado !== 'loaded')) {
    throw new Error(`Hay tipografías sin cargar: ${resumen.join(', ')}`);
  }
  if (estado.rotas.length) {
    throw new Error(`Imágenes que no cargaron: ${estado.rotas.join(', ')}`);
  }
}

// Fotografía una maqueta (archivo local) a su tamaño de pantalla y factor de pixeles.
export async function capturar(browser, rutaArchivo, { ancho, alto, escala }, espera) {
  const contexto = await browser.newContext({
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: escala,
  });
  try {
    const page = await contexto.newPage();
    await page.goto(pathToFileURL(rutaArchivo).href);
    await esperarRecursos(page, espera);
    return await page.screenshot({ animations: 'disabled' });
  } finally {
    await contexto.close();
  }
}

// CSS base de la composición: lienzo con el color de fondo del portfolio.
export function cssLienzo() {
  return `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { width: ${LIENZO.ancho}px; height: ${LIENZO.alto}px; }
      body { position: relative; overflow: hidden; background: #121513; }
      img { display: block; }`;
}

// Marco de navegador mínimo: tres puntos y nada más. (x, y) es la esquina de arriba a la
// izquierda; ancho y alto son los de la captura adentro del marco (sin la barra ni el borde).
export function cssNavegador({ x, y, ancho, alto }) {
  return `
      .navegador {
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${ancho + 2}px;
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
        height: ${ALTO_BARRA}px;
        padding: 0 18px;
        border-bottom: 1px solid #262b28;
      }
      .barra i { width: 12px; height: 12px; border-radius: 50%; background: #353c38; }
      .navegador img { width: ${ancho}px; height: ${alto}px; }`;
}

export function htmlNavegador(archivo) {
  return `
    <div class="navegador">
      <div class="barra" aria-hidden="true"><i></i><i></i><i></i></div>
      <img src="${archivo}" alt="" />
    </div>`;
}

// Arma la página de composición (css + cuerpo), la fotografía a LIENZO y devuelve el PNG.
// `archivos` son las capturas sueltas que la página referencia: { 'nombre.png': Buffer }.
export async function componer(browser, { titulo, css, cuerpo, archivos }) {
  const pagina = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>${titulo}</title>
    <style>${cssLienzo()}${css}
    </style>
  </head>
  <body>${cuerpo}
  </body>
</html>`;

  const temporal = await mkdtemp(join(tmpdir(), 'mockup-'));
  try {
    for (const [nombre, datos] of Object.entries(archivos)) {
      await writeFile(join(temporal, nombre), datos);
    }
    await writeFile(join(temporal, 'composicion.html'), pagina);

    const contexto = await browser.newContext({
      viewport: { width: LIENZO.ancho, height: LIENZO.alto },
      deviceScaleFactor: 1,
    });
    try {
      const page = await contexto.newPage();
      await page.goto(pathToFileURL(join(temporal, 'composicion.html')).href);
      await esperarRecursos(page, {});
      return await page.screenshot({ animations: 'disabled' });
    } finally {
      await contexto.close();
    }
  } finally {
    await rm(temporal, { recursive: true, force: true });
  }
}

// Comprueba tamaño (el ancho y el alto viajan en el IHDR del PNG, bytes 16 a 23) y peso.
export function verificarImagen(png, { topeBytes }) {
  const ancho = png.readUInt32BE(16);
  const alto = png.readUInt32BE(20);
  if (ancho !== LIENZO.ancho || alto !== LIENZO.alto) {
    throw new Error(
      `La imagen salió de ${ancho}x${alto} y se esperaba ${LIENZO.ancho}x${LIENZO.alto}`,
    );
  }
  const mb = png.length / 1024 / 1024;
  if (png.length > topeBytes) {
    const tope = (topeBytes / 1024 / 1024).toLocaleString('es-AR');
    throw new Error(`La imagen pesa ${mb.toFixed(2)} MB (tope ${tope} MB): pasala a webp.`);
  }
  return { ancho, alto, mb };
}
