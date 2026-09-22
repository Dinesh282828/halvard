import { useEffect, useRef } from "react";
import { gsap, hasFinePointer, prefersReducedMotion } from "../lib/motion";
import { DistortImage } from "../lib/webgl/DistortImage";
import { getLenis } from "../lib/useSmoothScroll";
import { projects } from "../data/projects";
import { useTransition } from "./PageTransition";
import { Img } from "./Img";
import "./WorkGallery.css";

/** One card. The GL plate is built on first hover, never before. */
function Card({ project, i }: { project: (typeof projects)[number]; i: number }) {
  const { go } = useTransition();
  const canvas = useRef<HTMLCanvasElement>(null);
  const gl = useRef<DistortImage | null>(null);

  useEffect(() => () => gl.current?.destroy(), []);

  const ensureGL = () => {
    if (gl.current || !canvas.current || !hasFinePointer() || prefersReducedMotion()) return;
    gl.current = new DistortImage(canvas.current, `/img/${project.cover}-lg.webp`, {
      zoom: 0.07,
      ripple: 0.02,
      chroma: 0.005,
    });
  };

  return (
    /* A real anchor: keyboard reachable, middle-clickable, and crawlable.
       The click is intercepted so the wipe can run, but everything a link
       normally does still works. */
    <a
      className="card"
      href={`/work/${project.slug}`}
      data-span={i % 2 === 0 ? "tall" : "wide"}
      data-cursor="view"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        go(`/work/${project.slug}`, project.title);
      }}
      onPointerEnter={() => {
        ensureGL();
        gl.current?.setHover(true);
      }}
      onPointerLeave={() => gl.current?.setHover(false)}
      onPointerMove={(e) => gl.current?.setPointer(e.clientX, e.clientY)}
    >
      <div className="card__frame">
        <Img
          name={project.cover}
          alt={`${project.title} — ${project.typology}, ${project.place}`}
          sizes="(max-width: 768px) 88vw, 40vw"
          className="card__img"
        />
        <canvas className="card__gl" ref={canvas} aria-hidden="true" />
      </div>

      <div className="card__meta">
        <div className="card__head">
          <span className="card__index mono">{project.index}</span>
          <h3 className="card__title">{project.title}</h3>
        </div>
        <dl className="card__specs mono">
          <div>
            <dt className="label">Type</dt>
            <dd>{project.typology}</dd>
          </div>
          <div>
            <dt className="label">Place</dt>
            <dd>{project.place}</dd>
          </div>
          <div>
            <dt className="label">Year</dt>
            <dd>{project.year}</dd>
          </div>
        </dl>
      </div>
    </a>
  );
}

export function WorkGallery() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const mm = gsap.matchMedia();

    /* Pinned horizontal run — desktop only. Below that the cards stack and
       scroll normally, which is far better than fighting touch momentum. */
    mm.add("(min-width: 769px)", () => {
      const el = track.current!;
      const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);

      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pin.current,
          /* Pin the inner wrapper, never the <section>. ScrollTrigger wraps
             whatever it pins in a .pin-spacer, and if that were the section
             itself React would later try to remove it from <main> — which is
             no longer its parent — and take the whole app down on route
             change. Pinning a child keeps the section where React left it. */
          pin: pin.current,
          start: "top top",
          end: () => "+=" + distance(),
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            /* Progress rail + which tick is live. */
            const p = self.progress;
            gsap.set(".work__gauge", { scaleX: p });
            const active = Math.min(
              projects.length - 1,
              Math.floor(p * projects.length + 0.0001),
            );
            root.current!
              .querySelectorAll(".work__tick")
              .forEach((t, idx) => t.classList.toggle("is-live", idx === active));
          },
        },
      });

      /* Each plate drifts against the track, so the run has depth rather
         than sliding as one flat strip. */
      const setters = gsap.utils
        .toArray<HTMLElement>(".card__frame .img-wrap")
        .map((n) => gsap.quickSetter(n, "xPercent"));
      const frames = gsap.utils.toArray<HTMLElement>(".card__frame");

      const parallax = () => {
        const vw = window.innerWidth;
        frames.forEach((f, idx) => {
          const r = f.getBoundingClientRect();
          const centre = (r.left + r.width / 2 - vw / 2) / vw; // -1 … 1
          setters[idx](gsap.utils.clamp(-9, 9, centre * -9));
        });
      };
      gsap.ticker.add(parallax);

      return () => {
        gsap.ticker.remove(parallax);
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(el, { clearProps: "x" });
      };
    });

    return () => mm.revert();
  }, []);

  /* Drag the run sideways; it drives the page scroll that the pin reads. */
  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;

    let dragging = false;
    let lastX = 0;

    const down = (e: PointerEvent) => {
      if (window.innerWidth < 769 || e.button !== 0) return;
      dragging = true;
      lastX = e.clientX;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      const lenis = getLenis();
      const y = (lenis?.scroll ?? window.scrollY) - dx * 1.6;
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    };
    const up = () => (dragging = false);

    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <section className="work" id="work" ref={root}>
      <div className="work__pin" ref={pin}>
        <div className="work__head">
          <span className="label">02 — Selected works</span>
          <span className="label work__count">
            {projects.length} projects · 2021—2024
          </span>
        </div>

        <div className="work__track" ref={track} data-cursor="drag">
          {projects.map((p, i) => (
            <Card project={p} i={i} key={p.slug} />
          ))}
          <div className="work__end">
            <span className="label">End of selection</span>
          </div>
        </div>

        <div className="work__rail">
          <div className="work__ticks">
            {projects.map((p) => (
              <span className="work__tick" key={p.slug} />
            ))}
          </div>
          <div className="work__gauge" />
        </div>
      </div>
    </section>
  );
}
