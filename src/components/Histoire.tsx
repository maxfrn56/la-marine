import { useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
  animate,
} from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import facade from "../assets/photos/facade.png";
import equipeSalle from "../assets/photos/equipe-salle.png";
import "./Histoire.css";

/* Révèle chaque ligne avec un masque, façon site primé */
function RevealLines({ lines, className }: { lines: string[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });

  return (
    <div ref={ref} className={className}>
      {lines.map((line, i) => (
        <div className="reveal-mask" key={i}>
          <motion.div
            initial={{ y: "110%" }}
            animate={inView ? { y: 0 } : {}}
            transition={{
              delay: 0.1 + i * 0.12,
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {line}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

/* Compteur animé */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const value = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useMotionValueEvent(value, "change", (v) => {
    setDisplay(Number.isInteger(to) ? Math.round(v).toString() : v.toFixed(1));
  });

  useEffect(() => {
    if (inView) {
      const controls = animate(value, to, { duration: 2, ease: [0.16, 1, 0.3, 1] });
      return controls.stop;
    }
  }, [inView, to, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function Histoire() {
  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: imgRef,
    offset: ["start end", "end start"],
  });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]), {
    stiffness: 90,
    damping: 25,
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [-2, 2]);

  return (
    <section className="histoire container" id="histoire">
      <span className="section-label">Notre histoire</span>

      <RevealLines
        className="histoire-title"
        lines={[
          "Un siècle face à l’océan,",
          "le plus vieux restaurant",
          "de Quiberon.",
        ]}
      />

      <div className="histoire-grid">
        <motion.div className="histoire-img" ref={imgRef} style={{ rotate }}>
          <motion.img
            src={facade}
            alt="Façade du bistrot La Marine sur le quai de l'Océan"
            style={{ y }}
          />
          <figcaption>20 quai de l’Océan — Port Maria</figcaption>
        </motion.div>

        <div className="histoire-text">
          <p>
            Depuis <strong>1915</strong>, La Marine veille sur le port Maria.
            Quatre générations de marins, de cuisiniers et d’habitués s’y sont
            croisées, entre le retour de pêche du matin et le dernier verre du
            soir.
          </p>
          <p>
            Ici, tout parle de la mer : les casiers suspendus, les cartes
            marines de la baie, le thon sculpté au-dessus du bar. Un bistrot de
            quartier devenu institution, où la sole arrive du bateau et où les
            cocktails se dégustent en terrasse, face aux chalutiers.
          </p>

          <Link to="/histoire" className="section-link">
            Toute notre histoire <span aria-hidden>→</span>
          </Link>

          <motion.div
            className="histoire-team"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src={equipeSalle} alt="L'équipe de La Marine en salle" />
            <span className="script">L’équipage</span>
          </motion.div>
        </div>
      </div>

      <div className="histoire-stats">
        {[
          { value: <Counter to={1915} />, label: "Année de naissance" },
          { value: <Counter to={111} />, label: "Ans de service" },
          { value: <Counter to={4.7} suffix="/5" />, label: "Note Google" },
          { value: <Counter to={885} />, label: "Avis clients" },
        ].map((stat, i) => (
          <motion.div
            className="histoire-stat"
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
