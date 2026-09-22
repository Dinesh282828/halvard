import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, hasFinePointer, prefersReducedMotion } from "../lib/motion";
import { DistortImage } from "../lib/webgl/DistortImage";
import { Img } from "./Img";
import "./Hero.css";

export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const gl = useRef<DistortImage | null>(null);

  /* WebGL sits over the <img>, which stays as the fallback and the mobile
     path. The shear is fed by scroll velocity and relaxes back to flat. */
  useEffect(() => {
    if (!canvas.current || !hasFinePointer() || prefersReducedMotion()) return;
    const inst = new DistortImage(canvas.current, "/img/arches-lg.webp", {
      zoom: 0,
      ripple: 0.006,
      chroma: 0.0015,
      ease: 4,
    });
    gl.current = inst;

    const wave = { v: 0 };
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        const target = gsap.utils.clamp(-0.012, 0.012, self.getVelocity() / 90000);
        gsap.to(wave, {
          v: target,
          duration: 0.35,
          overwrite: true,
          onUpdate: () => (inst.wave = wave.v),
          onComplete: () =>
            gsap.to(wave, {
              v: 0,
              duration: 1.1,
              onUpdate: () => (inst.wave = wave.v),
            }),
        });
      },
    });

    return () => {
      st.kill();
      inst.destroy();
      gl.current = null;
    };
  }, []);

  /* Scroll parallax: the plate drifts slower than the copy over it. */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        })
        .to(".hero__media", { yPercent: 18, scale: 1.08, ease: "none" }, 0)
        .to(".hero__copy", { yPercent: -60, autoAlpha: 0, ease: "none" }, 0)
        .to(".hero__foot", { autoAlpha: 0, ease: "none", duration: 0.3 }, 0);
    }, root);
    return () => ctx.revert();
  }, []);

  /* Intro, held until the curtain is on its way up. */
  useEffect(() => {
    if (!ready) return;
    if (prefersReducedMotion()) {
      gsap.set(".hero__line, .hero__fade", { yPercent: 0, autoAlpha: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .fromTo(
          ".hero__plate",
          { scale: 1.22 },
          { scale: 1, duration: 2.4, ease: "expo.out" },
          0,
        )
        .fromTo(
          ".hero__line",
          { yPercent: 108 },
          { yPercent: 0, duration: 1.35, stagger: 0.1, ease: "expo.out" },
          0.15,
        )
        .fromTo(
          ".hero__fade",
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 1, stagger: 0.07 },
          0.7,
        )
        .fromTo(
          ".hero__tick",
          { scaleY: 0 },
          { scaleY: 1, duration: 0.9, ease: "power2.inOut" },
          0.9,
        );
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section className="hero" ref={root}>
      <div className="hero__media">
        <div className="hero__plate">
          <Img
            name="arches"
            alt="A white vaulted corridor receding toward a lit opening"
            priority
            sizes="100vw"
          />
          <canvas className="hero__gl" ref={canvas} aria-hidden="true" />
        </div>
      </div>

      <div className="hero__copy">
        <p className="hero__eyebrow label hero__fade">
          <span className="hero__dot" /> Architecture &amp; Spatial Research
        </p>

        <h1 className="hero__title display">
          <span className="line-mask">
            <span className="hero__line">Architecture for</span>
          </span>
          <span className="line-mask">
            <span className="hero__line">the long now.</span>
          </span>
        </h1>

        <p className="hero__sub mono hero__fade">
          A practice of eleven — Copenhagen &amp; Lisbon — est. 2011
        </p>
      </div>

      <div className="hero__foot">
        <span className="label hero__fade">55°40′34″N&nbsp;&nbsp;12°34′06″E</span>
        <span className="label hero__fade hero__foot-mid">Six selected works</span>
        <span className="hero__scroll label hero__fade">
          Scroll
          <span className="hero__tick" />
        </span>
      </div>
    </section>
  );
}
