"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Recommendation } from "../../lib/blindbite-types";
import { TagChip } from "../shared/TagChip";
import { Avatar } from "../shared/Avatar";
import { Sparkles } from "lucide-react";

export function EnrichedCard({
  rec,
  variant = "sheet",
}: {
  rec: Recommendation;
  variant?: "sheet" | "carousel";
}) {
  const router = useRouter();
  const compact = variant === "carousel";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className={`overflow-hidden rounded-3xl bg-[var(--card)] ${
        compact ? "w-[280px] shrink-0" : "w-full"
      }`}
    >
      <div className="relative">
        <img
          src={rec.image_url}
          alt={rec.restaurant_name}
          width={compact ? 280 : 600}
          height={compact ? 200 : 360}
          loading="lazy"
          className={`w-full object-cover ${compact ? "h-40" : "h-60"}`}
        />
        {rec.is_best_match && (
          <div className="absolute left-3 top-3">
            <TagChip variant="lime">
              <Sparkles className="h-3 w-3" /> closest to your vibe
            </TagChip>
          </div>
        )}
        {rec.is_ai_generated && (
          <div className="absolute right-3 top-3">
            <TagChip variant="ghost">🤖 ai suggestion</TagChip>
          </div>
        )}
      </div>

      <div className={`flex flex-col gap-3 ${compact ? "p-4" : "p-5"}`}>
        <div>
          <h3
            className="leading-tight text-[var(--ink)]"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: compact ? 22 : 28,
            }}
          >
            {rec.restaurant_name}
          </h3>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
            {rec.restaurant_address}
          </p>
        </div>

        <p
          className="italic text-[var(--ink)]/85"
          style={{ fontFamily: "var(--font-serif)", fontSize: compact ? 14 : 16 }}
        >
          “{rec.vibe_summary}”
        </p>

        <div className="flex flex-wrap gap-1.5">
          {rec.tags.slice(0, 4).map((t) => (
            <TagChip key={t}>#{t}</TagChip>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Avatar
            name={rec.recommender_name}
            emoji={rec.is_ai_generated ? "🤖" : undefined}
            size={26}
          />
          <p className="text-xs text-[var(--ink-soft)]">
            <span className="font-semibold text-[var(--ink)]">
              @{rec.recommender_name}
            </span>{" "}
            {rec.is_ai_generated ? "thinks you'd like it" : "recommends this"}
          </p>
        </div>

        {!compact && (
          <button
            onClick={() =>
              router.push(`/vibe-check?recId=${encodeURIComponent(rec.id)}`)
            }
            className="mt-2 w-full rounded-full bg-[var(--ink)] py-3.5 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
          >
            i'm going here →
          </button>
        )}
      </div>
    </motion.article>
  );
}