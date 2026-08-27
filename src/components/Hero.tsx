import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import salle from "../assets/photos/salle.png";
import "./Hero.css";

const title = "La Marine";

export default function Hero({ started }: { started: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section className="hero" ref={ref}>
      <motion.div className="hero-bg" style={{ y: imageY, scale: imageScale }}>
        <img src={salle} alt="La salle du restaurant La Marine" />
        <div className="hero-bg-overlay" />
      </motion.div>

      <motion.div
        className="hero-content"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <motion.p
          className="hero-kicker"
          initial={{ opacity: 0, y: 20 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Bistrot · Restaurant · Bar — Port Maria, Quiberon
        </motion.p>

        <h1 className="hero-title script" aria-label={title}>
          {title.split("").map((char, i) => (
            <motion.span
              key={i}
              aria-hidden
              initial={{ y: "115%", rotate: 6, opacity: 0 }}
              animate={started ? { y: 0, rotate: 0, opacity: 1 } : {}}
              transition={{
                delay: 0.35 + i * 0.045,
                duration: 1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 26 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          Le plus vieux restaurant de Quiberon.
          <br />
          Fruits de mer, poissons sauvages &amp; cocktails, depuis 1915.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 26 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <a href="tel:0297500981" className="hero-btn hero-btn--gold">
            Réserver une table
          </a>
          <a href="#carte" className="hero-btn hero-btn--ghost">
            Découvrir la carte
          </a>
        </motion.div>
      </motion.div>

      {/* badge circulaire rotatif */}
      <motion.a
        href="#histoire"
        className="hero-badge"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={started ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 1.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg viewBox="0 0 120 120" className="hero-badge-text">
          <defs>
            <path
              id="badge-circle"
              d="M 60,60 m -44,0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0"
            />
          </defs>
          <text>
            <textPath href="#badge-circle">
              Depuis 1915 · Fruits de mer &amp; poisson · Quiberon ·
            </textPath>
          </text>
        </svg>
        <span className="hero-badge-arrow">↓</span>
      </motion.a>

      {/* vague animée en pied de hero */}
      <div className="hero-wave" aria-hidden>
        <svg viewBox="0 0 2880 110" preserveAspectRatio="none">
          <path d="M0,55 C240,110 480,0 720,55 C960,110 1200,0 1440,55 C1680,110 1920,0 2160,55 C2400,110 2640,0 2880,55 L2880,110 L0,110 Z" />
        </svg>
      </div>
    </section>
  );
}
