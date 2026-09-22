import { useTransition } from "../components/PageTransition";

export default function NotFound() {
  const { go } = useTransition();
  return (
    <section
      style={{
        minHeight: "100svh",
        display: "grid",
        placeContent: "center",
        gap: "1.5rem",
        textAlign: "center",
        padding: "var(--margin)",
      }}
    >
      <span className="label">Error 404</span>
      <h1 className="heading">Nothing stands here yet.</h1>
      <button
        className="label"
        data-cursor="link"
        style={{ textDecoration: "underline", textUnderlineOffset: "0.4em" }}
        onClick={() => go("/", "Index")}
      >
        Return to index
      </button>
    </section>
  );
}
