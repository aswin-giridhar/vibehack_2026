// Mock-first API shim. Matches Aswin's backend contract one-for-one,
// so swapping each function body to `fetch('/api/...')` later is the only change needed.

import type {
  Chat,
  ChatMessage,
  ChatRequest,
  Craving,
  Recommendation,
  VibeCheck,
} from "./blindbite-types";
import { CURRENT_USER, DEFAULT_LOCATION } from "./user";
import { MOCK_IMAGES, MOCK_RESTAURANTS } from "./mock-restaurants";

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

type Store = {
  cravings: Craving[];
  recommendations: Recommendation[];
  vibeChecks: VibeCheck[];
  chatRequests: ChatRequest[];
  chats: Chat[];
  messages: ChatMessage[];
};

// Seed the demo with one in-flight craving from @aswin and one human + one AI rec.
const seedCraving: Craving = {
  id: "c-seed",
  user_id: "u-aswin",
  user_name: "aswin",
  text: "best grilled octopus, somewhere candlelit",
  latitude: 51.5135,
  longitude: -0.134,
  status: "active",
  created_at: now(),
};

const seedRecs: Recommendation[] = [
  {
    id: "r-seed-1",
    craving_id: "c-seed",
    recommender_id: "u-nicole",
    recommender_name: "nicole",
    restaurant_name: "o pescador",
    restaurant_address: "soho, london",
    latitude: 51.5135,
    longitude: -0.134,
    image_url: MOCK_IMAGES.octopus,
    vibe_summary:
      "a tiny portuguese room where the octopus has been on the menu since '94.",
    tags: ["portuguese", "seafood", "candlelit"],
    is_ai_generated: false,
    smart_match_score: 0.94,
    is_best_match: true,
    created_at: now(),
  },
  {
    id: "r-seed-2",
    craving_id: "c-seed",
    recommender_id: "ai",
    recommender_name: "ai",
    restaurant_name: "casual seafood grill",
    restaurant_address: "borough, london",
    latitude: 51.5055,
    longitude: -0.0905,
    image_url: MOCK_IMAGES.wine,
    vibe_summary:
      "louder, brighter, smoky grills and a queue you don't mind.",
    tags: ["lively", "grilled", "casual"],
    is_ai_generated: true,
    smart_match_score: 0.71,
    is_best_match: false,
    created_at: now(),
  },
];

const store: Store = {
  cravings: [seedCraving],
  recommendations: [...seedRecs],
  vibeChecks: [],
  chatRequests: [],
  chats: [],
  messages: [],
};

// expose to dev tools
if (typeof window !== "undefined") {
  (window as unknown as { __blindbite__: Store }).__blindbite__ = store;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function pickAiImage(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("matcha") || t.includes("coffee") || t.includes("café"))
    return MOCK_IMAGES.matcha;
  if (t.includes("wine") || t.includes("date") || t.includes("bar"))
    return MOCK_IMAGES.wine;
  if (t.includes("ramen") || t.includes("noodle") || t.includes("japanese"))
    return MOCK_IMAGES.ramen;
  if (t.includes("dumpling") || t.includes("dim sum") || t.includes("chinese"))
    return MOCK_IMAGES.dumplings;
  if (t.includes("pastry") || t.includes("dessert") || t.includes("nata"))
    return MOCK_IMAGES.pastel;
  return MOCK_IMAGES.octopus;
}

export async function postCraving(input: {
  text: string;
  latitude?: number;
  longitude?: number;
}): Promise<Craving> {
  await delay(250);
  const c: Craving = {
    id: "c-" + uid(),
    user_id: CURRENT_USER.id,
    user_name: CURRENT_USER.name,
    text: input.text,
    latitude: input.latitude ?? DEFAULT_LOCATION.latitude,
    longitude: input.longitude ?? DEFAULT_LOCATION.longitude,
    status: "active",
    created_at: now(),
  };
  store.cravings.unshift(c);
  // kick off AI co-recommendations in the background
  setTimeout(() => {
    getAiCoRecommendations(c.id).catch(() => {});
  }, 1400);
  return c;
}

export async function getNearbyCravings(): Promise<Craving[]> {
  await delay(120);
  return store.cravings.filter((c) => c.status === "active");
}

export async function getCraving(id: string): Promise<Craving | null> {
  await delay(60);
  return store.cravings.find((c) => c.id === id) ?? null;
}

export async function getRecommendations(
  cravingId: string,
): Promise<Recommendation[]> {
  await delay(120);
  return store.recommendations
    .filter((r) => r.craving_id === cravingId)
    .sort((a, b) => b.smart_match_score - a.smart_match_score);
}

export async function getRecommendation(
  id: string,
): Promise<Recommendation | null> {
  await delay(60);
  return store.recommendations.find((r) => r.id === id) ?? null;
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
  await delay(800); // simulate AI enrichment
  const rec: Recommendation = {
    id: "r-" + uid(),
    craving_id: input.craving_id,
    recommender_id: CURRENT_USER.id,
    recommender_name: CURRENT_USER.name,
    restaurant_name: input.restaurant_name,
    restaurant_address: input.restaurant_address,
    latitude: input.latitude,
    longitude: input.longitude,
    image_url: input.image_url,
    vibe_summary: input.vibe_summary,
    tags: input.tags,
    is_ai_generated: false,
    smart_match_score: 0.88,
    is_best_match: false,
    created_at: now(),
  };
  store.recommendations.push(rec);
  // promote highest score
  const recs = store.recommendations.filter((r) => r.craving_id === input.craving_id);
  const top = recs.reduce((a, b) => (a.smart_match_score > b.smart_match_score ? a : b));
  recs.forEach((r) => (r.is_best_match = r.id === top.id));
  return rec;
}

export async function getAiCoRecommendations(
  cravingId: string,
): Promise<Recommendation[]> {
  await delay(400);
  const c = store.cravings.find((c) => c.id === cravingId);
  if (!c) return [];
  const existing = store.recommendations.filter((r) => r.craving_id === cravingId);
  if (existing.some((r) => r.is_ai_generated)) return existing.filter((r) => r.is_ai_generated);

  const pick = MOCK_RESTAURANTS.slice(0, 2);
  const recs: Recommendation[] = pick.map((p, i) => ({
    id: "r-ai-" + uid(),
    craving_id: cravingId,
    recommender_id: "ai",
    recommender_name: "ai",
    restaurant_name: p.name,
    restaurant_address: p.address,
    latitude: p.latitude + i * 0.002,
    longitude: p.longitude + i * 0.002,
    image_url: pickAiImage(c.text),
    vibe_summary: p.vibe,
    tags: p.tags,
    is_ai_generated: true,
    smart_match_score: 0.65 - i * 0.05,
    is_best_match: false,
    created_at: now(),
  }));
  store.recommendations.push(...recs);
  // re-pick best
  const all = store.recommendations.filter((r) => r.craving_id === cravingId);
  if (all.length) {
    const top = all.reduce((a, b) => (a.smart_match_score > b.smart_match_score ? a : b));
    all.forEach((r) => (r.is_best_match = r.id === top.id));
  }
  return recs;
}

export async function postVibeCheck(input: {
  recommendation_id: string;
  loved_it: boolean;
}): Promise<{ vibeCheck: VibeCheck; chatRequest?: ChatRequest }> {
  await delay(200);
  const rec = store.recommendations.find((r) => r.id === input.recommendation_id);
  const vc: VibeCheck = {
    id: "v-" + uid(),
    recommendation_id: input.recommendation_id,
    requester_id: CURRENT_USER.id,
    loved_it: input.loved_it,
    chat_requested: input.loved_it && !!rec && !rec.is_ai_generated,
    created_at: now(),
  };
  store.vibeChecks.push(vc);

  if (vc.chat_requested && rec) {
    const cr: ChatRequest = {
      id: "cr-" + uid(),
      recommendation_id: rec.id,
      requester_id: CURRENT_USER.id,
      requester_name: CURRENT_USER.name,
      recommender_id: rec.recommender_id,
      recommender_name: rec.recommender_name,
      restaurant_name: rec.restaurant_name,
      status: "pending",
      icebreaker: `you both clearly take ${rec.tags[0] ?? "good"} food seriously. ask them what to order next.`,
      created_at: now(),
      responded_at: null,
    };
    store.chatRequests.push(cr);
    return { vibeCheck: vc, chatRequest: cr };
  }
  return { vibeCheck: vc };
}

export async function getPendingChatRequests(): Promise<ChatRequest[]> {
  await delay(120);
  // demo: surface ALL pending requests so the user can play both sides
  return store.chatRequests.filter((r) => r.status === "pending");
}

export async function respondToChatRequest(input: {
  request_id: string;
  accept: boolean;
}): Promise<{ chatRequest: ChatRequest; chat?: Chat }> {
  await delay(200);
  const cr = store.chatRequests.find((r) => r.id === input.request_id);
  if (!cr) throw new Error("not found");
  cr.status = input.accept ? "accepted" : "declined";
  cr.responded_at = now();
  if (!input.accept) return { chatRequest: cr };

  const chat: Chat = {
    id: "ch-" + uid(),
    chat_request_id: cr.id,
    other_user_name: cr.requester_name === CURRENT_USER.name ? cr.recommender_name : cr.requester_name,
    restaurant_name: cr.restaurant_name,
    created_at: now(),
  };
  store.chats.push(chat);
  store.messages.push({
    id: "m-" + uid(),
    chat_id: chat.id,
    sender_id: "ai",
    sender_name: "blindbite",
    content: cr.icebreaker,
    is_icebreaker: true,
    created_at: now(),
  });
  return { chatRequest: cr, chat };
}

export async function getChat(chatId: string): Promise<Chat | null> {
  await delay(60);
  return store.chats.find((c) => c.id === chatId) ?? null;
}

export async function getMessages(chatId: string): Promise<ChatMessage[]> {
  await delay(80);
  return store.messages.filter((m) => m.chat_id === chatId);
}

export async function sendMessage(input: {
  chat_id: string;
  content: string;
}): Promise<ChatMessage> {
  await delay(120);
  const m: ChatMessage = {
    id: "m-" + uid(),
    chat_id: input.chat_id,
    sender_id: CURRENT_USER.id,
    sender_name: CURRENT_USER.name,
    content: input.content,
    is_icebreaker: false,
    created_at: now(),
  };
  store.messages.push(m);
  return m;
}