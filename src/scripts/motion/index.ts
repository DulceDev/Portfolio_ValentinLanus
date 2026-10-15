import { initLenis } from './lenis';
import { progress } from './progress';
import type { MotionModule } from './types';

// Las tareas 12 y 13 agregan sus módulos acá.
const modules: MotionModule[] = [progress];

const root = document.documentElement;

const whenIdle = (cb: () => void) =>
  'requestIdleCallback' in window
    ? requestIdleCallback(cb, { timeout: 1500 })
    : setTimeout(cb, 200);

async function start() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
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
