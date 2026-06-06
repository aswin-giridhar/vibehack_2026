"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { VibeCheck } from "@/components/chat/VibeCheck";
import { useRecommendation } from "@/hooks/useBlindbite";

function VibeCheckInner() {
  const searchParams = useSearchParams();
  const recId = searchParams.get("recId") ?? undefined;
  const { data: rec, isLoading } = useRecommendation(recId);

  if (isLoading || !rec) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <p
          className="italic text-[var(--ink-soft)]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          loading…
        </p>
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
