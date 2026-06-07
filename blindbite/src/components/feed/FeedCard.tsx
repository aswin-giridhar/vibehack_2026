"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles, MessageCircleDashed } from "lucide-react";
import type { Craving } from "../../lib/blindbite-types";
import { Avatar } from "../shared/Avatar";

const MOODS = [
  { bg: "var(--blush)", blob: "rgba(232,160,168,0.55)" },
  { bg: "var(--lime)", blob: "rgba(200,241,53,0.55)" },
  { bg: "var(--cream)", blob: "rgba(245,243,238,0.85)" },
  { bg: "#FFD9B0", blob: "rgba(255,217,176,0.7)" },
] as const;

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function FeedCard({
  craving,
  index,
  onRec,
}: {
  craving: Craving;
  index: number;
  onRec: (c: Craving) => void;
}) {
  const mood = MOODS[index % MOODS.length];
  const [same, setSame] = useState(0);
  const [bumped, setBumped] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="relative overflow-hidden rounded-[28px] p-5 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)]"
      style={{ background: mood.bg }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full blur-2xl"
        style={{ background: mood.blob }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full blur-3xl"
        style={{ background: mood.blob, opacity: 0.6 }}
      />

      <header className="relative flex items-center gap-2.5">
        <Avatar name={craving.user_name} size={32} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--ink)]">
            @{craving.user_name}
          </p>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--ink)]/55">
            {timeAgo(craving.created_at)} · craving
          </p>
        </div>
      </header>

      <p
        className="relative mt-4 italic text-[var(--ink)]"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 28,
          lineHeight: 1.15,
        }}
      >
        “{craving.text}”
      </p>

      <div className="relative mt-6 flex items-center gap-2">
        <button
          onClick={() => onRec(craving)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--ink)] py-3 text-sm font-semibold text-white active:scale-[0.98]"
        >
          🥢 rec a spot
        </button>
        <button
          onClick={() => {
            setSame((s) => s + 1);
            setBumped(true);
            setTimeout(() => setBumped(false), 400);
          }}
          className="flex items-center gap-1.5 rounded-full bg-white/85 px-3.5 py-3 text-sm font-medium text-[var(--ink)]"
          aria-label="same"
        >
          <Sparkles
            className={`h-4 w-4 transition-transform ${bumped ? "scale-125" : ""}`}
            strokeWidth={2}
          />
          <span>same{same > 0 ? ` · ${same}` : ""}</span>
        </button>
        <button
          aria-label="icebreaker"
          title="rec a spot first to send an icebreaker"
          className="flex items-center justify-center rounded-full bg-white/60 p-3 text-[var(--ink)]/70"
        >
          <MessageCircleDashed className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </motion.article>
  );
}
