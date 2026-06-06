"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Pencil } from "lucide-react";
import type { AuthUser } from "../../lib/auth";
import { AvatarUploader } from "./AvatarUploader";

const MONTHS = [
  "january","february","march","april","may","june",
  "july","august","september","october","november","december",
];

function joinLabel(iso: string) {
  const d = new Date(iso);
  return `eating since ${MONTHS[d.getMonth()]}`;
}

export function ProfileHeader({
  user,
  stats,
  onAvatar,
  onHandle,
}: {
  user: AuthUser;
  stats: { pins: number; recs: number; chats: number };
  onAvatar: (dataUrl: string) => void;
  onHandle: (h: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(user.handle);
  const [err, setErr] = useState<string | null>(null);

  function commit() {
    setErr(null);
    try {
      onHandle(draft);
      setEditing(false);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "couldn't save.");
    }
  }

  return (
    <section className="flex flex-col items-center gap-4 pt-2">
      <AvatarUploader
        avatarUrl={user.avatarUrl}
        handle={user.handle}
        onChange={onAvatar}
      />

      {editing ? (
        <div className="flex items-center gap-2">
          <span className="text-[var(--ink)]/50" style={{ fontFamily: "var(--font-serif)", fontSize: 28 }}>@</span>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            className="w-40 border-b border-[var(--ink)] bg-transparent text-center italic text-[var(--ink)] outline-none"
            style={{ fontFamily: "var(--font-serif)", fontSize: 28 }}
          />
          <button onClick={commit} className="rounded-full bg-[var(--lime)] p-1.5">
            <Check className="h-4 w-4 text-[var(--ink)]" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setDraft(user.handle);
            setEditing(true);
          }}
          className="group flex items-center gap-2"
        >
          <span
            className="italic text-[var(--ink)]"
            style={{ fontFamily: "var(--font-serif)", fontSize: 32 }}
          >
            @{user.handle}
          </span>
          <Pencil className="h-3.5 w-3.5 text-[var(--ink-soft)] opacity-0 transition group-hover:opacity-100" />
        </button>
      )}
      {err && <p className="text-xs text-[var(--flame)]">{err}</p>}

      <motion.span
        initial={{ rotate: -3 }}
        animate={{ rotate: [-3, 2, -3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="inline-block rounded-full bg-[var(--lime)] px-3.5 py-1 text-[11px] font-medium text-[var(--ink)] shadow-[0_6px_18px_-8px_rgba(0,0,0,0.25)]"
      >
        {joinLabel(user.createdAt)}
      </motion.span>

      <div className="mt-3 flex w-full max-w-xs items-stretch gap-2">
        {[
          ["pins", stats.pins],
          ["recs", stats.recs],
          ["chats", stats.chats],
        ].map(([label, value]) => (
          <div
            key={label as string}
            className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-white/70 py-3"
          >
            <span
              className="text-[var(--ink)]"
              style={{ fontFamily: "var(--font-display)", fontSize: 22 }}
            >
              {value as number}
            </span>
            <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              {label as string}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}