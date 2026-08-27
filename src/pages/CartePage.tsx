import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import PageTransition from "../components/PageTransition";
import PageHeader from "../components/PageHeader";
import carpaccio from "../assets/photos/carpaccio.png";
import entreeVerte from "../assets/photos/entree-verte.png";
import salle from "../assets/photos/salle.png";
import "./CartePage.css";

type Item = { name: string; desc: string; price: string };
type Section = { index: string; label: string; script: string; items: Item[] };

const sections: Section[] = [
  {
    index: "01",
    label: "Pour commencer",
    script: "Mise en bouche",
    items: [
      {
        name: "Huîtres creuses de la baie",
        desc: "N°3 de Quiberon, vinaigre à l’échalote — les 6 / les 12",
        price: "14 / 24 €",
      },
      {
        name: "Crème de petits pois",
        desc: "Burrata crémeuse, huile fumée & tuile croustillante",
        price: "13 €",
      },
      {
        name: "Foie gras de la maison",
        desc: "Chutney d’oignons de Roscoff, brioche toastée",
        price: "15 €",
      },
      {
        name: "Rillettes de sardine fumée",
        desc: "Citron confit, pain de seigle grillé",
        price: "11 €",
      },
      {
        name: "Soupe de poissons de roche",
        desc: "Rouille, croûtons & emmental râpé",
        price: "12 €",
      },
    ],
  },
  {
    index: "02",
    label: "L’écailler",
    script: "Vue sur le port",
    items: [
      {
        name: "Le plateau du marin",
        desc: "Huîtres, bulots, crevettes bouquet, bigorneaux & tourteau",
        price: "36 €",
      },
      {
        name: "La planche maxi",
        desc: "Le grand format à partager, comme les habitués",
        price: "48 €",
      },
      {
        name: "Bulots de casier",
        desc: "Mayonnaise maison au citron",
        price: "12 €",
      },
      {
        name: "Crevettes bouquet",
        desc: "Beurre demi-sel de la presqu’île",
        price: "13 €",
      },
    ],
  },
  {
    index: "03",
    label: "Le retour de pêche",
    script: "Selon la criée",
    items: [
      {
        name: "Sole meunière entière",
        desc: "Beurre aux algues, pommes grenailles rôties",
        price: "34 €",
      },
      {
        name: "Carpaccio de lieu jaune",
        desc: "Agrumes, radis, pickles d’oignon rouge & sésame noir",
        price: "16 €",
      },
      {
        name: "Pavé de thon de ligne",
        desc: "Mi-cuit, écrasé de pommes de terre au chorizo",
        price: "26 €",
      },
      {
        name: "Moules de bouchot",
        desc: "Marinières ou à la crème, frites maison",
        price: "16 €",
      },
      {
        name: "La pêche du jour",
        desc: "À l’ardoise, selon l’arrivage du matin",
        price: "selon criée",
      },
    ],
  },
  {
    index: "04",
    label: "Douceurs",
    script: "Pour finir en beauté",
    items: [
      {
        name: "Far breton de grand-mère",
        desc: "Aux pruneaux, comme il se doit",
        price: "8 €",
      },
      {
        name: "Kouign-amann tiède",
        desc: "Caramel au beurre salé, glace vanille",
        price: "9 €",
      },
      {
        name: "Riz au lait de la maison",
        desc: "Caramel laitier & éclats de sablé breton",
        price: "8 €",
      },
      {
        name: "Café gourmand",
        desc: "Trois douceurs du moment",
        price: "10 €",
      },
    ],
  },
];

function MenuSection({ section, flip }: { section: Section; flip: boolean }) {
  return (
    <div className={`carte-page-section ${flip ? "carte-page-section--flip" : ""}`}>
      <div className="carte-page-section-head">
        <div className="carte-page-sticky">
          <span className="carte-page-index">{section.index}</span>
          <h2>{section.label}</h2>
          <span className="script">{section.script}</span>
        </div>
      </div>

      <ul className="carte-page-items">
        {section.items.map((item, i) => (
          <motion.li
            key={item.name}
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ delay: i * 0.06, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="carte-page-item-line">
              <h3>{item.name}</h3>
              <span className="carte-page-dots" aria-hidden />
              <span className="carte-page-price">{item.price}</span>
            </div>
            <p>{item.desc}</p>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export default function CartePage() {
  const bandRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: bandRef,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["-4%", "8%"]);

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
          <span>20 – 40 € par personne</span>
          <i>✦</i>
          <span>Produits selon arrivage</span>
        </motion.div>

        <div className="container">
          <MenuSection section={sections[0]} flip={false} />
          <MenuSection section={sections[1]} flip />
        </div>

        {/* interlude visuel */}
        <div className="carte-page-band" ref={bandRef}>
          <motion.figure style={{ y: y1 }} className="carte-page-band-img">
            <img src={carpaccio} alt="Carpaccio de lieu jaune" />
          </motion.figure>
          <motion.figure style={{ y: y2 }} className="carte-page-band-img carte-page-band-img--small">
            <img src={entreeVerte} alt="Crème de petits pois, burrata" />
          </motion.figure>
          <motion.figure style={{ y: y1 }} className="carte-page-band-img">
            <img src={salle} alt="La salle de La Marine" />
          </motion.figure>
        </div>

        <div className="container">
          <MenuSection section={sections[2]} flip={false} />
          <MenuSection section={sections[3]} flip />
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
