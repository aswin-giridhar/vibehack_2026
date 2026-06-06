"use client";

import type { ReactNode } from "react";

export function TagChip({
  children,
  variant = "dark",
  className = "",
}: {
  children: ReactNode;
  variant?: "dark" | "lime" | "outline" | "ghost";
  className?: string;
}) {
  const variants = {
    dark: "bg-[var(--ink)] text-white",
    lime: "bg-[var(--lime)] text-[var(--ink)]",
    outline: "border border-[var(--ink)]/15 text-[var(--ink)] bg-transparent",
    ghost: "bg-white/80 backdrop-blur text-[var(--ink)]",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium tracking-tight ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}