import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../lib/motion";
import { lockScroll, scrollToTop } from "../lib/useSmoothScroll";
import "./PageTransition.css";

type Ctx = { go: (to: string, label?: string) => void; busy: boolean };

const TransitionContext = createContext<Ctx>({ go: () => {}, busy: false });
export const useTransition = () => useContext(TransitionContext);

const COLUMNS = 5;

/**
 * Route changes are covered by a set of ink columns that sweep up, hold long
 * enough to swap the route and reset the scroller, then sweep off the top.
 * The destination's name sits in the hold so the wipe reads as an answer to
 * the click rather than a loading state.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const veil = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const busy = useRef(false);
  const [busyState, setBusyState] = useState(false);

  const go = useCallback(
    (to: string, name = "") => {
      if (busy.current) return;
      if (window.location.pathname === to) return;

      if (prefersReducedMotion()) {
        navigate(to);
        scrollToTop();
        requestAnimationFrame(() => ScrollTrigger.refresh());
        return;
      }

      busy.current = true;
      setBusyState(true);
      setLabel(name);
      lockScroll(true);

      const cols = veil.current!.querySelectorAll<HTMLElement>(".veil__col");
      const text = veil.current!.querySelector<HTMLElement>(".veil__label");

      const tl = gsap.timeline({
        onComplete: () => {
          busy.current = false;
          setBusyState(false);
          lockScroll(false);
        },
      });

      tl.set(veil.current, { pointerEvents: "auto" })
        .set(cols, { transformOrigin: "bottom center" })
        .to(cols, {
          scaleY: 1,
          duration: 0.72,
          ease: "expo.inOut",
          stagger: { each: 0.045, from: "start" },
        })
        .fromTo(
          text,
          { yPercent: 60, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "expo.out" },
          "-=0.28",
        )
        /* Swap the route while the screen is fully covered. */
        .add(() => {
          navigate(to);
          scrollToTop();
        })
        .to({}, { duration: 0.22 })
        .add(() => ScrollTrigger.refresh())
        .to(text, { yPercent: -50, autoAlpha: 0, duration: 0.4, ease: "expo.in" })
        .set(cols, { transformOrigin: "top center" })
        .to(
          cols,
          {
            scaleY: 0,
            duration: 0.78,
            ease: "expo.inOut",
            stagger: { each: 0.045, from: "end" },
          },
          "-=0.15",
        )
        .set(veil.current, { pointerEvents: "none" });
    },
    [navigate],
  );

  return (
    <TransitionContext.Provider value={{ go, busy: busyState }}>
      {children}
      <div className="veil" ref={veil} aria-hidden="true">
        {Array.from({ length: COLUMNS }, (_, i) => (
          <div className="veil__col" key={i} />
        ))}
        <span className="veil__label">{label}</span>
      </div>
    </TransitionContext.Provider>
  );
}
