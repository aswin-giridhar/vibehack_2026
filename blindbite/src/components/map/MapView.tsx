"use client";

import { lazy, Suspense, useEffect, useState, type ComponentType } from "react";
import type { Craving, Recommendation } from "../../lib/blindbite-types";

export type MapViewProps = {
  center: { lat: number; lng: number };
  craving?: Craving | null;
  recommendations?: Recommendation[];
  cravings?: Craving[];
  onPickRec?: (r: Recommendation) => void;
  onPickCraving?: (c: Craving) => void;
};

const InnerMap = lazy<ComponentType<MapViewProps>>(() =>
  import("./MapViewInner").then((m) => ({ default: m.MapView })),
);

export function MapView(props: MapViewProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-full w-full animate-pulse bg-[#ece5d8]" aria-hidden />;
  }

  return (
    <Suspense
      fallback={<div className="h-full w-full animate-pulse bg-[#ece5d8]" aria-hidden />}
    >
      <InnerMap {...props} />
    </Suspense>
  );
}