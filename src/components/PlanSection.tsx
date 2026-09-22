import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/motion";
import { Img } from "./Img";
import "./PlanSection.css";

/*
  Vault House, ground floor. A central spine runs the length of the building
  with rooms hung off it — which is exactly what the photograph that replaces
  this drawing shows. Geometry is authored against a 1000 × 700 grid so the
  reveal can be expressed as percentages of the same box.

    envelope   60,80  →  940,560
    spine      72,292 →  928,348   (the slit the photograph opens from)
                                    → inset(41.71% 7.2% 50.29% 7.2%)
*/

const TREADS = Array.from({ length: 7 }, (_, i) => 404 + i * 19);

export function PlanSection() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* Land straight on the finished state: drawing complete, spine open,
       photograph in place. Nothing moves, but nothing is missing either. */
    if (prefersReducedMotion()) {
      const ctx = gsap.context(() => {
        gsap.set(".plan__drawing path", { strokeDashoffset: 0 });
        gsap.set(".plan__drawing", { opacity: 0.12 });
        gsap.set(".plan__photo", { clipPath: "inset(0% 0% 0% 0%)", autoAlpha: 1 });
        gsap.set(".plan-north, .plan__caption", { autoAlpha: 1 });
      }, root);
      return () => ctx.revert();
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin.current,
          /* Inner wrapper, not the <section> — see WorkGallery.tsx. */
          pin: pin.current,
          start: "top top",
          end: "+=320%",
          scrub: 0.7,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      /* 1. The building goes up: envelope, then the spine it hangs from,
            then partitions, then the things you draw last. */
      tl.to(".plan-envelope path", { strokeDashoffset: 0, duration: 1.4, stagger: 0.1 }, 0)
        .to(".plan-spine path", { strokeDashoffset: 0, duration: 1.2, stagger: 0.08 }, 0.5)
        .to(".plan-partition path", { strokeDashoffset: 0, duration: 1, stagger: 0.06 }, 1)
        .to(".plan-detail path", { strokeDashoffset: 0, duration: 0.9, stagger: 0.04 }, 1.6)
        .to(".plan-dims path", { strokeDashoffset: 0, duration: 0.8, stagger: 0.05 }, 2.1)
        .to(".plan-dims text, .plan-north", { autoAlpha: 1, duration: 0.5, stagger: 0.05 }, 2.4)
        .to(".plan-label, .plan-leader", { autoAlpha: 1, duration: 0.6, stagger: 0.07 }, 2.5)

        /* 2. Hold — let the finished drawing be read, then let the slit
              light up so there is something behind it before it opens. */
        .to({}, { duration: 0.9 })
        .to(".plan__photo", { autoAlpha: 1, duration: 0.8 }, "-=0.6")

        /* 3. The spine opens and the room it describes is behind it. */
        .to(".plan-label, .plan-leader, .plan-dims", { autoAlpha: 0, duration: 0.5 }, "reveal")
        .to(
          ".plan__photo",
          { clipPath: "inset(0% 0% 0% 0%)", duration: 2.2, ease: "power2.inOut" },
          "reveal",
        )
        .fromTo(
          ".plan__photo .img-wrap",
          { scale: 1.24 },
          { scale: 1, duration: 2.4, ease: "power2.out" },
          "reveal",
        )
        .to(".plan__drawing", { opacity: 0.12, duration: 1.4 }, "reveal+=0.5")
        .to(".plan__intro", { autoAlpha: 0, y: -20, duration: 0.7 }, "reveal")
        .fromTo(
          ".plan__caption",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          "reveal+=1.4",
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="plan" data-scheme="ink" ref={root}>
      <div className="plan__pin" ref={pin}>
      <div className="plan__intro">
        <span className="label">03 — Method</span>
        <h2 className="plan__heading">
          Every project starts as a line
          <br />
          and ends as a room you can stand in.
        </h2>
      </div>

      <div className="plan__stage">
        {/* The photograph, held inside the spine until the drawing is done. */}
        <div className="plan__photo">
          <Img
            name="arches"
            alt="The vaulted spine of Vault House, looking north"
            sizes="90vw"
          />
        </div>

        <svg
          className="plan__drawing"
          viewBox="0 0 1000 700"
          fill="none"
          role="img"
          aria-label="Ground floor plan of Vault House"
        >
          {/* ---- envelope ---- */}
          <g className="plan-envelope">
            <path pathLength={1} d="M60 80 H940 V560 H60 Z" />
            <path pathLength={1} d="M72 92 H928 V548 H72 Z" />
          </g>

          {/* ---- the spine ---- */}
          <g className="plan-spine">
            <path pathLength={1} d="M72 280 H928" />
            <path pathLength={1} d="M72 292 H928" />
            <path pathLength={1} d="M72 348 H928" />
            <path pathLength={1} d="M72 360 H928" />
          </g>

          {/* ---- rooms hung off it ---- */}
          <g className="plan-partition">
            <path pathLength={1} d="M262 92 V280 M274 92 V280" />
            <path pathLength={1} d="M474 92 V280 M486 92 V280" />
            <path pathLength={1} d="M686 92 V280 M698 92 V280" />
            <path pathLength={1} d="M372 360 V548 M384 360 V548" />
            <path pathLength={1} d="M646 360 V548 M658 360 V548" />
          </g>

          {/* ---- stair, door swings, fittings ---- */}
          <g className="plan-detail">
            <path pathLength={1} d="M396 396 V536 M540 396 V536" />
            {TREADS.map((y) => (
              <path pathLength={1} d={`M396 ${y} H540`} key={y} />
            ))}
            <path pathLength={1} d="M468 396 V536" strokeDasharray="6 6" />

            {/* door swings off the spine */}
            <path pathLength={1} d="M150 292 V280 M150 280 A 74 74 0 0 1 224 206" />
            <path pathLength={1} d="M820 348 V360 M820 360 A 74 74 0 0 0 746 434" />

            {/* threshold at the north end */}
            <path pathLength={1} d="M470 80 H530 M470 92 H530" />
          </g>

          {/* ---- dimensions ---- */}
          <g className="plan-dims">
            <path pathLength={1} d="M60 596 V616 M940 596 V616 M60 606 H940" />
            <path pathLength={1} d="M24 80 H44 M24 560 H44 M34 80 V560" />
            <text x="500" y="596" className="plan-dim-text">
              27.400
            </text>
            <text x="34" y="320" className="plan-dim-text" transform="rotate(-90 34 320)">
              14.900
            </text>
            {/* scale bar, clear of the overall dimension line */}
            <path pathLength={1} d="M760 656 H940 M760 651 V661 M850 651 V661 M940 651 V661" />
            <text x="850" y="682" className="plan-dim-text">
              0 — 5 — 10 m
            </text>
          </g>

          {/* ---- north ---- */}
          <g className="plan-north">
            <circle cx="920" cy="42" r="20" />
            <path d="M920 30 V54 M920 30 L915 38 M920 30 L925 38" />
            <text x="920" y="20" className="plan-dim-text">
              N
            </text>
          </g>

          {/* ---- room names ---- */}
          <g className="plan-labels">
            <text x="167" y="192" className="plan-label">Cabin 01</text>
            <text x="379" y="192" className="plan-label">Cabin 02</text>
            <text x="592" y="192" className="plan-label">Cabin 03</text>
            <text x="813" y="192" className="plan-label">Cabin 04</text>
            {/* Annotated above the band with a leader, since the band itself
                becomes the photograph. */}
            <text x="500" y="262" className="plan-label plan-label--key">The spine</text>
            <path className="plan-leader" d="M500 270 V288" />
            <text x="222" y="460" className="plan-label">Kitchen</text>
            <text x="468" y="386" className="plan-label">Stair</text>
            <text x="793" y="460" className="plan-label">Workshop</text>
          </g>
        </svg>
      </div>

      <div className="plan__caption">
        <span className="label">Vault House — Skagen, 2024</span>
        <span className="label">Ground floor · 1:200</span>
      </div>
      </div>
    </section>
  );
}
