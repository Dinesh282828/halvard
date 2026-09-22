import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource-variable/instrument-sans/standard.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";

import "./styles/tokens.css";
import "./styles/base.css";

import App from "./App";

/* StrictMode is deliberately off. Its double-invoked effects re-run the
   imperative GSAP timelines that drive this page, which produces artefacts
   that only exist in development. Every effect here still cleans up. */
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
