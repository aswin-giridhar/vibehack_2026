"use client";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-block leading-none tracking-tight"
      style={{ fontFamily: "var(--font-display)", fontSize: size }}
    >
      blindbite
    </span>
  );
}