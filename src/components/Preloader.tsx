import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import logo from "../assets/photos/logo.png";
import "./Preloader.css";

const words = ["Bienvenue", "à bord", "de", "La Marine"];

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let value = 0;
    const interval = setInterval(() => {
      // progression irrégulière, comme un vrai chargement
      value += Math.random() * 14 + 4;
      if (value >= 100) {
        value = 100;
        clearInterval(interval);
        setTimeout(() => setDone(true), 450);
        setTimeout(onComplete, 1150);
      }
      setProgress(Math.floor(value));
    }, 130);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="preloader"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.img
            src={logo}
            alt=""
            className="preloader-logo"
            initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />

          <div className="preloader-words" aria-hidden>
            {words.map((word, i) => (
              <motion.span
                key={word}
                className={i === words.length - 1 ? "script gold" : ""}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.25 + i * 0.28,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {word}
              </motion.span>
            ))}
          </div>

          <div className="preloader-count">{progress}</div>

          {/* vague qui monte avec la progression */}
          <motion.div
            className="preloader-wave"
            initial={{ y: "102%" }}
            animate={{ y: `${102 - progress * 0.55}%` }}
            transition={{ ease: "easeOut", duration: 0.4 }}
          >
            <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
              <path
                d="M0,45 C240,90 480,0 720,45 C960,90 1200,0 1440,45 L1440,90 L0,90 Z"
                fill="var(--navy-700)"
              />
            </svg>
            <div className="preloader-wave-body" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
