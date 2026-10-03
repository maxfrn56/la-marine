import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import logo from "../assets/photos/logo.png";
import { useReservation } from "../reservations/context";
import "./Nav.css";

const links = [
  { label: "Accueil", to: "/" },
  { label: "Histoire", to: "/histoire" },
  { label: "La carte", to: "/carte" },
  { label: "Cocktails", to: "/cocktails" },
];

export default function Nav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { open } = useReservation();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(latest > previous && latest > 400);
    setScrolled(latest > 60);
  });

  return (
    <motion.header
      className={`nav ${scrolled ? "nav--scrolled" : ""}`}
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

      <button type="button" className="nav-cta" onClick={open}>
        <span>Réserver</span>
        <em>une table</em>
      </button>
    </motion.header>
  );
}
