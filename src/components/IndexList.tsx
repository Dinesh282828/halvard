import { useEffect, useRef, useState } from "react";
import { gsap, hasFinePointer, prefersReducedMotion } from "../lib/motion";
import { disciplines } from "../data/projects";
import { Img } from "./Img";
import "./IndexList.css";

/**
 * The practice's disciplines as an index. Hovering a row brings up its
 * photograph on a spring-lagged follower, tilted by how fast the pointer is
 * travelling — so the image feels carried rather than pinned to the cursor.
 */
export function IndexList() {
  const root = useRef<HTMLElement>(null);
  const follower = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const el = follower.current!;
    const list = root.current!.querySelector<HTMLElement>(".index__rows")!;

    const x = gsap.quickTo(el, "x", { duration: 0.65, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.65, ease: "power3.out" });
    /* `rotation` is gsap's own transform channel — using the CSS `rotate`
       property here fights the scale/opacity tweens on the same element. */
    const rot = gsap.quickTo(el, "rotation", { duration: 0.9, ease: "power3.out" });

    let lastX = 0;
    const move = (e: PointerEvent) => {
      const r = root.current!.getBoundingClientRect();
      x(e.clientX - r.left);
      y(e.clientY - r.top);
      rot(gsap.utils.clamp(-11, 11, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    };

    const enter = () => gsap.to(el, { autoAlpha: 1, scale: 1, duration: 0.55, ease: "expo.out" });
    const leave = () => {
      setActive(-1);
      gsap.to(el, { autoAlpha: 0, scale: 0.86, duration: 0.4, ease: "expo.out" });
    };

    list.addEventListener("pointermove", move);
    list.addEventListener("pointerenter", enter);
    list.addEventListener("pointerleave", leave);
    return () => {
      list.removeEventListener("pointermove", move);
      list.removeEventListener("pointerenter", enter);
      list.removeEventListener("pointerleave", leave);
    };
  }, []);

  /* Rows arrive on scroll. */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".index__row", {
        yPercent: 60,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.07,
        scrollTrigger: { trigger: ".index__rows", start: "top 82%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="index" ref={root}>
      <div className="index__head">
        <span className="label">04 — Disciplines</span>
        <span className="label">Ninety-three built to date</span>
      </div>

      <ul className="index__rows">
        {disciplines.map((d, i) => (
          <li
            className="index__row"
            key={d.n}
            data-cursor="link"
            onPointerEnter={() => setActive(i)}
          >
            <span className="index__n mono">{d.n}</span>
            <span className="index__name">{d.name}</span>
            <span className="index__count mono">{d.count}</span>
          </li>
        ))}
      </ul>

      <div className="index__follower" ref={follower} aria-hidden="true">
        {disciplines.map((d, i) => (
          <div
            className="index__plate"
            key={d.n}
            data-live={active === i ? "true" : "false"}
          >
            <Img name={d.image} alt="" sizes="24rem" />
          </div>
        ))}
      </div>
    </section>
  );
}
