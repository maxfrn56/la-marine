import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import logo from "../assets/photos/logo.png";
import { useReservation } from "../reservations/context";
import "./Footer.css";

export default function Footer() {
  const { open } = useReservation();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], ["40%", "0%"]);

  return (
    <footer className="footer" id="contact" ref={ref}>
      <div className="container footer-top">
        <div className="footer-invite">
          <span className="section-label">Larguez les amarres</span>
          <h2>
            Une table vous attend
            <em className="script"> face au port</em>
          </h2>
          <button type="button" className="footer-phone" onClick={open}>
            Réserver une table
          </button>
          <Link to="/contact" className="footer-phone footer-phone--ghost">
            Une demande particulière ?
          </Link>
          <a href="tel:0297500981" className="footer-phone footer-phone--ghost">
            02 97 50 09 81
          </a>
        </div>

        <div className="footer-infos">
          <div>
            <h3>Adresse</h3>
            <p>
              20 Quai de l’Océan
              <br />
              Port Maria — 56170 Quiberon
            </p>
          </div>
          <div>
            <h3>Horaires</h3>
            <p>
              Midi — jusqu’à 15h00
              <br />
              Soir — dès 18h00
            </p>
          </div>
          <div>
            <h3>Sur place</h3>
            <p>
              Terrasse face au port
              <br />
              Restauration au bar
            </p>
          </div>
          <div>
            <h3>Votre visite</h3>
            <p>
              1 à 2 heures à bord
              <br />
              Réservation conseillée
            </p>
          </div>
        </div>
      </div>

      <div className="footer-brand" aria-hidden>
        <motion.span className="script" style={{ y: titleY }}>
          La Marine
        </motion.span>
      </div>

      <div className="container footer-bottom">
        <img src={logo} alt="Logo La Marine" className="footer-logo" />
        <p>
          © 1915 – 2026 La Marine, Quiberon.
          {" · "}
          <Link to="/mentions-legales" className="footer-admin">
            Mentions légales
          </Link>
          {" · "}
          <Link to="/admin" className="footer-admin">
            Espace restaurateur
          </Link>
          <br />
          Développé et designé par{" "}
          <a
            href="https://www.maximefarineau.com/"
            className="footer-admin"
            target="_blank"
            rel="noopener noreferrer"
          >
            Maxime Farineau
          </a>
        </p>
        <button
          type="button"
          className="footer-up"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Retour en haut ↑
        </button>
      </div>
    </footer>
  );
}
