import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import carpaccio from "../assets/photos/carpaccio.png";
import entreeVerte from "../assets/photos/entree-verte.png";
import ginTonic from "../assets/photos/gin-tonic.png";
import logo from "../assets/photos/logo.png";
import "./Carte.css";

type Plat = {
  name: string;
  desc: string;
  price: string;
  image: string;
};

const plats: Plat[] = [
  {
    name: "Huîtres creuses de la baie",
    desc: "N°3 de Quiberon, vinaigre à l’échalote, pain de seigle",
    price: "14 €",
    image: logo,
  },
  {
    name: "Carpaccio de lieu jaune",
    desc: "Agrumes, radis, pickles d’oignon rouge & sésame noir",
    price: "16 €",
    image: carpaccio,
  },
  {
    name: "Crème de petits pois",
    desc: "Burrata crémeuse, huile fumée & tuile croustillante",
    price: "13 €",
    image: entreeVerte,
  },
  {
    name: "Sole meunière entière",
    desc: "Beurre aux algues de la presqu’île, grenailles rôties",
    price: "34 €",
    image: logo,
  },
  {
    name: "La planche du marin",
    desc: "Le grand format de l’écailler, à partager en terrasse",
    price: "42 €",
    image: ginTonic,
  },
];

export default function Carte() {
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

        <ul className="carte-list" onMouseLeave={() => setActive(null)}>
          {plats.map((plat, i) => (
            <motion.li
              key={plat.name}
              onMouseEnter={() => setActive(i)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ delay: i * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="carte-index">0{i + 1}</span>
              <div className="carte-plat">
                <h3>{plat.name}</h3>
                <p>{plat.desc}</p>
              </div>
              <span className="carte-price">{plat.price}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* aperçu du plat qui suit le curseur */}
      <motion.div
        className="carte-preview"
        style={{ x: springX, y: springY }}
        aria-hidden
      >
        <AnimatePresence mode="popLayout">
          {active !== null && (
            <motion.img
              key={active}
              src={plats[active].image}
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
