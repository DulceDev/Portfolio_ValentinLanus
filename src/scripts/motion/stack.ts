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
