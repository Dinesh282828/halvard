import { useEffect, useRef } from "react";
import { gsap, splitWords, prefersReducedMotion } from "../lib/motion";
import "./Manifesto.css";

const TEXT =
  "We are a practice of eleven, working between Copenhagen and Lisbon. We build slowly. We would rather have one good detail than twelve clever ones. Our drawings are made to be read a hundred years from now, by people we will never meet.";

export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const para = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = para.current!;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const words = splitWords(el);

      gsap.fromTo(
        words,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.6,
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            end: "bottom 55%",
            scrub: 0.6,
          },
        },
      );

      gsap.fromTo(
        ".manifesto__gauge",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top center",
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            end: "bottom 55%",
            scrub: 0.6,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="manifesto" id="practice" ref={root}>
      <div className="manifesto__aside">
        <span className="label">01 — Practice</span>
        <div className="manifesto__rail">
          <div className="manifesto__gauge" />
        </div>
      </div>

      <p className="manifesto__text" ref={para}>
        {TEXT}
      </p>
    </section>
  );
}
