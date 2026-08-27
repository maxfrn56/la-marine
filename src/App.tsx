import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import Preloader from "./components/Preloader";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CartePage from "./pages/CartePage";
import CocktailsPage from "./pages/CocktailsPage";
import HistoirePage from "./pages/HistoirePage";

function AnimatedRoutes({ started }: { started: boolean }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home started={started} />} />
        <Route path="/carte" element={<CartePage />} />
        <Route path="/cocktails" element={<CocktailsPage />} />
        <Route path="/histoire" element={<HistoirePage />} />
      </Routes>
    </AnimatePresence>
  );
}

function ScrollReset({ lenis }: { lenis: Lenis | null }) {
  const { pathname } = useLocation();

  useEffect(() => {
    // remonte en haut à chaque changement de page, sans inertie
    lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname, lenis]);

  return null;
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    setLenis(instance);

    let raf: number;
    const loop = (time: number) => {
      instance.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      instance.destroy();
    };
  }, []);

  // Bloque le scroll pendant le preloader
  useEffect(() => {
    document.body.style.overflow = loaded ? "" : "hidden";
  }, [loaded]);

  return (
    <BrowserRouter>
      <Preloader onComplete={() => setLoaded(true)} />
      <ScrollReset lenis={lenis} />
      <Nav />
      <main>
        <AnimatedRoutes started={loaded} />
      </main>
      <Footer />
    </BrowserRouter>
  );
}
