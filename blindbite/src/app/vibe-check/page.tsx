"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { VibeCheck } from "@/components/chat/VibeCheck";
import { useRecommendation } from "@/hooks/useBlindbite";

function VibeCheckInner() {
  const searchParams = useSearchParams();
  const recId = searchParams.get("recId") ?? undefined;
  const { data: rec, isLoading, isError } = useRecommendation(recId);

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <p className="italic text-[var(--ink-soft)]" style={{ fontFamily: "var(--font-serif)" }}>
          loading…
        </p>
      </div>
    );
  }

  if (!rec || isError) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[var(--ink)]" style={{ fontFamily: "var(--font-serif)", fontSize: 24 }}>
          recommendation not found
        </p>
        <p className="text-sm text-[var(--ink-soft)]">
          this spot may have been removed or the link is invalid.
        </p>
        <a href="/" className="mt-2 rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white">
          back home
        </a>
      </div>
    );
  }

  return <VibeCheck rec={rec} />;
}

export default function VibeCheckPage() {
  return (
    <Suspense fallback={null}>
      <VibeCheckInner />
    </Suspense>
  );
}
