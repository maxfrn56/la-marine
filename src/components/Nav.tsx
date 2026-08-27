import { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import logo from "../assets/photos/logo.png";
import "./Nav.css";

const links = [
  { label: "Histoire", href: "#histoire" },
  { label: "La carte", href: "#carte" },
  { label: "Le bar", href: "#bar" },
  { label: "Galerie", href: "#galerie" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(latest > previous && latest > 400);
    setScrolled(latest > 60);
  });

  useEffect(() => {
    // masque la nav pendant le preloader
    setHidden(false);
  }, []);

  return (
    <motion.header
      className={`nav ${scrolled ? "nav--scrolled" : ""}`}
      initial={{ y: -90 }}
      animate={{ y: hidden ? -90 : 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: hidden ? 0 : 0.1 }}
    >
      <a href="#" className="nav-brand">
        <img src={logo} alt="Logo La Marine" className="nav-logo" />
        <span className="nav-brand-text">
          <span className="script">La Marine</span>
          <small>Quiberon · 1915</small>
        </span>
      </a>

      <nav className="nav-links">
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            <span data-text={link.label}>{link.label}</span>
          </a>
        ))}
      </nav>

      <a href="tel:0297500981" className="nav-cta">
        <span>Réserver</span>
        <em>02 97 50 09 81</em>
      </a>
    </motion.header>
  );
}
