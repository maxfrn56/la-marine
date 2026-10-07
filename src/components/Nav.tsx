import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import logo from "../assets/photos/logo.png";
import { useReservation } from "../reservations/context";
import "./Nav.css";

const links = [
  { label: "Accueil", to: "/" },
  { label: "Histoire", to: "/histoire" },
  { label: "La carte", to: "/carte" },
  { label: "Cocktails", to: "/cocktails" },
  { label: "Contact", to: "/contact" },
];

export default function Nav() {
  const { scrollY } = useScroll();
  const { pathname } = useLocation();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { open } = useReservation();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(latest > previous && latest > 400 && !menuOpen);
    setScrolled(latest > 60);
  });

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("nav-open", menuOpen);
    return () => document.documentElement.classList.remove("nav-open");
  }, [menuOpen]);

  return (
    <motion.header
      className={`nav ${scrolled || menuOpen ? "nav--scrolled" : ""}`}
      initial={{ y: -90 }}
      animate={{ y: hidden ? -90 : 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: hidden ? 0 : 0.1 }}
    >
      <Link to="/" className="nav-brand">
        <img src={logo} alt="Logo La Marine" className="nav-logo" />
        <span className="nav-brand-text">
          <span className="script">La Marine</span>
          <small>Quiberon · 1915</small>
        </span>
      </Link>

      <nav className="nav-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? "nav-link--active" : "")}
          >
            <span data-text={link.label}>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="nav-actions">
        <button
          type="button"
          className={`nav-burger ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <span />
          <span />
        </button>
        <button type="button" className="nav-cta" onClick={open}>
          <span>Réserver</span>
          <em>une table</em>
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="nav-drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {links.map((link, i) => (
              <motion.div
                key={link.to}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.08 + i * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <NavLink
                  to={link.to}
                  className={({ isActive }) => (isActive ? "nav-drawer-link is-on" : "nav-drawer-link")}
                >
                  {link.label}
                </NavLink>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
