import type { MotionModule } from './types';

export const contact: MotionModule = (gsap, _st, { desktop }) => {
  const section = document.querySelector('[data-contact]');
  if (!section) return;
  const items = Array.from(section.querySelectorAll<HTMLElement>('[data-contact-link]'));
  gsap.from(items, {
    opacity: 0,
    y: desktop ? 24 : 0,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power2.out',
    scrollTrigger: { trigger: section, start: 'top 75%', once: true },
  });
  if (!desktop) return;

  // Hover magnético leve sobre el label (no sobre el li, que ya anima `y` al entrar).
  // Solo en links reales: en un canal pendiente sugeriría algo clickeable.
  const offs = items.map((item) => {
    const label = item.querySelector<HTMLElement>('a [data-magnet]');
    if (!label) return () => {};
    const xTo = gsap.quickTo(label, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(label, 'y', { duration: 0.4, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const r = label.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.15);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    item.addEventListener('pointermove', move);
    item.addEventListener('pointerleave', leave);
    return () => {
      item.removeEventListener('pointermove', move);
      item.removeEventListener('pointerleave', leave);
    };
  });
  return () => offs.forEach((off) => off());
};
