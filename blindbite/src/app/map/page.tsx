"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapView } from "@/components/map/MapView";
import { PinSheet } from "@/components/map/PinSheet";
import { EnrichedCard } from "@/components/recommendation/EnrichedCard";
import {
  useCraving,
  useNearbyCravings,
  useRecommendations,
} from "@/hooks/useBlindbite";
import type { Craving, Recommendation } from "@/lib/blindbite-types";
import { DEFAULT_LOCATION } from "@/lib/user";
import { Search } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const FILTERS = ["all", "cafés", "wine", "late night", "cheap eats", "date"];

function MapInner() {
  const searchParams = useSearchParams();
  const cravingId = searchParams.get("cravingId") ?? undefined;
  const { data: cravings = [] } = useNearbyCravings();
  const activeId = cravingId ?? cravings[0]?.id;
  const { data: craving } = useCraving(activeId);
  const { data: recs = [] } = useRecommendations(activeId);
  const [selected, setSelected] = useState<Recommendation | null>(null);
  const [selectedCraving, setSelectedCraving] = useState<Craving | null>(null);
  const [filter, setFilter] = useState("all");

  const center = craving
    ? { lat: craving.latitude, lng: craving.longitude }
    : { lat: DEFAULT_LOCATION.latitude, lng: DEFAULT_LOCATION.longitude };

  // auto-open best match once when recs land
  useEffect(() => {
    if (!selected && recs.length > 0) {
      const best = recs.find((r) => r.is_best_match) ?? recs[0];
      void best;
    }
  }, [recs, selected]);

  return (
    <div className="fixed inset-0 bg-[var(--background)]">
      <div className="absolute inset-0">
        <MapView
          center={center}
          craving={craving}
          recommendations={recs}
          onPickRec={setSelected}
          onPickCraving={setSelectedCraving}
        />
      </div>

      {/* top overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[800] flex flex-col gap-2 bg-gradient-to-b from-[var(--background)]/95 to-transparent px-4 pb-6 pt-4">
        <div className="pointer-events-auto flex items-center gap-2">
          <Logo size={20} />
          <div className="ml-auto flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm text-[var(--ink-soft)] shadow-[0_4px_14px_-6px_rgba(0,0,0,0.2)]">
            <Search className="h-3.5 w-3.5" />
            <span className="italic" style={{ fontFamily: "var(--font-serif)" }}>
              search this map
            </span>
          </div>
        </div>

        {craving && (
          <div className="pointer-events-auto mt-1 inline-flex items-center gap-2 self-start rounded-full bg-white/90 px-3 py-1.5 text-xs text-[var(--ink)] backdrop-blur">
            <span className="text-[var(--flame)]">🔥</span>
            <span style={{ fontFamily: "var(--font-serif)" }} className="italic">
              {craving.text}
            </span>
          </div>
        )}

        <div className="pointer-events-auto -mx-4 mt-1 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium ${
                filter === f
                  ? "bg-[var(--ink)] text-white"
                  : "bg-white/85 text-[var(--ink)] backdrop-blur"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* bottom carousel */}
      <div className="absolute inset-x-0 bottom-20 z-[800] pb-2">
        <div className="px-5 pb-2 text-[11px] uppercase tracking-[0.14em] text-[var(--ink)]/80 drop-shadow">
          {recs.length > 0 ? "for you, right now →" : "the ai is thinking…"}
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {recs.length === 0 && (
            <div className="w-[280px] shrink-0 rounded-3xl bg-white/90 p-5 backdrop-blur">
              <p
                className="text-[var(--ink)]"
                style={{ fontFamily: "var(--font-serif)", fontSize: 18 }}
              >
                no one&apos;s pinned here yet. give it a sec — friends and the ai are looking.
              </p>
            </div>
          )}
          {recs.map((r) => (
            <button key={r.id} onClick={() => setSelected(r)} className="text-left">
              <EnrichedCard rec={r} variant="carousel" />
            </button>
          ))}
        </div>
      </div>

      <PinSheet rec={selected} onClose={() => setSelected(null)} />

      {/* Craving detail sheet */}
      {selectedCraving && (
        <div
          className="fixed inset-x-0 bottom-0 z-[1300] max-h-[50vh] overflow-y-auto rounded-t-[28px] bg-[var(--background)] pb-28 shadow-[0_-8px_30px_rgba(0,0,0,0.15)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto my-2 h-1.5 w-10 rounded-full bg-[var(--ink)]/15" />
          <div className="p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              @{selectedCraving.user_name} is craving
            </p>
            <p className="mt-1 italic text-[var(--ink)]" style={{ fontFamily: "var(--font-serif)", fontSize: 24, lineHeight: 1.2 }}>
              &ldquo;{selectedCraving.text}&rdquo;
            </p>
            <a
              href={`/cravings`}
              className="mt-4 inline-block rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white"
            >
              recommend a spot →
            </a>
            <button
              onClick={() => setSelectedCraving(null)}
              className="ml-3 text-sm text-[var(--ink-soft)]"
            >
              close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={<div className="h-[100dvh] w-full animate-pulse bg-[#ece5d8]" />}
    >
      <MapInner />
    </Suspense>
  );
}
