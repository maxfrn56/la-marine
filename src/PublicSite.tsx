import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import Preloader from "./components/Preloader";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CartePage from "./pages/CartePage";
import CocktailsPage from "./pages/CocktailsPage";
import HistoirePage from "./pages/HistoirePage";
import ContactPage from "./pages/ContactPage";
import MentionsPage from "./pages/MentionsPage";
import { ReservationProvider } from "./reservations/ReservationProvider";

function AnimatedRoutes({ started }: { started: boolean }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home started={started} />} />
        <Route path="/carte" element={<CartePage />} />
        <Route path="/cocktails" element={<CocktailsPage />} />
        <Route path="/histoire" element={<HistoirePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/mentions-legales" element={<MentionsPage />} />
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

export default function PublicSite() {
  const [loaded, setLoaded] = useState(false);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      prevent: (node) => node.closest("[data-lenis-prevent]") != null,
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
    return () => {
      document.body.style.overflow = "";
    };
  }, [loaded]);

  // Pendant la réservation, Lenis lâche le trackpad pour le panneau.
  useEffect(() => {
    if (!lenis) return;
    const sync = () => {
      const locked =
        document.documentElement.classList.contains("booking-open") ||
        document.documentElement.classList.contains("nav-open");
      if (locked) lenis.stop();
      else lenis.start();
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      observer.disconnect();
      lenis.start();
    };
  }, [lenis]);

  return (
    <ReservationProvider>
      <Preloader onComplete={() => setLoaded(true)} />
      <ScrollReset lenis={lenis} />
      <Nav />
      <main>
        <AnimatedRoutes started={loaded} />
      </main>
      <Footer />
    </ReservationProvider>
  );
}
