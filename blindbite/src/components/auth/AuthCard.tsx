"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../lib/auth";
import { AuthInput } from "./AuthInput";

type Mode = "in" | "up";

export function AuthCard({ onAuthed }: { onAuthed: () => void }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("in");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "in") await signIn({ handle, password });
      else await signUp({ handle, password });
      onAuthed();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "something went sideways.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[28px] bg-[var(--ink)] p-5 text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]">
      {/* Tabs */}
      <div className="mb-5 flex rounded-full bg-white/10 p-1">
        {([
          ["in", "sign in"],
          ["up", "create account"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setMode(k);
              setErr(null);
            }}
            className={`flex-1 rounded-full py-2 text-xs font-medium transition ${
              mode === k
                ? "bg-[var(--lime)] text-[var(--ink)]"
                : "text-white/70 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="rounded-2xl bg-[var(--cream)] p-5 text-[var(--ink)]">
          <AuthInput
            label="who's eating"
            prefix="@"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="nicole"
            required
          />
          <div className="h-4" />
          <AuthInput
            label="the secret"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            required
          />
        </div>

        <AnimatePresence>
          {err && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs text-[var(--blush)]"
            >
              {err}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={busy}
          className="self-center rounded-full bg-[var(--lime)] px-8 py-3 text-sm font-semibold text-[var(--ink)] transition active:scale-[0.97] disabled:opacity-50"
        >
          {busy ? "…" : mode === "in" ? "let's eat →" : "save me a seat →"}
        </button>

        <p className="text-center text-[11px] italic text-white/50">
          {mode === "in"
            ? "no account? tap create above."
            : "we don't email you. ever."}
        </p>
      </form>
    </div>
  );
}