"use client";

import { ChatRequestCard } from "@/components/chat/ChatRequestCard";
import { Logo } from "@/components/brand/Logo";
import { useChatRequests } from "@/hooks/useBlindbite";

export default function ChatRequestsPage() {
  const { data: requests = [] } = useChatRequests();

  return (
    <main className="min-h-[100dvh] bg-[var(--background)] px-5 pb-36 pt-8">
      <div className="mx-auto flex max-w-md flex-col gap-5">
        <header className="flex items-center justify-between">
          <Logo size={22} />
          <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            mutuals over food
          </span>
        </header>

        <h1
          className="leading-[1] text-[var(--ink)]"
          style={{ fontFamily: "var(--font-serif)", fontSize: 38 }}
        >
          your chats,{" "}
          <em className="not-italic" style={{ color: "var(--flame)" }}>
            warming up
          </em>
        </h1>

        {requests.length === 0 ? (
          <div className="rounded-3xl bg-white/80 p-6">
            <p
              className="italic text-[var(--ink)]"
              style={{ fontFamily: "var(--font-serif)", fontSize: 18 }}
            >
              nothing yet. recommend a spot or post a craving — chats happen after a vibe check goes well.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((r) => (
              <ChatRequestCard key={r.id} req={r} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
