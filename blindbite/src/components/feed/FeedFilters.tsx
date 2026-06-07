"use client";

export const FEED_FILTERS = [
  { key: "all", label: "all", match: () => true },
  {
    key: "late",
    label: "late night",
    match: (t: string) => /(late|midnight|3am|night|2am|drunk)/i.test(t),
  },
  {
    key: "brunch",
    label: "brunch",
    match: (t: string) => /(brunch|breakfast|morning|eggs|pancake|coffee)/i.test(t),
  },
  {
    key: "cheap",
    label: "cheap eats",
    match: (t: string) => /(cheap|broke|budget|under|\$|fiver|tenner)/i.test(t),
  },
  {
    key: "date",
    label: "date",
    match: (t: string) => /(date|romantic|wine|cozy|candle)/i.test(t),
  },
  {
    key: "solo",
    label: "solo",
    match: (t: string) => /(solo|alone|myself|bar seat|counter)/i.test(t),
  },
] as const;

export type FilterKey = (typeof FEED_FILTERS)[number]["key"];

export function FeedFilters({
  active,
  onChange,
}: {
  active: FilterKey;
  onChange: (k: FilterKey) => void;
}) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2 pb-1">
        {FEED_FILTERS.map((f) => {
          const on = f.key === active;
          return (
            <button
              key={f.key}
              onClick={() => onChange(f.key)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-medium transition ${
                on
                  ? "bg-[var(--ink)] text-white"
                  : "border border-[var(--ink)]/15 bg-white/70 text-[var(--ink)]"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
