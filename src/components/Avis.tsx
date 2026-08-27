import { motion } from "framer-motion";
import "./Avis.css";

const avis = [
  {
    text: "Franchement incroyable, on s’est régalés ! La sole était juste dingue, hyper bien cuite et pleine de goût.",
    author: "Fabienne",
    source: "Avis Google · avril",
  },
  {
    text: "Super rapport qualité-prix : huîtres, foie gras et crème de petits pois burrata. Service dans la bonne humeur, je recommande !",
    author: "Eloïse G.",
    source: "Avis Google",
  },
  {
    text: "Déjà venus il y a dix mois, et toujours aussi satisfaits. On a commencé par la planche maxi… un régal.",
    author: "Un habitué",
    source: "Pages Jaunes",
  },
];

export default function Avis() {
  return (
    <section className="avis">
      <div className="container">
        <div className="avis-head">
          <span className="section-label">Ils en parlent</span>
          <motion.div
            className="avis-note"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <strong>4,7</strong>
            <div>
              <span className="avis-stars" aria-label="4,7 étoiles sur 5">
                ★★★★★
              </span>
              <span className="avis-count">885 avis Google &amp; Tripadvisor</span>
            </div>
          </motion.div>
        </div>

        <div className="avis-grid">
          {avis.map((item, i) => (
            <motion.blockquote
              key={item.author}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ delay: i * 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="avis-quote script" aria-hidden>
                “
              </span>
              <p>{item.text}</p>
              <footer>
                <cite>{item.author}</cite>
                <small>{item.source}</small>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
