import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import salle from "../assets/photos/salle.png";
import facade from "../assets/photos/facade.png";
import carpaccio from "../assets/photos/carpaccio.png";
import equipeBar from "../assets/photos/equipe-bar.png";
import cocktailFraise from "../assets/photos/cocktail-fraise.png";
import equipeSalle from "../assets/photos/equipe-salle.png";
import "./Galerie.css";

const photos = [
  { src: salle, caption: "La salle & ses cartes marines", wide: true },
  { src: cocktailFraise, caption: "Signature fraise, au comptoir", wide: false },
  { src: facade, caption: "Quai de l’Océan, depuis 1915", wide: true },
  { src: carpaccio, caption: "Lieu jaune en carpaccio", wide: false },
  { src: equipeBar, caption: "L’équipe du bar", wide: true },
  { src: equipeSalle, caption: "L’équipage en salle", wide: false },
];

export default function Galerie() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const x = useTransform(scrollYProgress, [0, 1], ["4%", "-64%"]);

  return (
    <div className="galerie" id="galerie" ref={ref}>
      <div className="galerie-sticky">
        <div className="galerie-head container">
          <span className="section-label">Galerie</span>
          <h2>
            L’ambiance <em className="script">à bord</em>
          </h2>
        </div>

        <motion.div className="galerie-track" style={{ x }}>
          {photos.map((photo) => (
            <figure
              key={photo.caption}
              className={`galerie-item ${photo.wide ? "galerie-item--wide" : ""}`}
            >
              <div className="galerie-item-frame">
                <img src={photo.src} alt={photo.caption} />
              </div>
              <figcaption>{photo.caption}</figcaption>
            </figure>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
