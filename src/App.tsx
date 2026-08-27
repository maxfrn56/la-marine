import { useEffect, useState } from "react";
import Lenis from "lenis";
import Preloader from "./components/Preloader";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Histoire from "./components/Histoire";
import Carte from "./components/Carte";
import Bar from "./components/Bar";
import Galerie from "./components/Galerie";
import Avis from "./components/Avis";
import Footer from "./components/Footer";

export default function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let raf: number;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  // Bloque le scroll pendant le preloader
  useEffect(() => {
    document.body.style.overflow = loaded ? "" : "hidden";
  }, [loaded]);

  return (
    <>
      <Preloader onComplete={() => setLoaded(true)} />
      <Nav />
      <main>
        <Hero started={loaded} />
        <Marquee />
        <Histoire />
        <Carte />
        <Bar />
        <Galerie />
        <Avis />
        <Footer />
      </main>
    </>
  );
}
