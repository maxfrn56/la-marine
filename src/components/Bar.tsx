import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useContent } from "../content/context";
import { cocktailImage } from "../content/images";
import equipeBar from "../assets/photos/equipe-bar.png";
import "./Bar.css";

/* Les cocktails vedette remontent du back-office jusqu’à la home. */
const MAX_ON_HOME = 3;

export default function Bar() {
  const { featuredCocktails, cocktails } = useContent();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const cocktailY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const equipeY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const scriptX = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);

  const selection = (featuredCocktails.length ? featuredCocktails : cocktails).slice(
    0,
    MAX_ON_HOME
  );
  const vedette = selection[0];

  return (
    <section className="bar" id="bar" ref={ref}>
      <motion.span className="bar-script script" style={{ x: scriptX }} aria-hidden>
        Excellents cocktails
      </motion.span>

      <div className="container bar-grid">
        <div className="bar-images">
          <motion.figure className="bar-img bar-img--cocktail" style={{ y: cocktailY }}>
            <img
              src={vedette ? cocktailImage(vedette) : equipeBar}
              alt={
                vedette
                  ? `${vedette.name}, cocktail signature de La Marine`
                  : "Le bar de La Marine"
              }
            />
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
          {selection.length > 0 && (
            <ul className="bar-signatures">
              {selection.map((cocktail, i) => (
                <motion.li
                  key={cocktail.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="bar-signature-line">
                    <h3>{cocktail.name}</h3>
                    <span className="bar-signature-dots" aria-hidden />
                    <span className="bar-signature-price">{cocktail.price}</span>
                  </div>
                  {cocktail.recipe && <p>{cocktail.recipe}</p>}
                </motion.li>
              ))}
            </ul>
          )}

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
