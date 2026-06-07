"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { respondToChatRequest } from "../../lib/api";
import type { ChatRequest } from "../../lib/blindbite-types";
import { Avatar } from "../shared/Avatar";

export function ChatRequestCard({ req }: { req: ChatRequest }) {
  const router = useRouter();
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: respondToChatRequest,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["chat-requests"] });
      if (res.chat) router.push(`/chat/${res.chat.id}`);
    },
  });

  return (
    <article className="flex flex-col gap-3 rounded-3xl bg-[var(--card)] p-5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-3">
        <Avatar name={req.requester_name} size={36} />
        <div className="min-w-0">
          <p className="text-sm text-[var(--ink-soft)]">
            <span className="font-semibold text-[var(--ink)]">@{req.requester_name}</span>{" "}
            loved your pick for
          </p>
          <p
            className="truncate text-[var(--ink)]"
            style={{ fontFamily: "var(--font-serif)", fontSize: 22 }}
          >
            {req.restaurant_name}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          disabled={mut.isPending}
          onClick={() => mut.mutate({ request_id: req.id, accept: true })}
          className="flex-1 rounded-full bg-[var(--ink)] py-3 text-sm font-semibold text-white active:scale-[0.98]"
        >
          start chatting ✿
        </button>
        <button
          disabled={mut.isPending}
          onClick={() => mut.mutate({ request_id: req.id, accept: false })}
          className="rounded-full px-4 py-3 text-sm text-[var(--ink-soft)]"
        >
          maybe later
        </button>
      </div>
    </article>
  );
}