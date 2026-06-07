"use client";

const colors = ["#E8A0A8", "#C8F135", "#87C5C0", "#C0392B", "#F5C146"];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Avatar({
  name,
  size = 28,
  emoji,
}: {
  name: string;
  size?: number;
  emoji?: string;
}) {
  const bg = colors[hash(name) % colors.length];
  const initial = name.replace(/^@/, "").trim()[0]?.toUpperCase() ?? "?";
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-semibold text-[var(--ink)]"
      style={{
        background: bg,
        width: size,
        height: size,
        fontSize: size * 0.42,
        lineHeight: 1,
      }}
    >
      {emoji ?? initial}
    </span>
  );
}