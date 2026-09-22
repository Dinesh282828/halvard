import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { gsap, ScrollTrigger } from "../lib/motion";
import { useTransition } from "./PageTransition";
import { getLenis } from "../lib/useSmoothScroll";
import "./Nav.css";

const LINKS = [
  { label: "Work", target: "#work" },
  { label: "Practice", target: "#practice" },
  { label: "Contact", target: "#contact" },
];

export function Nav() {
  const root = useRef<HTMLElement>(null);
  const { go } = useTransition();
  const { pathname } = useLocation();
  const onHome = pathname === "/";

  /* Hide going down, show coming back up. */
  useEffect(() => {
    const el = root.current!;
    const show = gsap.quickTo(el, "yPercent", { duration: 0.5, ease: "expo.out" });
    let hidden = false;

    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const past = self.scroll() > 120;
        el.dataset.pinned = String(past);
        const down = self.direction === 1 && past;
        if (down !== hidden) {
          hidden = down;
          show(down ? -110 : 0);
        }
      },
    });
    return () => st.kill();
  }, []);

  /* Flip to light-on-dark while an inverted section sits under the bar. */
  useEffect(() => {
    const el = root.current!;
    const make = () =>
      gsap.utils.toArray<HTMLElement>("[data-scheme='ink']").map((section) =>
        ScrollTrigger.create({
          trigger: section,
          start: "top 60px",
          end: "bottom 60px",
          onToggle: (self) => el.classList.toggle("nav--inverted", self.isActive),
        }),
      );

    let triggers = make();
    /* Sections mount with the route, so rebuild once the DOM has settled. */
    const id = window.setTimeout(() => {
      triggers.forEach((t) => t.kill());
      triggers = make();
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      window.clearTimeout(id);
      triggers.forEach((t) => t.kill());
      el.classList.remove("nav--inverted");
    };
  }, [pathname]);

  const jump = (e: React.MouseEvent, target: string) => {
    e.preventDefault();
    if (!onHome) {
      go("/", "Index");
      return;
    }
    const node = document.querySelector(target);
    if (!node) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(node as HTMLElement, { offset: 0 });
    else node.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="nav" ref={root}>
      <a
        className="nav__mark"
        href="/"
        data-cursor="link"
        onClick={(e) => {
          e.preventDefault();
          go("/", "Index");
        }}
      >
        Halvard
        <span className="nav__reg">®</span>
      </a>

      <nav className="nav__links" aria-label="Primary">
        {onHome ? (
          LINKS.map((l) => (
            <a
              key={l.label}
              className="nav__link label"
              href={l.target}
              data-cursor="link"
              onClick={(e) => jump(e, l.target)}
            >
              <span>{l.label}</span>
            </a>
          ))
        ) : (
          <a
            className="nav__link label"
            href="/"
            data-cursor="link"
            onClick={(e) => {
              e.preventDefault();
              go("/", "Index");
            }}
          >
            <span>Close</span>
          </a>
        )}
      </nav>
    </header>
  );
}
