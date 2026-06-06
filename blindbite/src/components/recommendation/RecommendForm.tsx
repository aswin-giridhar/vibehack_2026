"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { postRecommendation } from "../../lib/api";
import { MOCK_RESTAURANTS } from "../../lib/mock-restaurants";
import { TagChip } from "../shared/TagChip";

export function RecommendForm({
  cravingId,
  onDone,
}: {
  cravingId: string;
  onDone: () => void;
}) {
  const [q, setQ] = useState("");
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: postRecommendation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recommendations", cravingId] });
      onDone();
    },
  });

  const filtered = MOCK_RESTAURANTS.filter((r) =>
    q.trim() ? r.name.toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div className="flex flex-col gap-3">
      <h3
        className="text-[var(--ink)]"
        style={{ fontFamily: "var(--font-serif)", fontSize: 22 }}
      >
        recommend a spot
      </h3>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="search a place you love…"
        className="w-full rounded-full border border-[var(--ink)]/10 bg-white px-4 py-3 text-sm placeholder:text-[var(--ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
      />
      <ul className="flex flex-col gap-2">
        {filtered.map((r) => (
          <li key={r.name}>
            <button
              disabled={mut.isPending}
              onClick={() =>
                mut.mutate({
                  craving_id: cravingId,
                  restaurant_name: r.name,
                  restaurant_address: r.address,
                  latitude: r.latitude,
                  longitude: r.longitude,
                  image_url: r.image,
                  vibe_summary: r.vibe,
                  tags: r.tags,
                })
              }
              className="flex w-full items-center gap-3 rounded-2xl border border-[var(--ink)]/10 bg-white p-3 text-left transition hover:border-[var(--ink)]/30 disabled:opacity-50"
            >
              <img
                src={r.image}
                alt=""
                width={56}
                height={56}
                loading="lazy"
                className="h-14 w-14 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[var(--ink)]"
                  style={{ fontFamily: "var(--font-serif)", fontSize: 18 }}
                >
                  {r.name}
                </p>
                <p className="truncate text-xs text-[var(--ink-soft)]">{r.address}</p>
                <div className="mt-1 flex gap-1">
                  {r.tags.slice(0, 2).map((t) => (
                    <TagChip key={t} variant="outline">#{t}</TagChip>
                  ))}
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
      {mut.isPending && (
        <p className="text-center text-xs italic text-[var(--ink-soft)]">
          pinning + enriching with ai…
        </p>
      )}
    </div>
  );
}