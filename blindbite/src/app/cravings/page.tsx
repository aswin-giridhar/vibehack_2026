"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { MapView } from "@/components/map/MapView";
import { RecommendForm } from "@/components/recommendation/RecommendForm";
import { useNearbyCravings } from "@/hooks/useBlindbite";
import type { Craving } from "@/lib/blindbite-types";
import { DEFAULT_LOCATION } from "@/lib/user";
import { Logo } from "@/components/brand/Logo";

export default function CravingsPage() {
  const { data: cravings = [] } = useNearbyCravings();
  const [active, setActive] = useState<Craving | null>(null);

  return (
    <div className="fixed inset-0 bg-[var(--background)]">
      <div className="absolute inset-0">
        <MapView
          center={{
            lat: cravings[0]?.latitude ?? DEFAULT_LOCATION.latitude,
            lng: cravings[0]?.longitude ?? DEFAULT_LOCATION.longitude,
          }}
          cravings={cravings}
          onPickCraving={setActive}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[800] flex items-center gap-2 bg-gradient-to-b from-[var(--background)]/95 to-transparent px-4 pb-8 pt-4">
        <Logo size={20} />
        <span className="ml-2 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          cravings near you
        </span>
      </div>

      <AnimatePresence>
        {active && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActive(null)}
              className="fixed inset-0 z-[1200] bg-black/30"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed inset-x-0 bottom-0 z-[1300] max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-[var(--background)] pb-28"
            >
              <div className="mx-auto my-2 h-1.5 w-10 rounded-full bg-[var(--ink)]/15" />
              <button
                onClick={() => setActive(null)}
                aria-label="close"
                className="absolute right-4 top-4 rounded-full bg-white p-1.5 text-[var(--ink)]"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex flex-col gap-5 p-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                    @{active.user_name} is craving
                  </p>
                  <p
                    className="mt-1 italic text-[var(--ink)]"
                    style={{ fontFamily: "var(--font-serif)", fontSize: 28, lineHeight: 1.15 }}
                  >
                    “{active.text}”
                  </p>
                </div>
                <RecommendForm
                  cravingId={active.id}
                  onDone={() => setActive(null)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
