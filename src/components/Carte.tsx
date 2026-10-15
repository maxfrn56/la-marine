import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useContent } from "../content/context";
import "./Carte.css";

/* La home met en avant les plats cochés « vitrine » dans le back-office. */
const MAX_ON_HOME = 5;

export default function Carte() {
  const { featuredDishes, dishes, loading } = useContent();

  // Sans sélection vitrine, on retombe sur les premiers plats de la carte.
  const selection = (featuredDishes.length ? featuredDishes : dishes).slice(0, MAX_ON_HOME);

  return (
    <section className="carte" id="carte">
      <div className="container">
        <span className="section-label">La carte</span>
        <h2 className="carte-title">
          Le retour de pêche, <em className="script">en direct du port</em>
        </h2>
        <p className="carte-sub">
          Une carte courte, dictée par la criée du matin et renouvelée au fil
          des arrivages.
        </p>

        {loading && !selection.length ? (
          <p className="carte-state">Chargement de la carte…</p>
        ) : (
          <ul className="carte-list">
            {selection.map((dish, i) => (
              <motion.li
                key={dish.id}
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
    </section>
  );
}
