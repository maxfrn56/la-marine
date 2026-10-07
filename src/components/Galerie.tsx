import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import salle from "../assets/photos/salle.png";
import salon from "../assets/photos/salon.jpg";
import bar from "../assets/photos/bar.jpg";
import tableRonde from "../assets/photos/table-ronde.jpg";
import tableCopains from "../assets/photos/table-des-copains.jpg";
import claustra from "../assets/photos/claustra.jpg";
import facadeJour from "../assets/photos/facade-jour.jpg";
import facadeNuit from "../assets/photos/facade-nuit.jpg";
import equipeBar from "../assets/photos/equipe-bar.png";
import cocktailFraise from "../assets/photos/cocktail-fraise.png";
import equipeSalle from "../assets/photos/equipe-salle.png";
import "./Galerie.css";

const photos = [
  { src: facadeJour, caption: "Le quai, en plein jour", wide: true },
  { src: facadeNuit, caption: "La Marine, le soir venu", wide: true, panorama: true },
  { src: salon, caption: "La salle, Port Maria 1915", wide: true },
  { src: bar, caption: "Le comptoir et sa cloche", wide: false },
  { src: salle, caption: "La salle & ses cartes marines", wide: true },
  { src: tableRonde, caption: "Table ronde dressée", wide: false },
  { src: tableCopains, caption: "La grande table des copains", wide: false },
  { src: claustra, caption: "La table, derrière le claustra", wide: false },
  { src: cocktailFraise, caption: "Signature fraise, au comptoir", wide: false },
  { src: equipeBar, caption: "L’équipe du bar", wide: true },
  { src: equipeSalle, caption: "L’équipage en salle", wide: false },
];

export default function Galerie() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-84%"]);

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
                  className={`galerie-item ${photo.wide ? "galerie-item--wide" : ""}${
                    "panorama" in photo && photo.panorama ? " galerie-item--panorama" : ""
                  }`}
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
