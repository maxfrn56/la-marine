import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import PageTransition from "../components/PageTransition";
import PageHeader from "../components/PageHeader";
import facade from "../assets/photos/facade.png";
import salle from "../assets/photos/salle.png";
import equipeSalle from "../assets/photos/equipe-salle.png";
import logo from "../assets/photos/logo.png";
import "./HistoirePage.css";

type Etape = {
  year: string;
  title: string;
  text: string;
  image?: string;
  imageAlt?: string;
};

const etapes: Etape[] = [
  {
    year: "1915",
    title: "Le comptoir des sardiniers",
    text: "Sur le quai de Port Maria, une petite buvette ouvre face aux chaloupes. On y sert du café au retour de pêche, du cidre le dimanche, et les nouvelles du large tous les jours.",
    image: logo,
    imageAlt: "Le médaillon du vieux marin, emblème de La Marine",
  },
  {
    year: "1930",
    title: "L’âge d’or de la sardine",
    text: "Quiberon compte alors des dizaines de conserveries. La Marine devient la cantine des équipages : soupe de poissons à midi, cartes et galoches le soir. Le surnom « chez les marins » lui restera.",
  },
  {
    year: "1954",
    title: "La deuxième génération",
    text: "La famille reprend la barre et installe les premières tables de restaurant. La sole meunière entre à la carte — elle n’en est jamais ressortie.",
    image: equipeSalle,
    imageAlt: "L'équipe de La Marine en salle",
  },
  {
    year: "1982",
    title: "Le bistrot des habitués",
    text: "Le zinc s’allonge, la terrasse gagne sur le quai. Touristes de l’été et pêcheurs de l’hiver s’y croisent autour des premiers plateaux de fruits de mer.",
  },
  {
    year: "2017",
    title: "Un coup de peinture, pas de lifting",
    text: "Grande rénovation : façade bleu nuit, salle habillée de cartes marines et de casiers. L’âme reste intacte — le thon sculpté veille toujours sur le bar.",
    image: facade,
    imageAlt: "La façade bleu nuit de La Marine",
  },
  {
    year: "2026",
    title: "Toujours à quai",
    text: "Cent onze ans plus tard, La Marine reste le plus vieux restaurant de Quiberon. La criée dicte la carte, l’équipe dicte l’ambiance, et l’océan fait le reste.",
    image: salle,
    imageAlt: "La salle actuelle et ses chaises turquoise",
  },
];

export default function HistoirePage() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 70%", "end 75%"],
  });
  const lineScale = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });

  return (
    <PageTransition>
      <div className="histoire-page">
        <PageHeader
          kicker="Depuis 1915"
          title="Notre histoire"
          intro="Cent onze ans de marées, quatre générations, une seule adresse : 20 quai de l’Océan. Voici la traversée, du comptoir des sardiniers au bistrot d’aujourd’hui."
        />

        <div className="histoire-page-timeline container" ref={timelineRef}>
          {/* fil qui se dessine au scroll */}
          <div className="histoire-page-line" aria-hidden>
            <motion.div
              className="histoire-page-line-fill"
              style={{ scaleY: lineScale }}
            />
          </div>

          {etapes.map((etape, i) => (
            <div
              key={etape.year}
              className={`histoire-page-etape ${i % 2 ? "histoire-page-etape--right" : ""}`}
            >
              <motion.div
                className="histoire-page-card"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12% 0px" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="histoire-page-year script">{etape.year}</span>
                <h2>{etape.title}</h2>
                <p>{etape.text}</p>
                {etape.image && (
                  <figure>
                    <img src={etape.image} alt={etape.imageAlt} />
                  </figure>
                )}
              </motion.div>
              <span className="histoire-page-dot" aria-hidden />
            </div>
          ))}
        </div>

        <motion.section
          className="histoire-page-quote"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="script">
            « Les restaurants passent, les marées restent. Nous, on a choisi de
            rester avec les marées. »
          </p>
          <span>— La Marine, quatre générations</span>
        </motion.section>
      </div>
    </PageTransition>
  );
}
