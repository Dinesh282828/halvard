import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import { Cursor } from "./components/Cursor";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Nav } from "./components/Nav";
import { Preloader } from "./components/Preloader";
import { TransitionProvider } from "./components/PageTransition";
import { useSmoothScroll } from "./lib/useSmoothScroll";

import Home from "./pages/Home";
import ProjectPage from "./pages/Project";
import NotFound from "./pages/NotFound";

export default function App() {
  useSmoothScroll();
  const [ready, setReady] = useState(false);

  return (
    <TransitionProvider>
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Preloader onDone={() => setReady(true)} />
      <Nav />

      <main id="main">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home ready={ready} />} />
            <Route path="/work/:slug" element={<ProjectPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </TransitionProvider>
  );
}
