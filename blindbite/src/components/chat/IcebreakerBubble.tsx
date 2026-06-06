"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function IcebreakerBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="relative mx-auto my-4 max-w-[85%] rounded-3xl p-[2px]"
      style={{
        background:
          "linear-gradient(135deg, var(--lime), var(--teal), var(--blush))",
      }}
    >
      <div className="rounded-[22px] bg-[var(--background)] p-4">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
          <Sparkles className="sparkle h-3 w-3 text-[var(--flame)]" />
          a little something to start with
        </div>
        <p
          className="text-[var(--ink)]"
          style={{ fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.35 }}
        >
          {text}
        </p>
      </div>
    </motion.div>
  );
}