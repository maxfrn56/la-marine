import { motion } from "framer-motion";
import type { ReactNode } from "react";
import "./PageTransition.css";

/*
 * Rideau marin : un panneau bleu nuit surmonté d'une vague couvre l'écran,
 * se lève à l'arrivée sur la page et redescend au départ.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.45, delay: 0.35 } }}
      exit={{ opacity: 1 }}
    >
      <motion.div
        className="page-curtain"
        initial={{ y: "0%" }}
        animate={{ y: "-115%" }}
        exit={{ y: "0%" }}
        transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        aria-hidden
      >
        <div className="page-curtain-body" />
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
          <path d="M0,45 C240,90 480,0 720,45 C960,90 1200,0 1440,45 L1440,90 L0,90 Z" />
        </svg>
      </motion.div>
      {children}
    </motion.div>
  );
}
