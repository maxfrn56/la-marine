import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import "./Marquee.css";

const items = [
  "Huîtres de la baie",
  "Poissons sauvages",
  "Cocktails signature",
  "Depuis 1915",
  "Face au port Maria",
];

export default function Marquee() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // le bandeau glisse légèrement avec le scroll, par-dessus son défilement propre
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-6%"]);

  const row = (
    <>
      {items.map((item) => (
        <span key={item}>
          {item}
          <i>✦</i>
        </span>
      ))}
    </>
  );

  return (
    <div className="marquee" ref={ref}>
      <motion.div className="marquee-inner" style={{ x }}>
        <div className="marquee-track">
          {row}
          {row}
          {row}
        </div>
      </motion.div>
    </div>
  );
}
