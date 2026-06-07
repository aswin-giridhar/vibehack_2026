"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { FloatingObjects } from "@/components/brand/FloatingObjects";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth";

function AuthInner() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[var(--background)] px-5 pb-24 pt-12">
      <FloatingObjects />
      <div className="relative z-10 mx-auto flex max-w-md flex-col gap-7">
        <header className="flex flex-col items-center gap-2">
          <Logo size={32} />
          <p
            className="text-center italic text-[var(--ink)]"
            style={{ fontFamily: "var(--font-serif)", fontSize: 22, lineHeight: 1.15 }}
          >
            a map for taste,
            <br />
            not for tourists.
          </p>
        </header>

        <AuthCard onAuthed={() => router.replace(next)} />

        <p className="text-center text-[11px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
          zero ads · zero influencers
        </p>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthInner />
    </Suspense>
  );
}
