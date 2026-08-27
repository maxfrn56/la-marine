import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import cocktailFraise from "../assets/photos/cocktail-fraise.png";
import equipeBar from "../assets/photos/equipe-bar.png";
import "./Bar.css";

export default function Bar() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const cocktailY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const equipeY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const scriptX = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);

  return (
    <section className="bar" id="bar" ref={ref}>
      <motion.span className="bar-script script" style={{ x: scriptX }} aria-hidden>
        Excellents cocktails
      </motion.span>

      <div className="container bar-grid">
        <div className="bar-images">
          <motion.figure className="bar-img bar-img--cocktail" style={{ y: cocktailY }}>
            <img src={cocktailFraise} alt="Cocktail signature à la fraise au bar de La Marine" />
          </motion.figure>
          <motion.figure className="bar-img bar-img--equipe" style={{ y: equipeY }}>
            <img src={equipeBar} alt="L'équipe du bar de La Marine" />
          </motion.figure>
        </div>

        <div className="bar-text">
          <span className="section-label">Le bar</span>
          <h2>
            Du dernier casier remonté
            <em className="script"> au dernier verre servi</em>
          </h2>
          <p>
            Gins de caractère, tonics d’artisans et fruits frais du marché :
            l’équipe du bar compose des cocktails qui font la réputation de la
            maison. À déguster au comptoir, sous le regard du vieux marin, ou
            en terrasse quand le soleil tombe sur le port.
          </p>
          <ul className="bar-highlights">
            <li>Terrasse face au port</li>
            <li>Restauration au bar</li>
            <li>Cocktails signature</li>
          </ul>
          <Link to="/cocktails" className="bar-cta">
            L’univers des cocktails
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
