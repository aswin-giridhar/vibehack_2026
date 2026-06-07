"use client";

import { useParams } from "next/navigation";
import { ChatView } from "@/components/chat/ChatView";
import { useChat } from "@/hooks/useBlindbite";

export default function ChatPage() {
  const params = useParams<{ chatId: string }>();
  const { data: chat, isLoading, isError } = useChat(params.chatId);

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <p className="italic text-[var(--ink-soft)]" style={{ fontFamily: "var(--font-serif)" }}>
          loading the conversation…
        </p>
      </div>
    );
  }

  if (!chat || isError) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[var(--ink)]" style={{ fontFamily: "var(--font-serif)", fontSize: 24 }}>
          chat not found
        </p>
        <p className="text-sm text-[var(--ink-soft)]">
          this conversation may not exist or you don&apos;t have access.
        </p>
        <a href="/chat/requests" className="mt-2 rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white">
          back to chats
        </a>
      </div>
    );
  }

  return <ChatView chat={chat} />;
}
