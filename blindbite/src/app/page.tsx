"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { postCraving } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { FloatingObjects } from "@/components/brand/FloatingObjects";
import { Logo } from "@/components/brand/Logo";
import { useChatRequests, useNearbyCravings } from "@/hooks/useBlindbite";
import { TagChip } from "@/components/shared/TagChip";

const SUGGESTIONS = [
  "grilled octopus, somewhere candlelit",
  "matcha that actually tastes like matcha",
  "wine bar for a slow tuesday",
  "ramen, late, alone, perfect",
];

export default function Home() {
  const [text, setText] = useState("");
  const router = useRouter();
  const { user } = useAuth();
  const { data: cravings = [] } = useNearbyCravings();
  const { data: requests = [] } = useChatRequests();

  const mut = useMutation({
    mutationFn: postCraving,
    onSuccess: (c) =>
      router.push(`/map?cravingId=${encodeURIComponent(c.id)}`),
  });

  const mine = cravings.filter(
    (c) => c.user_name === (user?.handle ?? "you"),
  );

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[var(--background)] px-5 pb-36 pt-10">
      <FloatingObjects />

      <div className="relative z-10 mx-auto flex max-w-md flex-col gap-7">
        <header className="flex items-center justify-between">
          <Logo size={26} />
          <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            zero ads · zero influencers
          </span>
        </header>

        <motion.section
          initial={{ y: 6 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4 pt-6"
        >
          <h1
            className="leading-[0.95] text-[var(--ink)]"
            style={{ fontFamily: "var(--font-serif)", fontSize: 44 }}
          >
            what are you{" "}
            <em
              className="not-italic"
              style={{ fontFamily: "var(--font-display)", color: "var(--flame)" }}
            >
              craving
            </em>
            ?
          </h1>
          <p className="text-sm text-[var(--ink-soft)]">
            tell us. real people nearby will pin you a spot.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              if (!user) {
                router.push("/auth?next=/");
                return;
              }
              mut.mutate({ text: text.trim() });
            }}
            className="mt-2 flex flex-col gap-3"
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="grilled octopus, somewhere candlelit…"
              className="w-full resize-none rounded-3xl border border-[var(--ink)]/10 bg-white/90 px-5 py-4 text-base text-[var(--ink)] placeholder:italic placeholder:text-[var(--ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
              style={{ fontFamily: "var(--font-serif)" }}
            />
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setText(s)}
                  className="rounded-full bg-[var(--ink)] px-3 py-1.5 text-[11px] font-medium text-white/90 transition hover:bg-[var(--ink)]/85"
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={!text.trim() || mut.isPending}
              className="mt-2 self-start rounded-full bg-[var(--ink)] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] transition active:scale-[0.97] disabled:opacity-40"
            >
              {mut.isPending ? "posting…" : "post it →"}
            </button>
          </form>
        </motion.section>

        {(mine.length > 0 || requests.length > 0) && (
          <section className="flex flex-col gap-3 pt-6">
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              still cooking
            </h2>
            {mine.map((c) => (
              <Link
                key={c.id}
                href={`/map?cravingId=${encodeURIComponent(c.id)}`}
                className="flex items-center justify-between rounded-2xl bg-white/80 p-4 backdrop-blur"
              >
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                    your craving
                  </p>
                  <p
                    className="truncate text-[var(--ink)]"
                    style={{ fontFamily: "var(--font-serif)", fontSize: 18 }}
                  >
                    {c.text}
                  </p>
                </div>
                <TagChip variant="lime">open map →</TagChip>
              </Link>
            ))}
            {requests.length > 0 && (
              <Link
                href="/chat/requests"
                className="flex items-center justify-between rounded-2xl bg-[var(--ink)] p-4 text-white"
              >
                <p className="text-sm">
                  {requests.length} chat request{requests.length > 1 ? "s" : ""} waiting
                </p>
                <span>→</span>
              </Link>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
