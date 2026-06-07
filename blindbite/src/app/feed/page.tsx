"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { FeedCard } from "@/components/feed/FeedCard";
import {
  FEED_FILTERS,
  FeedFilters,
  type FilterKey,
} from "@/components/feed/FeedFilters";
import { ViewToggle } from "@/components/feed/ViewToggle";
import { RecommendForm } from "@/components/recommendation/RecommendForm";
import { useNearbyCravings } from "@/hooks/useBlindbite";
import { useAuth } from "@/lib/auth";
import type { Craving } from "@/lib/blindbite-types";

export default function FeedPage() {
  const { user } = useAuth();
  const { data: cravings = [] } = useNearbyCravings();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [active, setActive] = useState<Craving | null>(null);

  const filtered = useMemo(() => {
    const me = user?.handle;
    const matchFn =
      FEED_FILTERS.find((f) => f.key === filter)?.match ?? (() => true);
    return cravings
      .filter((c) => (me ? c.user_name !== me : true))
      .filter((c) => matchFn(c.text));
  }, [cravings, filter, user]);

  return (
    <main className="relative min-h-[100dvh] bg-[var(--background)] pb-36">
      <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-[var(--lime)]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-80 h-64 w-64 rounded-full bg-[var(--blush)]/35 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-md flex-col gap-5 px-5 pt-8">
        <header className="flex items-center justify-between">
          <Logo size={22} />
          <ViewToggle current="feed" />
        </header>

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            cravings near you
          </p>
          <h1
            className="mt-1 leading-[1] text-[var(--ink)]"
            style={{ fontFamily: "var(--font-serif)", fontSize: 36 }}
          >
            what&apos;s everyone{" "}
            <em className="not-italic" style={{ color: "var(--flame)" }}>
              hungry
            </em>{" "}
            for
          </h1>
        </div>

        <FeedFilters active={filter} onChange={setFilter} />

        {filtered.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[var(--ink)]/15 bg-white/40 py-12 text-center">
            <p
              className="text-[var(--ink)]"
              style={{ fontFamily: "var(--font-serif)", fontSize: 24 }}
            >
              quiet kitchen
            </p>
            <p className="max-w-[16rem] text-sm text-[var(--ink-soft)]">
              try another filter — or post your own craving.
            </p>
            <Link
              href="/"
              className="mt-1 rounded-full bg-[var(--ink)] px-5 py-2 text-[11px] font-medium text-white"
            >
              post a craving
            </Link>
          </div>
        ) : (
          <div className="mt-2 flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {filtered.map((c, i) => (
                <FeedCard key={c.id} craving={c} index={i} onRec={setActive} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Link
        href="/"
        aria-label="post a craving"
        className="fixed bottom-24 right-5 z-[900] flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ink)] text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
      >
        <Plus className="h-5 w-5" strokeWidth={2.4} />
      </Link>

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
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 28,
                      lineHeight: 1.15,
                    }}
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
    </main>
  );
}
