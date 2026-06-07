"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Recommendation } from "../../lib/blindbite-types";
import { EnrichedCard } from "../recommendation/EnrichedCard";

export function PinSheet({
  rec,
  onClose,
}: {
  rec: Recommendation | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {rec && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1200] bg-black/30"
          />
          <motion.div
            key={rec.id}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-[1300] max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-[var(--background)] pb-24 pt-2 shadow-2xl"
          >
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-[var(--ink)]/15" />
            <button
              onClick={onClose}
              aria-label="close"
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-1.5 text-[var(--ink)]"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="px-4">
              <EnrichedCard rec={rec} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}