// El pin de Lotecito agrega 150vh después de que el navegador ya posicionó el scroll
// (por un hash o por la restauración de una recarga). Este módulo devuelve al lector
// a donde corresponde una vez creado el pin, salvo que ya haya empezado a scrollear.

const storageKey = () => `motion:scroll:${location.pathname}`;
let interacted = false;

/** Detecta interacción temprana y guarda la posición (medida con el pin) al salir de la página. */
export function trackReadingPosition(): void {
  const mark = () => {
    interacted = true;
  };
  for (const type of ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const) {
    addEventListener(type, mark, { once: true, passive: true });
  }
  addEventListener('pagehide', () => {
    const mode = document.documentElement.dataset.motion ?? '';
    try {
      sessionStorage.setItem(storageKey(), `${mode}:${Math.round(window.scrollY)}`);
    } catch {
      // Storage bloqueado (modo privado estricto): sin restauración, el sitio sigue igual.
    }
  });
}

/** Llamar después de crear los ScrollTriggers. `mode` = data-motion actual. */
export function restoreReadingPosition(mode: string): void {
  if (interacted) return;

  const nav = performance.getEntriesByType('navigation')[0] as
    PerformanceNavigationTiming | undefined;
  if (nav && nav.type !== 'navigate') {
    // Recarga o atrás/adelante: restaurar el scrollY guardado con el mismo layout.
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(storageKey());
    } catch {
      return;
    }
    const [savedMode, y] = saved?.split(':') ?? [];
    if (savedMode === mode && y) window.scrollTo(0, Number(y));
    return;
  }

  if (location.hash.length < 2) return;
  let target: HTMLElement | null = null;
  try {
    target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  } catch {
    return; // hash mal codificado
  }
  target?.scrollIntoView({ block: 'start' });
}
