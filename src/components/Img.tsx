import { placeholders } from "../data/placeholders";
import "./Img.css";

type Props = {
  name: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Every photograph on the site goes through here so they all share the same
 * behaviour: a 20px inlined preview paints immediately on the wrapper, the
 * real file fades in over it, and nothing below the fold is fetched until it
 * is close.
 */
export function Img({ name, alt, sizes = "100vw", priority, className }: Props) {
  return (
    <span
      className={["img-wrap", className].filter(Boolean).join(" ")}
      style={{ backgroundImage: `url("${placeholders[name]}")` }}
    >
      <img
        className="img"
        src={`/img/${name}-lg.webp`}
        srcSet={`/img/${name}-sm.webp 800w, /img/${name}-lg.webp 1600w`}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        draggable={false}
        onLoad={(e) => {
          e.currentTarget.dataset.loaded = "true";
        }}
      />
    </span>
  );
}
