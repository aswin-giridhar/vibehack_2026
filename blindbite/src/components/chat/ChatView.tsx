"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { sendMessage } from "../../lib/api";
import { useMessages } from "../../hooks/useBlindbite";
import type { Chat } from "../../lib/blindbite-types";
import { CURRENT_USER } from "../../lib/user";
import { IcebreakerBubble } from "./IcebreakerBubble";
import { Avatar } from "../shared/Avatar";
import { Send } from "lucide-react";

export function ChatView({ chat }: { chat: Chat }) {
  const { data: messages = [] } = useMessages(chat.id);
  const [draft, setDraft] = useState("");
  const qc = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const mut = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["messages", chat.id] });
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="flex items-center gap-3 border-b border-[var(--ink)]/8 bg-[var(--background)]/90 px-4 py-3 backdrop-blur">
        <Avatar name={chat.other_user_name ?? "someone"} size={36} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-[var(--ink)]">
            @{chat.other_user_name ?? "someone"}
          </p>
          <p className="truncate text-xs text-[var(--ink-soft)]">
            about {chat.restaurant_name ?? "a spot"}
          </p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 pb-28">
        {messages.map((m) =>
          m.is_icebreaker ? (
            <IcebreakerBubble key={m.id} text={m.content} />
          ) : (
            <div
              key={m.id}
              className={`mb-2 flex ${m.sender_id === CURRENT_USER.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] rounded-3xl px-4 py-2.5 text-sm ${
                  m.sender_id === CURRENT_USER.id
                    ? "bg-[var(--ink)] text-white"
                    : "bg-white text-[var(--ink)]"
                }`}
              >
                {m.content}
              </div>
            </div>
          ),
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          mut.mutate({ chat_id: chat.id, content: draft.trim() });
        }}
        className="fixed inset-x-0 bottom-20 z-[900] mx-auto flex max-w-md items-center gap-2 px-4"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="say something…"
          className="flex-1 rounded-full border border-[var(--ink)]/10 bg-white px-4 py-3 text-sm placeholder:text-[var(--ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
        />
        <button
          type="submit"
          aria-label="send"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ink)] text-white active:scale-[0.96]"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}