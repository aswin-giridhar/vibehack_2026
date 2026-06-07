"use client";

import { motion } from "framer-motion";
import { MOCK_IMAGES } from "../../lib/mock-restaurants";

// Drifting food objects à la Corner's 3D floating hero.
// Positioned in safe corners so they never overlap the headline, form, or CTA.
type Item = {
  src: string;
  size: number;
  style: React.CSSProperties;
  delay: number;
};

const items: Item[] = [
  { src: MOCK_IMAGES.octopus, size: 84, style: { top: 70, right: -28 }, delay: 0 },
  { src: MOCK_IMAGES.pastel, size: 66, style: { top: 380, right: -22 }, delay: 0.6 },
  { src: MOCK_IMAGES.dumplings, size: 78, style: { bottom: 140, left: -20 }, delay: 1.0 },
  { src: MOCK_IMAGES.matcha, size: 64, style: { bottom: 60, right: 24 }, delay: 1.4 },
];

export function FloatingObjects() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((it, i) => (
        <motion.img
          key={i}
          src={it.src}
          alt=""
          aria-hidden
          loading="lazy"
          width={it.size}
          height={it.size}
          className="absolute rounded-full object-cover opacity-70 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.25)]"
          style={{ ...it.style, width: it.size, height: it.size }}
          initial={{ y: 0, rotate: 0 }}
          animate={{ y: [0, -12, 0], rotate: [0, 3, -2, 0] }}
          transition={{
            duration: 7 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: it.delay,
          }}
        />
      ))}
    </div>
  );
}