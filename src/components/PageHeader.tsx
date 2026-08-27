import { motion } from "framer-motion";
import "./PageHeader.css";

type Props = {
  kicker: string;
  title: string;
  intro: string;
};

export default function PageHeader({ kicker, title, intro }: Props) {
  return (
    <header className="page-header container">
      <motion.span
        className="section-label"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {kicker}
      </motion.span>

      <h1 className="page-header-title script" aria-label={title}>
        {title.split("").map((char, i) => (
          <motion.span
            key={i}
            aria-hidden
            initial={{ y: "115%", rotate: 5, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            transition={{
              delay: 0.65 + i * 0.04,
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </h1>

      <motion.p
        className="page-header-intro"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {intro}
      </motion.p>
    </header>
  );
}
