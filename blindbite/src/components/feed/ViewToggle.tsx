"use client";

import Link from "next/link";

export function ViewToggle({ current }: { current: "feed" | "map" }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-[var(--ink)] p-1 text-[11px] font-medium">
      <Link
        href="/feed"
        className={`rounded-full px-3 py-1.5 transition ${
          current === "feed"
            ? "bg-[var(--lime)] text-[var(--ink)]"
            : "text-white/70 hover:text-white"
        }`}
      >
        feed
      </Link>
      <Link
        href="/cravings"
        className={`rounded-full px-3 py-1.5 transition ${
          current === "map"
            ? "bg-[var(--lime)] text-[var(--ink)]"
            : "text-white/70 hover:text-white"
        }`}
      >
        map
      </Link>
    </div>
  );
}
