import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../lib/motion";
import { bySlug, nextOf } from "../data/projects";
import { useTransition } from "../components/PageTransition";
import { Img } from "../components/Img";
import NotFound from "./NotFound";
import "./Project.css";

export default function ProjectPage() {
  const { slug } = useParams();
  const project = bySlug(slug);
  const root = useRef<HTMLElement>(null);
  const { go } = useTransition();

  useEffect(() => {
    if (!project) return;
    const refresh = () => ScrollTrigger.refresh();
    const id = window.setTimeout(refresh, 400);

    if (prefersReducedMotion()) return () => window.clearTimeout(id);

    const ctx = gsap.context(() => {
      gsap.from(".proj__line", {
        yPercent: 108,
        duration: 1.3,
        stagger: 0.1,
        ease: "expo.out",
        delay: 0.15,
      });
      gsap.from(".proj__rise", {
        y: 26,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.06,
        delay: 0.5,
      });

      /* Cover drifts as the page moves off it. */
      gsap.to(".proj__cover .img-wrap", {
        yPercent: 14,
        ease: "none",
        scrollTrigger: { trigger: ".proj__hero", start: "top top", end: "bottom top", scrub: true },
      });

      gsap.utils.toArray<HTMLElement>(".proj__plate").forEach((plate) => {
        gsap.from(plate, {
          y: 60,
          autoAlpha: 0,
          duration: 1.1,
          scrollTrigger: { trigger: plate, start: "top 88%" },
        });
      });

      gsap.from(".proj__para", {
        y: 30,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.12,
        scrollTrigger: { trigger: ".proj__body", start: "top 80%" },
      });

      gsap.from(".proj__spec-item", {
        y: 20,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.06,
        scrollTrigger: { trigger: ".proj__spec", start: "top 85%" },
      });
    }, root);

    return () => {
      window.clearTimeout(id);
      ctx.revert();
    };
  }, [project, slug]);

  if (!project) return <NotFound />;
  const next = nextOf(project.slug);

  return (
    <article className="proj" ref={root} key={project.slug}>
      <header className="proj__hero">
        <div className="proj__cover">
          <Img
            name={project.cover}
            alt={`${project.title}, ${project.place}`}
            priority
            sizes="100vw"
          />
        </div>
      </header>

      <div className="proj__title-block">
        <span className="label proj__rise">
          {project.index} — {project.typology}
        </span>
        <h1 className="proj__title">
          <span className="line-mask">
            <span className="proj__line">{project.title}</span>
          </span>
        </h1>
        <span className="mono proj__rise proj__where">
          {project.place} · {project.year}
        </span>
      </div>

      <section className="proj__spec">
        {(
          [
            ["Location", project.place],
            ["Completed", project.year],
            ["Area", project.area],
            ["Status", project.status],
          ] as const
        ).map(([k, v]) => (
          <div className="proj__spec-item" key={k}>
            <span className="label">{k}</span>
            <span className="proj__spec-val">{v}</span>
          </div>
        ))}
      </section>

      <section className="proj__body">
        {project.body.map((p, i) => (
          <p className="proj__para" key={i}>
            {p}
          </p>
        ))}
      </section>

      <section className="proj__plates">
        {project.plates.map((plate, i) => (
          <figure className="proj__plate" data-span={plate.span} key={i}>
            <div className="proj__plate-img">
              <Img
                name={plate.src}
                alt={plate.caption}
                sizes={plate.span === "full" ? "92vw" : "46vw"}
              />
            </div>
            <figcaption className="label">
              <span className="proj__fig">Fig. {String(i + 1).padStart(2, "0")}</span>
              {plate.caption}
            </figcaption>
          </figure>
        ))}
      </section>

      <section className="proj__credits">
        <span className="label proj__credits-head">Credits</span>
        <dl className="proj__credits-list">
          {project.credits.map(([k, v]) => (
            <div key={k}>
              <dt className="label">{k}</dt>
              <dd className="mono">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <a
        className="proj__next"
        href={`/work/${next.slug}`}
        data-cursor="open"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          go(`/work/${next.slug}`, next.title);
        }}
      >
        <div className="proj__next-media">
          <Img name={next.cover} alt="" sizes="30vw" />
        </div>
        <div className="proj__next-copy">
          <span className="label">Next project — {next.index}</span>
          <h2 className="proj__next-title">{next.title}</h2>
          <span className="mono">
            {next.typology} · {next.place}
          </span>
        </div>
      </a>
    </article>
  );
}
