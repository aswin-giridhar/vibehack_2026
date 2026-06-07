"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { useNearbyCravings, useChatRequests } from "@/hooks/useBlindbite";
import { TagChip } from "@/components/shared/TagChip";

type Tab = "pins" | "recs" | "loved";

export default function ProfilePage() {
  const { user, signOut, updateProfile } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pins");

  useEffect(() => {
    if (user === null) router.replace("/auth?next=/profile");
  }, [user, router]);

  const { data: cravings = [] } = useNearbyCravings();
  const { data: requests = [] } = useChatRequests();

  const mine = useMemo(
    () => (user ? cravings.filter((c) => c.user_name === user.handle) : []),
    [cravings, user],
  );
  const myRequests = useMemo(
    () => (user ? requests.filter((r) => r.recommender_name === user.handle) : []),
    [requests, user],
  );

  if (!user) return null;

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[var(--background)] px-5 pb-36 pt-10">
      <div className="pointer-events-none absolute -right-16 top-12 h-48 w-48 rounded-full bg-[var(--blush)]/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-72 h-56 w-56 rounded-full bg-[var(--lime)]/30 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-md flex-col gap-7">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-[11px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            ← back
          </Link>
          <button
            onClick={() => {
              signOut();
              router.push("/auth");
            }}
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[var(--ink-soft)] hover:text-[var(--ink)]"
          >
            <LogOut className="h-3 w-3" /> sign out
          </button>
        </header>

        <ProfileHeader
          user={user}
          stats={{ pins: mine.length, recs: myRequests.length, chats: 0 }}
          onAvatar={(d) => updateProfile({ avatarUrl: d })}
          onHandle={(h) => updateProfile({ handle: h })}
        />

        <nav className="mt-2 flex justify-center gap-1 rounded-full bg-[var(--ink)] p-1">
          {(["pins", "recs", "loved"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-[11px] font-medium transition ${
                tab === t
                  ? "bg-[var(--lime)] text-[var(--ink)]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              your {t}
            </button>
          ))}
        </nav>

        <motion.section
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-3"
        >
          {tab === "pins" &&
            (mine.length === 0 ? (
              <EmptyState
                title="no cravings yet"
                body="post one from home and we'll keep it warm here."
                cta={{ href: "/", label: "post a craving" }}
              />
            ) : (
              mine.map((c) => (
                <Link
                  key={c.id}
                  href={`/map?cravingId=${encodeURIComponent(c.id)}`}
                  className="flex items-center justify-between rounded-2xl bg-white/85 p-4"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                      craving
                    </p>
                    <p
                      className="truncate text-[var(--ink)]"
                      style={{ fontFamily: "var(--font-serif)", fontSize: 18 }}
                    >
                      {c.text}
                    </p>
                  </div>
                  <TagChip variant="lime">map →</TagChip>
                </Link>
              ))
            ))}
          {tab === "recs" &&
            (myRequests.length === 0 ? (
              <EmptyState
                title="no recs yet"
                body="see what people are craving and drop a pin."
                cta={{ href: "/cravings", label: "browse cravings" }}
              />
            ) : (
              myRequests.map((r) => (
                <div key={r.id} className="rounded-2xl bg-white/85 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                    you recommended
                  </p>
                  <p
                    className="text-[var(--ink)]"
                    style={{ fontFamily: "var(--font-serif)", fontSize: 18 }}
                  >
                    {r.restaurant_name}
                  </p>
                  <p className="text-xs text-[var(--ink-soft)]">to @{r.requester_name}</p>
                </div>
              ))
            ))}
          {tab === "loved" && (
            <EmptyState
              title="nothing loved yet"
              body="when you tap loved-it after a meal, it lands here."
              cta={{ href: "/map", label: "find something" }}
            />
          )}
        </motion.section>
      </div>
    </main>
  );
}

function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[var(--ink)]/15 bg-white/40 py-10 text-center">
      <p
        className="text-[var(--ink)]"
        style={{ fontFamily: "var(--font-serif)", fontSize: 22 }}
      >
        {title}
      </p>
      <p className="max-w-[16rem] text-sm text-[var(--ink-soft)]">{body}</p>
      <Link
        href={cta.href}
        className="mt-1 rounded-full bg-[var(--ink)] px-5 py-2 text-[11px] font-medium text-white"
      >
        {cta.label}
      </Link>
    </div>
  );
}
