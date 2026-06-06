"use client";

import { useParams } from "next/navigation";
import { ChatView } from "@/components/chat/ChatView";
import { useChat } from "@/hooks/useBlindbite";

export default function ChatPage() {
  const params = useParams<{ chatId: string }>();
  const { data: chat, isLoading } = useChat(params.chatId);

  if (isLoading || !chat) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <p
          className="italic text-[var(--ink-soft)]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          loading the conversation…
        </p>
      </div>
    );
  }

  return <ChatView chat={chat} />;
}
