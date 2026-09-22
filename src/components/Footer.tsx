import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap, prefersReducedMotion } from "../lib/motion";
import "./Footer.css";

const NBSP = " ";

/**
 * Letters roll up and are replaced by a second copy of themselves.
 * Split per character with a positional delay so the swap reads left to right.
 */
function RollLink({ text, href }: { text: string; href: string }) {
  return (
    <a className="roll" href={href} data-cursor="link" aria-label={text}>
      <span className="roll__inner" aria-hidden="true">
        {[...text].map((c, i) => {
          /* Flex items collapse ordinary spaces, so hold them open. */
          const glyph = c === " " ? NBSP : c;
          return (
            <span
              className="roll__char"
              key={i}
              style={{ "--d": `${i * 16}ms` } as CSSProperties}
            >
              <span className="roll__a">{glyph}</span>
              <span className="roll__b">{glyph}</span>
            </span>
          );
        })}
      </span>
    </a>
  );
}

function StudioClock() {
  const [now, setNow] = useState("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Copenhagen",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="label">
      Copenhagen <span className="tnum foot__clock">{now}</span>
    </span>
  );
}

export function Footer() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".foot__line", {
        yPercent: 105,
        duration: 1.2,
        stagger: 0.09,
        ease: "expo.out",
        scrollTrigger: { trigger: ".foot__call", start: "top 85%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <footer className="foot" id="contact" data-scheme="ink" ref={root}>
      <div className="foot__call">
        <span className="label">06 — Contact</span>
        <h2 className="foot__head">
          <span className="line-mask">
            <span className="foot__line">Tell us what</span>
          </span>
          <span className="line-mask">
            <span className="foot__line">should outlast us.</span>
          </span>
        </h2>
      </div>

      <div className="foot__cols">
        <div className="foot__col">
          <span className="label">Enquiries</span>
          <RollLink text="hello@halvard.studio" href="mailto:hello@halvard.studio" />
          <RollLink text="+45 32 14 88 02" href="tel:+4532148802" />
        </div>

        <div className="foot__col">
          <span className="label">Studios</span>
          <p className="foot__addr">
            Refshalevej 153
            <br />
            1432 København K
          </p>
          <p className="foot__addr">
            Rua da Boavista 84
            <br />
            1200-068 Lisboa
          </p>
        </div>

        <div className="foot__col">
          <span className="label">Elsewhere</span>
          <RollLink text="Instagram" href="https://instagram.com" />
          <RollLink text="Are.na" href="https://are.na" />
          <RollLink text="LinkedIn" href="https://linkedin.com" />
        </div>
      </div>

      <div className="foot__base">
        <span className="label">© 2026 Halvard Studio ApS</span>
        <span className="label foot__cvr">CVR 38 22 91 04</span>
        <StudioClock />
      </div>
    </footer>
  );
}
