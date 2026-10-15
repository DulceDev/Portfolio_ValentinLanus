import type { gsap } from 'gsap';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';

export type Gsap = typeof gsap;
export type ScrollTriggerT = typeof ScrollTrigger;
export interface MotionCtx {
  desktop: boolean;
}
export type MotionModule = (gsap: Gsap, st: ScrollTriggerT, ctx: MotionCtx) => void | (() => void);
