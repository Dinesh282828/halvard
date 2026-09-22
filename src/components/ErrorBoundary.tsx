import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * A site people are sent cold should never show a blank page. If something
 * throws, keep the studio's name and a way to reach them on screen.
 */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Halvard:", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <section className="crash">
        <span className="label">Halvard</span>
        <h1 className="heading">Something came loose.</h1>
        <p className="mono">
          Reload the page, or write to{" "}
          <a className="crash__link" href="mailto:hello@halvard.studio">
            hello@halvard.studio
          </a>
          .
        </p>
        <button className="label crash__btn" onClick={() => window.location.assign("/")}>
          Return to index
        </button>
      </section>
    );
  }
}
