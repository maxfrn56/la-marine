import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { useContent } from "../content/context";
import { dishImage } from "../content/images";
import "./Carte.css";

/* La home met en avant les plats cochés « vitrine » dans le back-office. */
const MAX_ON_HOME = 5;

export default function Carte() {
  const { featuredDishes, dishes, loading } = useContent();
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 120, damping: 18 });
  const springY = useSpring(y, { stiffness: 120, damping: 18 });

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  // Sans sélection vitrine, on retombe sur les premiers plats de la carte.
  const selection = (featuredDishes.length ? featuredDishes : dishes).slice(0, MAX_ON_HOME);

  return (
    <section className="carte" id="carte" ref={sectionRef} onMouseMove={onMouseMove}>
      <div className="container">
        <span className="section-label">La carte</span>
        <h2 className="carte-title">
          Le retour de pêche, <em className="script">en direct du port</em>
        </h2>
        <p className="carte-sub">
          Une carte courte, dictée par la criée du matin. Comptez 20 à 40 €
          par personne.
        </p>

        {loading && !selection.length ? (
          <p className="carte-state">Chargement de la carte…</p>
        ) : (
          <ul className="carte-list" onMouseLeave={() => setActive(null)}>
            {selection.map((dish, i) => (
              <motion.li
                key={dish.id}
                onMouseEnter={() => setActive(i)}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{ delay: i * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="carte-index">{String(i + 1).padStart(2, "0")}</span>
                <div className="carte-plat">
                  <h3>{dish.name}</h3>
                  <p>{dish.description}</p>
                </div>
                <span className="carte-price">{dish.price}</span>
              </motion.li>
            ))}
          </ul>
        )}

        <Link to="/carte" className="section-link">
          Voir la carte complète <span aria-hidden>→</span>
        </Link>
      </div>

      {/* aperçu du plat qui suit le curseur */}
      <motion.div
        className="carte-preview"
        style={{ x: springX, y: springY }}
        aria-hidden
      >
        <AnimatePresence mode="popLayout">
          {active !== null && selection[active] && (
            <motion.img
              key={selection[active].id}
              src={dishImage(selection[active])}
              alt=""
              initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.7, rotate: 6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
