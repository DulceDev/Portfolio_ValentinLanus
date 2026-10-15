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
