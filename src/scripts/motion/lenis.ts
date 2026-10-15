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
