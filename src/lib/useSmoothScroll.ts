import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./motion";

let instance: Lenis | null = null;

/** Shared handle so page transitions can lock and jump the scroller. */
export const getLenis = () => instance;

export function scrollToTop(immediate = true) {
  instance?.scrollTo(0, { immediate });
  if (!instance) window.scrollTo(0, 0);
}

export function lockScroll(locked: boolean) {
  if (locked) instance?.stop();
  else instance?.start();
  document.documentElement.classList.toggle("lenis-stopped", locked);
}

/**
 * Drives Lenis from gsap's ticker so smooth scroll, ScrollTrigger and every
 * WebGL instance share one rAF loop and can never tear against each other.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });
    instance = lenis;
    if (import.meta.env.DEV) {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      instance = null;
    };
  }, []);
}
