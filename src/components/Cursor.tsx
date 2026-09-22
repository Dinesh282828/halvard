import { useEffect, useRef } from "react";
import { gsap, hasFinePointer, prefersReducedMotion } from "../lib/motion";
import "./Cursor.css";

/**
 * A two-part cursor: a dot that tracks exactly, and a ring that lags behind.
 * Both sit in a `mix-blend-mode: difference` layer so they invert against
 * whatever is underneath — no light/dark variants needed.
 *
 * Any element can retitle the ring with `data-cursor="view|drag|open"`.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const d = dot.current!;
    const r = ring.current!;
    const l = label.current!;

    document.documentElement.classList.add("has-custom-cursor");

    const dx = gsap.quickTo(d, "x", { duration: 0.14, ease: "power3.out" });
    const dy = gsap.quickTo(d, "y", { duration: 0.14, ease: "power3.out" });
    const rx = gsap.quickTo(r, "x", { duration: 0.55, ease: "power3.out" });
    const ry = gsap.quickTo(r, "y", { duration: 0.55, ease: "power3.out" });

    let shown = false;
    const onMove = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([d, r], { autoAlpha: 1, duration: 0.4 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };

    let mode = "";
    const onOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement)?.closest?.("[data-cursor]");
      const next = (target as HTMLElement | null)?.dataset.cursor ?? "";
      if (next === mode) return;
      mode = next;

      const wide = next === "view" || next === "drag" || next === "open";
      l.textContent = wide ? next.toUpperCase() : "";

      gsap.to(r, {
        width: wide ? 84 : next === "link" ? 52 : 34,
        height: wide ? 84 : next === "link" ? 52 : 34,
        borderWidth: wide ? 1 : 1,
        duration: 0.5,
        ease: "expo.out",
      });
      gsap.to(d, { scale: wide ? 0 : 1, duration: 0.4, ease: "expo.out" });
      gsap.to(l, { autoAlpha: wide ? 1 : 0, duration: 0.3 });
    };

    const onDown = () => gsap.to(r, { scale: 0.82, duration: 0.3 });
    const onUp = () => gsap.to(r, { scale: 1, duration: 0.5 });
    const onLeave = () => gsap.to([d, r], { autoAlpha: 0, duration: 0.25 });
    const onEnter = () => gsap.to([d, r], { autoAlpha: 1, duration: 0.25 });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true">
      <div className="cursor__dot" ref={dot} />
      <div className="cursor__ring" ref={ring}>
        <span className="cursor__label" ref={label} />
      </div>
    </div>
  );
}
