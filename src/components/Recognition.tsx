import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, damp, prefersReducedMotion } from "../lib/motion";
import { recognition } from "../data/projects";
import "./Recognition.css";

const HALF = recognition.slice(0, 4);
const REST = recognition.slice(4);

/** One belt. Scroll velocity leans on it, then it settles back to its drift. */
function Belt({ items, dir, speed }: { items: string[]; dir: 1 | -1; speed: number }) {
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rail.current!;
    if (prefersReducedMotion()) return;

    const loop = gsap.to(el, {
      xPercent: -50,
      duration: speed,
      ease: "none",
      repeat: -1,
    });
    loop.timeScale(dir);

    let boost = 0;
    const st = ScrollTrigger.create({
      onUpdate: (self) => (boost = gsap.utils.clamp(-6, 6, self.getVelocity() / 260)),
    });

    let current: number = dir;
    const settle = (_t: number, dt: number) => {
      const target = dir + boost * dir;
      current = damp(current, target, 4, Math.min(dt, 50) / 1000);
      loop.timeScale(current);
      boost *= 0.94;
    };
    gsap.ticker.add(settle);

    return () => {
      gsap.ticker.remove(settle);
      st.kill();
      loop.kill();
    };
  }, [dir, speed]);

  return (
    <div className="belt">
      <div className="belt__rail" ref={rail}>
        {/* Doubled so the -50% loop is seamless. */}
        {[0, 1].map((copy) => (
          <div className="belt__set" key={copy} aria-hidden={copy === 1}>
            {items.map((item) => (
              <span className="belt__item" key={item}>
                {item}
                <i className="belt__sep" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Recognition() {
  return (
    <section className="recog" data-scheme="ink">
      <div className="recog__head">
        <span className="label">05 — Recognition</span>
      </div>
      <Belt items={HALF} dir={-1} speed={38} />
      <Belt items={REST} dir={1} speed={44} />
    </section>
  );
}
