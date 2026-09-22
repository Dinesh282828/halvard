import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Matches the `--e-out` token so JS and CSS easing agree. */
gsap.defaults({ ease: "expo.out", duration: 1 });

export { gsap, ScrollTrigger };

if (import.meta.env.DEV) {
  Object.assign(window as object, { gsap, ScrollTrigger });
}

/** True when the visitor has asked the OS to reduce motion. */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** True on devices with a precise pointer — gates hover-only WebGL work. */
export const hasFinePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Frame-rate independent lerp. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/**
 * Split a string into per-word spans, each wrapped in a per-line-safe
 * inline-block so it can be transformed individually.
 *
 * Hand-rolled rather than GSAP SplitText: we only need words, and this keeps
 * the markup predictable for the scrub-driven manifesto.
 */
export function splitWords(el: HTMLElement): HTMLElement[] {
  const text = el.textContent ?? "";
  el.textContent = "";
  const out: HTMLElement[] = [];

  for (const word of text.split(/\s+/).filter(Boolean)) {
    const outer = document.createElement("span");
    outer.style.display = "inline-block";
    outer.style.whiteSpace = "pre";
    outer.textContent = word;
    el.appendChild(outer);
    el.appendChild(document.createTextNode(" "));
    out.push(outer);
  }

  return out;
}

/**
 * Split into characters, keeping words unbreakable so lines wrap naturally.
 * Used for the letter-roll hover on contact links.
 */
export function splitChars(text: string) {
  return text.split("").map((c) => (c === " " ? " " : c));
}
