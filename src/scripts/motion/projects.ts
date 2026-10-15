import type { MotionModule } from './types';

export const projects: MotionModule = (gsap, _st, { desktop }) => {
  document.querySelectorAll<HTMLElement>('[data-project-row]').forEach((row) => {
    const media = row.querySelector('[data-parallax]');
    const meta = row.querySelector('[data-meta]');
    if (desktop && media) {
      gsap.fromTo(
        media,
        { y: 20 },
        {
          y: -20,
          ease: 'none',
          scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }
    if (meta) {
      gsap.from(meta.children, {
        opacity: 0,
        y: desktop ? 16 : 0,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: { trigger: meta, start: 'top 80%', once: true },
      });
    }
  });
};
