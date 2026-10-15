import type { MotionModule } from './types';

export const lotecito: MotionModule = (gsap, ScrollTrigger, { desktop }) => {
  const section = document.querySelector<HTMLElement>('[data-lotecito]');
  const pin = section?.querySelector<HTMLElement>('[data-lotecito-pin]');
  const signal = section?.querySelector<HTMLElement>('[data-signal]');
  const label = section?.querySelector<HTMLElement>('[data-signal-label]');
  if (!section || !pin || !signal || !label) return;
  const steps = Array.from(section.querySelectorAll<HTMLElement>('[data-step]'));
  const decisions = section.querySelectorAll('[data-decisions] li');

  gsap.from(decisions, {
    opacity: 0,
    y: desktop ? 16 : 0,
    duration: 0.5,
    stagger: 0.06,
    ease: 'power2.out',
    scrollTrigger: { trigger: '[data-decisions]', start: 'top 80%', once: true },
  });

  const fadeSteps = () =>
    steps.forEach((step) =>
      gsap.from(step, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: step, start: 'top 85%', once: true },
      }),
    );

  if (!desktop) {
    fadeSteps();
    return;
  }

  // Solo se pinea si el bloque entra en la altura real del viewport (desktop angosto o
  // pantallas bajas usan la versión sin pin, con el contenido completo igual de legible).
  section.classList.add('is-pinned');
  if (pin.scrollHeight > window.innerHeight + 1) {
    section.classList.remove('is-pinned');
    fadeSteps();
    return;
  }

  let current = -1;
  const setActive = (i: number) => {
    if (i === current) return;
    current = i;
    steps.forEach((s, j) => s.toggleAttribute('data-active', j === i));
    signal.dataset.level = String(i + 1);
    label.textContent = steps[i].dataset.status ?? '';
  };

  setActive(0);
  const trigger = ScrollTrigger.create({
    trigger: pin,
    start: 'top top',
    end: '+=150%',
    pin: true,
    onUpdate: (self) =>
      setActive(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))),
  });

  return () => {
    trigger.kill();
    section.classList.remove('is-pinned');
    steps.forEach((s) => s.removeAttribute('data-active'));
    signal.dataset.level = String(steps.length);
    label.textContent = steps[steps.length - 1].dataset.status ?? '';
  };
};
