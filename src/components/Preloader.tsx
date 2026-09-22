import { useEffect, useRef } from "react";
import { gsap, damp, prefersReducedMotion } from "../lib/motion";
import { lockScroll } from "../lib/useSmoothScroll";
import "./Preloader.css";

/** Loaded before the curtain lifts, so the first scroll is never empty. */
const CRITICAL = [
  "/img/arches-lg.webp",
  "/img/terracotta-lg.webp",
  "/img/cathedral-lg.webp",
  "/img/terraces-lg.webp",
];

const MIN_MS = 1200;

export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    /* `?nopreload` skips the curtain — handy when working on sections far
       down the page, and it costs nothing in production. */
    const skip =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("nopreload");

    if (skip || prefersReducedMotion()) {
      gsap.set(root.current, { autoAlpha: 0, pointerEvents: "none" });
      onDone();
      return;
    }

    lockScroll(true);
    const started = performance.now();
    let loaded = 0;
    let raf = 0;

    CRITICAL.forEach((src) => {
      const img = new Image();
      const bump = () => (loaded += 1);
      img.onload = bump;
      img.onerror = bump;
      img.src = src;
    });

    const ctx = gsap.context(() => {
      let shown = 0;
      let last = performance.now();

      /* The bar can never outrun the real download, and never finishes
         sooner than MIN_MS — so it reads as considered rather than as a
         spinner that flashes on fast connections.

         Easing is time-based rather than per-frame: on a throttled or slow
         tab the counter still completes in the same wall-clock time instead
         of crawling. */
      let finishAt = 0;

      const loop = (now: number) => {
        const dt = Math.min(now - last, 100) / 1000;
        last = now;

        const byBytes = loaded / CRITICAL.length;
        const byTime = (now - started) / MIN_MS;
        const target = Math.min(byBytes, byTime, 1);

        shown = damp(shown, target, 7, dt);

        /* Once everything is in, the tail is on a wall-clock deadline. The
           easing above is per-frame, so on a throttled tab it would other-
           wise creep toward 1 and never arrive. */
        if (target >= 1) {
          if (!finishAt) finishAt = now + 450;
          if (now >= finishAt || shown > 0.99) shown = 1;
        }

        if (num.current) {
          num.current.textContent = String(Math.round(shown * 100)).padStart(3, "0");
        }
        if (fill.current) fill.current.style.transform = `scaleX(${shown})`;

        if (shown >= 1) {
          done.current = true;
          exit();
          return;
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      function exit() {
        const cols = root.current!.querySelectorAll<HTMLElement>(".pre__col");
        gsap
          .timeline({
            onComplete: () => {
              lockScroll(false);
              gsap.set(root.current, { display: "none" });
            },
          })
          .to(".pre__line", { autoAlpha: 0, duration: 0.4 }, 0)
          .to(
            ".pre__row",
            { yPercent: -110, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: "expo.in" },
            0,
          )
          .set(cols, { transformOrigin: "top center" })
          .to(
            cols,
            {
              scaleY: 0,
              duration: 1.05,
              ease: "expo.inOut",
              stagger: { each: 0.06, from: "start" },
            },
            0.35,
          )
          /* Hand off a beat before the curtain clears so the hero's own
             intro is already underway when it becomes visible. */
          .add(onDone, 0.75);
      }
    }, root);

    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, [onDone]);

  return (
    <div className="pre" ref={root} aria-hidden="true">
      <div className="pre__cols">
        {Array.from({ length: 5 }, (_, i) => (
          <div className="pre__col" key={i} />
        ))}
      </div>

      <div className="pre__inner">
        <div className="pre__top">
          <span className="pre__row pre__mark">Halvard</span>
          <span className="pre__row label pre__meta">
            Copenhagen
            <br />
            Lisbon
          </span>
        </div>

        <div className="pre__bottom">
          <div className="pre__line">
            <div className="pre__fill" ref={fill} />
          </div>
          <div className="pre__foot">
            <span className="pre__row label">Architecture &amp; Spatial Research</span>
            <span className="pre__row pre__num tnum" ref={num}>
              000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
