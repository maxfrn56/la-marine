import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import PageTransition from "../components/PageTransition";
import PageHeader from "../components/PageHeader";
import cocktailFraise from "../assets/photos/cocktail-fraise.png";
import ginTonic from "../assets/photos/gin-tonic.png";
import equipeBar from "../assets/photos/equipe-bar.png";
import "./CocktailsPage.css";

const signatures = [
  {
    name: "Le Vieux Marin",
    recipe: "Rhum ambré, citron vert, gingembre frais, sucre de canne",
    price: "11 €",
  },
  {
    name: "La Quiberonnaise",
    recipe: "Gin, fraises écrasées, basilic, mousse citronnée",
    price: "12 €",
  },
  {
    name: "Port Maria Spritz",
    recipe: "Apéritif d’algues bretonnes, prosecco, zeste d’orange",
    price: "10 €",
  },
  {
    name: "L’Abordage",
    recipe: "Whisky tourbé, caramel au beurre salé, bitter cacao",
    price: "12 €",
  },
  {
    name: "La Sirène",
    recipe: "Vodka, curaçao, tonic hysope, écume de mer",
    price: "11 €",
  },
];

const gins = [
  { name: "L’Acrobate", note: "Gin français, distillé à la main — vif & floral" },
  { name: "Hysope Tonic", note: "Le tonic bio français, sec comme un vent d’ouest" },
  { name: "Gin de la baie", note: "Infusé aux algues & au poivre timut, maison" },
];

export default function CocktailsPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 1, 0.4]);

  return (
    <PageTransition>
      <div className="cocktails-page">
        <PageHeader
          kicker="Le bar de La Marine"
          title="Cocktails"
          intro="Sous le regard du vieux marin, l’équipe du bar secoue, infuse et flambe. Fruits frais du marché, spiritueux d’artisans et une pincée d’embruns."
        />

        {/* halo turquoise du bar */}
        <motion.div className="cocktails-glow" style={{ opacity: glowOpacity }} aria-hidden />

        <div className="container cocktails-hero" ref={heroRef}>
          <div className="cocktails-hero-text">
            <span className="section-label">Les signatures</span>
            <h2>
              Cinq créations,
              <em className="script"> une seule marée</em>
            </h2>
            <p>
              La carte des cocktails change avec les saisons, mais les
              signatures restent à quai. Servies au comptoir ou en terrasse,
              de 18h à la fermeture.
            </p>
          </div>

          <motion.figure className="cocktails-hero-photo" style={{ y: photoY }}>
            <img src={cocktailFraise} alt="La Quiberonnaise, cocktail signature à la fraise" />
            <figcaption className="script">La Quiberonnaise</figcaption>
          </motion.figure>
        </div>

        <ul className="container cocktails-list">
          {signatures.map((cocktail, i) => (
            <motion.li
              key={cocktail.name}
              initial={{ opacity: 0, y: 44 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ delay: i * 0.07, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="cocktails-num">N°{i + 1}</span>
              <div>
                <h3>{cocktail.name}</h3>
                <p>{cocktail.recipe}</p>
              </div>
              <span className="cocktails-price">{cocktail.price}</span>
            </motion.li>
          ))}
        </ul>

        {/* gin & tonic */}
        <section className="cocktails-gin">
          <div className="container cocktails-gin-grid">
            <motion.figure
              className="cocktails-gin-photo"
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={ginTonic} alt="Gin tonic à L'Acrobate et tonic Hysope" />
            </motion.figure>

            <div className="cocktails-gin-text">
              <span className="section-label">Gin &amp; tonic</span>
              <h2>
                La cave à gins
                <em className="script"> du comptoir</em>
              </h2>
              <ul>
                {gins.map((gin, i) => (
                  <motion.li
                    key={gin.name}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-10% 0px" }}
                    transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h3>{gin.name}</h3>
                    <p>{gin.note}</p>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* l'heure du mousse */}
        <motion.section
          className="cocktails-happy container"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="script">L’heure du mousse</span>
          <h2>18h — 19h30</h2>
          <p>
            Tous les jours, les signatures à 8 € et l’huître offerte avec le
            premier verre. Sans réservation, premier arrivé, premier servi.
          </p>
        </motion.section>

        {/* équipe du bar */}
        <section className="cocktails-team">
          <motion.img
            src={equipeBar}
            alt="L'équipe du bar de La Marine"
            initial={{ scale: 1.12 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: "-5% 0px" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
          <blockquote>
            <p className="script">« Un bon cocktail, c’est comme la météo bretonne : ça surprend toujours. »</p>
            <cite>— L’équipe du bar</cite>
          </blockquote>
        </section>
      </div>
    </PageTransition>
  );
}
