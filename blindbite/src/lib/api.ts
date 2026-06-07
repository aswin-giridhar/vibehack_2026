// BlindBite API Bridge — real backend calls
// Same function signatures as Nicole's original mock shim,
// so every component works unchanged. Uses fetch() with
// transparent response-envelope unwrapping.

import type {
  Chat,
  ChatMessage,
  ChatRequest,
  Craving,
  Recommendation,
  VibeCheck,
} from "./types";
import { CURRENT_USER } from "./user";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const API_BASE = "/api";

/** Fetch with JSON parsing + envelope unwrapping.
 *  Backend returns `{ craving: {...} }` or `{ recommendations: [...] }`;
 *  this pulls out the inner value and returns it directly. */
async function apiFetch<T>(
  path: string,
  opts?: RequestInit,
  envelopeKey?: string,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API ${res.status}`);
  }
  const json = await res.json();
  // If an envelope key is specified, unwrap it
  if (envelopeKey && envelopeKey in json) return json[envelopeKey] as T;
  return json as T;
}

// ─────────────────────────────────────────────
// Cravings
// ─────────────────────────────────────────────

export async function postCraving(input: {
  text: string;
  latitude?: number;
  longitude?: number;
}): Promise<Craving> {
  return apiFetch<Craving>("/cravings", {
    method: "POST",
    body: JSON.stringify({
      userId: CURRENT_USER.id,
      userName: CURRENT_USER.name,
      text: input.text,
      latitude: input.latitude ?? 51.5074,
      longitude: input.longitude ?? -0.1278,
    }),
  }, "craving");
}

export async function getNearbyCravings(): Promise<Craving[]> {
  return apiFetch<Craving[]>(
    `/cravings/nearby?lat=51.5074&lng=-0.1278&radius=5000`,
    undefined,
    "cravings",
  );
}

export async function getCraving(id: string): Promise<Craving | null> {
  try {
    return await apiFetch<Craving>(`/cravings/${encodeURIComponent(id)}`, undefined, "craving");
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Recommendations
// ─────────────────────────────────────────────

export async function getRecommendations(
  cravingId: string,
): Promise<Recommendation[]> {
  return apiFetch<Recommendation[]>(
    `/recommendations?cravingId=${encodeURIComponent(cravingId)}`,
    undefined,
    "recommendations",
  );
}

export async function getRecommendation(
  id: string,
): Promise<Recommendation | null> {
  try {
    return await apiFetch<Recommendation>(
      `/recommendations/${encodeURIComponent(id)}`,
      undefined,
      "recommendation",
    );
  } catch {
    return null;
  }
}

export async function postRecommendation(input: {
  craving_id: string;
  restaurant_name: string;
  restaurant_address: string;
  latitude: number;
  longitude: number;
  image_url: string;
  vibe_summary: string;
  tags: string[];
}): Promise<Recommendation> {
  return apiFetch<Recommendation>("/recommendations", {
    method: "POST",
    body: JSON.stringify({
      cravingId: input.craving_id,
      recommenderId: CURRENT_USER.id,
      recommenderName: CURRENT_USER.name,
      restaurantName: input.restaurant_name,
      restaurantAddress: input.restaurant_address,
      latitude: input.latitude,
      longitude: input.longitude,
      imageUrl: input.image_url || undefined,
      vibeSummary: input.vibe_summary || undefined,
      tags: input.tags?.length ? input.tags : undefined,
    }),
  }, "recommendation");
}

export async function getAiCoRecommendations(
  cravingId: string,
): Promise<Recommendation[]> {
  return apiFetch<Recommendation[]>("/ai/co-recommend", {
    method: "POST",
    body: JSON.stringify({ cravingId, cravingText: "", latitude: 51.5074, longitude: -0.1278 }),
  }, "recommendations");
}

// ─────────────────────────────────────────────
// Vibe Checks
// ─────────────────────────────────────────────

/** Post a vibe check with full context. The old 2-param version
 *  was removed because it sent garbage "unknown" IDs to the backend. */
export async function postVibeCheck(input: {
  recommendation_id: string;
  craving_id: string;
  requester_id: string;
  recommender_id: string;
  loved_it: boolean;
}): Promise<{ vibeCheck: VibeCheck; chatRequest?: ChatRequest }> {
  return apiFetch<{ vibeCheck: VibeCheck; chatRequest?: ChatRequest }>(
    "/vibe-check",
    {
      method: "POST",
      body: JSON.stringify({
        recommendationId: input.recommendation_id,
        cravingId: input.craving_id,
        requesterId: input.requester_id,
        recommenderId: input.recommender_id,
        lovedIt: input.loved_it,
      }),
    },
  );
}

// ─────────────────────────────────────────────
// Chat Requests
// ─────────────────────────────────────────────

export async function getPendingChatRequests(): Promise<ChatRequest[]> {
  return apiFetch<ChatRequest[]>(
    `/chat-request/pending?userId=${encodeURIComponent(CURRENT_USER.id)}`,
    undefined,
    "requests",
  );
}

export async function respondToChatRequest(input: {
  request_id: string;
  accept: boolean;
}): Promise<{ chatRequest: ChatRequest; chat?: Chat }> {
  return apiFetch<{ chatRequest: ChatRequest; chat?: Chat }>(
    "/chat-request/respond",
    {
      method: "POST",
      body: JSON.stringify({
        chatRequestId: input.request_id,
        recommenderId: CURRENT_USER.id,
        accept: input.accept,
      }),
    },
  );
}

// ─────────────────────────────────────────────
// Chat & Messages
// ─────────────────────────────────────────────

export async function getChat(chatId: string): Promise<Chat | null> {
  try {
    return await apiFetch<Chat>(`/chat/${encodeURIComponent(chatId)}`, undefined, "chat");
  } catch {
    return null;
  }
}

export async function getMessages(chatId: string): Promise<ChatMessage[]> {
  return apiFetch<ChatMessage[]>(
    `/chat/${encodeURIComponent(chatId)}/messages`,
    undefined,
    "messages",
  );
}

export async function sendMessage(input: {
  chat_id: string;
  content: string;
}): Promise<ChatMessage> {
  return apiFetch<ChatMessage>("/chat/messages", {
    method: "POST",
    body: JSON.stringify({
      chatId: input.chat_id,
      senderId: CURRENT_USER.id,
      content: input.content,
    }),
  }, "message");
}
