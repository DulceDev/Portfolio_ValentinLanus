import type { Gsap, MotionModule, ScrollTriggerT } from './types';

type Tween = ReturnType<Gsap['from']>;
type Trigger = ReturnType<ScrollTriggerT['create']>;

export const lotecito: MotionModule = (gsap, ScrollTrigger, { desktop }) => {
  const section = document.querySelector<HTMLElement>('[data-lotecito]');
  const pin = section?.querySelector<HTMLElement>('[data-lotecito-pin]');
  const signal = section?.querySelector<HTMLElement>('[data-signal]');
  const label = section?.querySelector<HTMLElement>('[data-signal-label]');
  if (!section || !pin || !signal || !label) return;
  const steps = Array.from(section.querySelectorAll<HTMLElement>('[data-step]'));
  const decisions = section.querySelectorAll('[data-decisions] li');
  const lastStatus = steps[steps.length - 1].dataset.status ?? '';

  const fadeSteps = (): Tween[] =>
    steps.map((step) =>
      gsap.from(step, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: step, start: 'top 85%', once: true },
      }),
    );

  // refreshPriority -1: se calcula después del pin, que agrega 150vh por encima de la lista.
  const enterDecisions = () =>
    gsap.from(decisions, {
      opacity: 0,
      y: desktop ? 16 : 0,
      duration: 0.5,
      stagger: 0.06,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '[data-decisions]',
        start: 'top 80%',
        once: true,
        refreshPriority: -1,
      },
    });

  if (!desktop) {
    fadeSteps();
    enterDecisions();
    return;
  }

  // Desktop: se pinea solo si el bloque entra en la altura del viewport. Se vuelve a evaluar
  // en cada refresh de ScrollTrigger (resize, fuentes cargadas) y se alterna entre pin y fades.
  let mode: 'pinned' | 'fades' | null = null;
  let trigger: Trigger | null = null;
  let fades: Tween[] = [];
  let current = -1;

  const setActive = (i: number) => {
    if (i === current) return;
    current = i;
    steps.forEach((s, j) => s.toggleAttribute('data-active', j === i));
    signal.dataset.level = String(i + 1);
    label.textContent = steps[i].dataset.status ?? '';
  };

  const resetState = () => {
    current = -1;
    section.classList.remove('is-pinned');
    steps.forEach((s) => s.removeAttribute('data-active'));
    signal.dataset.level = String(steps.length);
    label.textContent = lastStatus;
  };

  const stopFades = () => {
    fades.forEach((t) => {
      t.scrollTrigger?.kill();
      t.revert();
    });
    fades = [];
  };

  const toPinned = () => {
    stopFades();
    section.classList.add('is-pinned');
    setActive(0);
    trigger = ScrollTrigger.create({
      trigger: pin,
      start: 'top top',
      end: '+=150%',
      pin: true,
      refreshPriority: 1,
      onUpdate: (self) =>
        setActive(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))),
    });
    mode = 'pinned';
  };

  const toFades = () => {
    trigger?.kill(true);
    trigger = null;
    resetState();
    fades = fadeSteps();
    mode = 'fades';
  };

  const fits = () => {
    // Pineado, ScrollTrigger fija el alto natural del bloque; si no, se mide con .is-pinned.
    if (mode === 'pinned') return pin.offsetHeight <= window.innerHeight + 1;
    section.classList.add('is-pinned');
    const ok = pin.scrollHeight <= window.innerHeight + 1;
    section.classList.remove('is-pinned');
    return ok;
  };

  const evaluate = () => {
    const next = fits() ? 'pinned' : 'fades';
    if (next === mode) return false;
    if (next === 'pinned') toPinned();
    else toFades();
    return true;
  };

  evaluate();
  enterDecisions();

  const onRefresh = () => {
    if (evaluate()) ScrollTrigger.refresh();
  };
  ScrollTrigger.addEventListener('refresh', onRefresh);

  return () => {
    ScrollTrigger.removeEventListener('refresh', onRefresh);
    trigger?.kill(true);
    stopFades();
    resetState();
  };
};
