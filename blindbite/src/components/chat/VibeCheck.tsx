"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { postVibeCheck } from "../../lib/api";
import type { Recommendation } from "../../lib/blindbite-types";
import { CURRENT_USER } from "../../lib/user";
import { motion, AnimatePresence } from "framer-motion";

export function VibeCheck({ rec }: { rec: Recommendation }) {
  const router = useRouter();
  const [burst, setBurst] = useState(false);
  const [done, setDone] = useState<null | "loved" | "not">(null);

  const mut = useMutation({
    mutationFn: postVibeCheck,
    onSuccess: (res) => {
      if (res.chatRequest) {
        setDone("loved");
      } else if (res.vibeCheck?.loved_it) {
        setDone("loved");
      } else {
        setDone("not");
      }
      setTimeout(() => {
        router.push("/chat/requests");
      }, 2400);
    },
  });

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6 pb-32 pt-10">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[32px] bg-[var(--card)] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]">
        <img
          src={rec.image_url ?? undefined}
          alt={rec.restaurant_name}
          width={400}
          height={300}
          className="h-64 w-full object-cover"
        />
        <div className="space-y-1 p-5 text-center">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            you went to
          </p>
          <h2
            className="text-[var(--ink)]"
            style={{ fontFamily: "var(--font-serif)", fontSize: 28 }}
          >
            {rec.restaurant_name}
          </h2>
          <p className="text-sm text-[var(--ink-soft)]">
            recommended by{" "}
            <span className="font-semibold text-[var(--ink)]">
              @{rec.recommender_name}
            </span>
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key="ask"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex w-full max-w-sm flex-col items-center gap-3"
          >
            <p
              className="text-center text-[var(--ink)]"
              style={{ fontFamily: "var(--font-serif)", fontSize: 22 }}
            >
              how was @{rec.recommender_name}'s pick?
            </p>
            <div className="relative w-full">
              <button
                disabled={mut.isPending}
                onClick={() => {
                  setBurst(true);
                  mut.mutate({ recommendation_id: rec.id, craving_id: rec.craving_id, requester_id: CURRENT_USER.id, recommender_id: rec.recommender_id, loved_it: true });
                }}
                className="w-full rounded-full bg-[var(--lime)] py-4 text-base font-semibold text-[var(--ink)] shadow-[0_10px_30px_-10px_rgba(200,241,53,0.7)] transition active:scale-[0.97]"
              >
                💚 loved it
              </button>
              {burst && (
                <span
                  className="heart-burst pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 text-3xl"
                  aria-hidden
                >
                  💚
                </span>
              )}
            </div>
            <button
              disabled={mut.isPending}
              onClick={() =>
                mut.mutate({ recommendation_id: rec.id, craving_id: rec.craving_id, requester_id: CURRENT_USER.id, recommender_id: rec.recommender_id, loved_it: false })
              }
              className="text-sm text-[var(--ink-soft)] underline-offset-4 hover:underline"
            >
              not for me
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p
              className="text-[var(--ink)]"
              style={{ fontFamily: "var(--font-serif)", fontSize: 22 }}
            >
              {done === "loved"
                ? `sent. waiting on @${rec.recommender_name} ✿`
                : "noted. we'll learn your taste."}
            </p>
            <p className="mt-1 text-xs text-[var(--ink-soft)]">
              taking you to your chats…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}