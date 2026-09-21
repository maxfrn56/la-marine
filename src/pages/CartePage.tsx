import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import PageTransition from "../components/PageTransition";
import PageHeader from "../components/PageHeader";
import { useContent } from "../content/context";
import type { Category, Dish } from "../api/types";
import carpaccio from "../assets/photos/carpaccio.png";
import entreeVerte from "../assets/photos/entree-verte.png";
import salle from "../assets/photos/salle.png";
import "./CartePage.css";

function MenuSection({
  category,
  index,
  dishes,
  flip,
}: {
  category: Category;
  index: number;
  dishes: Dish[];
  flip: boolean;
}) {
  if (!dishes.length) return null;

  return (
    <div className={`carte-page-section ${flip ? "carte-page-section--flip" : ""}`}>
      <div className="carte-page-section-head">
        <div className="carte-page-sticky">
          <span className="carte-page-index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h2>{category.label}</h2>
          <span className="script">{category.script}</span>
        </div>
      </div>

      <ul className="carte-page-items">
        {dishes.map((dish, i) => (
          <motion.li
            key={dish.id}
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ delay: i * 0.06, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="carte-page-item-line">
              <h3>{dish.name}</h3>
              <span className="carte-page-dots" aria-hidden />
              <span className="carte-page-price">{dish.price}</span>
            </div>
            {dish.description && <p>{dish.description}</p>}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export default function CartePage() {
  const { categories, dishesOf, loading, error } = useContent();
  const bandRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: bandRef,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["-4%", "8%"]);

  // L'interlude photo se glisse au milieu de la carte.
  const split = Math.ceil(categories.length / 2);

  return (
    <PageTransition>
      <div className="carte-page">
        <PageHeader
          kicker="Fruits de mer & poisson"
          title="La Carte"
          intro="Une carte courte, dictée chaque matin par la criée de Port Maria. Produits de la baie, beurre de la presqu’île, et rien qui ne vienne de plus loin que l’horizon."
        />

        <motion.div
          className="carte-page-note"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>Midi &amp; soir</span>
          <i>✦</i>
          <span>Produits selon arrivage</span>
        </motion.div>

        {loading && <p className="carte-page-state">Chargement de la carte…</p>}
        {error && <p className="carte-page-state">{error}</p>}

        <div className="container">
          {categories.slice(0, split).map((category, i) => (
            <MenuSection
              key={category.slug}
              category={category}
              index={i}
              dishes={dishesOf(category.slug)}
              flip={i % 2 === 1}
            />
          ))}
        </div>

        {/* interlude visuel */}
        <div className="carte-page-band" ref={bandRef}>
          <motion.figure style={{ y: y1 }} className="carte-page-band-img">
            <img src={carpaccio} alt="Carpaccio de lieu jaune" />
          </motion.figure>
          <motion.figure
            style={{ y: y2 }}
            className="carte-page-band-img carte-page-band-img--small"
          >
            <img src={entreeVerte} alt="Crème de petits pois, burrata" />
          </motion.figure>
          <motion.figure style={{ y: y1 }} className="carte-page-band-img">
            <img src={salle} alt="La salle de La Marine" />
          </motion.figure>
        </div>

        <div className="container">
          {categories.slice(split).map((category, i) => (
            <MenuSection
              key={category.slug}
              category={category}
              index={split + i}
              dishes={dishesOf(category.slug)}
              flip={(split + i) % 2 === 1}
            />
          ))}
        </div>

        <motion.div
          className="carte-page-chef container"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="script">« On ne cuisine que ce que la mer veut bien nous donner. »</p>
          <span>— La cuisine de La Marine</span>
          <a href="tel:0297500981" className="carte-page-cta">
            Réserver une table
          </a>
        </motion.div>
      </div>
    </PageTransition>
  );
}
