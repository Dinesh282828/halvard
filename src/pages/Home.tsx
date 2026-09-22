import { useEffect } from "react";
import { ScrollTrigger } from "../lib/motion";

import { Hero } from "../components/Hero";
import { Manifesto } from "../components/Manifesto";
import { WorkGallery } from "../components/WorkGallery";
import { PlanSection } from "../components/PlanSection";
import { IndexList } from "../components/IndexList";
import { Recognition } from "../components/Recognition";
import { Footer } from "../components/Footer";

export default function Home({ ready }: { ready: boolean }) {
  /* Pins measure against final layout; fonts and images land after mount. */
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    const id = window.setTimeout(refresh, 600);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <Hero ready={ready} />
      <Manifesto />
      <WorkGallery />
      <PlanSection />
      <IndexList />
      <Recognition />
      <Footer />
    </>
  );
}
