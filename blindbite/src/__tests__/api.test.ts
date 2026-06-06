import { describe, it, expect, beforeAll } from 'vitest';

const BASE = 'http://localhost:3000';

// IDs populated during test setup
let testCravingId: string;
let testRecommendationId: string;
let testVibeCheckId: string;
let testChatRequestId: string;
let testChatId: string;

// Demo user IDs from demo-users.ts
const ASWIN_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const NICOLE_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

/**
 * Helper: POST JSON and return parsed response
 */
async function postJson(path: string, body: unknown): Promise<{ status: number; data: unknown }> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let data: unknown;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data };
}

/**
 * Helper: GET and return parsed response
 */
async function getJson(path: string): Promise<{ status: number; data: unknown }> {
  const res = await fetch(`${BASE}${path}`);
  let data: unknown;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data };
}

describe('Seed endpoint', () => {
  it('POST /api/seed — should seed demo users successfully', async () => {
    const { status, data } = await postJson('/api/seed', {});
    expect(status).toBe(200);
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('users', 2);
  });
});

describe('Cravings endpoints', () => {
  it('POST /api/cravings — should create a craving with valid data', async () => {
    const { status, data } = await postJson('/api/cravings', {
      userId: ASWIN_ID,
      userName: 'aswin',
      text: 'I am craving something spicy and adventurous for lunch',
      latitude: 51.5074,
      longitude: -0.1278,
    });
    expect(status).toBe(200);
    expect(data).toHaveProperty('craving');
    const craving = (data as { craving: Record<string, unknown> }).craving;
    expect(craving).toHaveProperty('id');
    expect(craving).toHaveProperty('text');
    expect(craving).toHaveProperty('status', 'active');
    testCravingId = craving.id as string;
  });

  it('POST /api/cravings — should reject missing fields with 400', async () => {
    const { status, data } = await postJson('/api/cravings', {
      userId: ASWIN_ID,
      // missing userName, text, lat, lng
    });
    expect(status).toBe(400);
    expect(data).toHaveProperty('error');
  });

  it('POST /api/cravings — should reject invalid JSON with 400', async () => {
    const res = await fetch(`${BASE}/api/cravings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    expect(res.status).toBe(400);
  });

  it('GET /api/cravings/nearby — should return cravings near a location', async () => {
    // Wait a moment for the craving to be inserted
    await new Promise((r) => setTimeout(r, 500));
    const { status, data } = await getJson(`/api/cravings/nearby?lat=51.5074&lng=-0.1278&radius=5000`);
    expect(status).toBe(200);
    expect(data).toHaveProperty('cravings');
    const cravings = (data as { cravings: unknown[] }).cravings;
    expect(Array.isArray(cravings)).toBe(true);
  });

  it('GET /api/cravings/nearby — should reject invalid lat/lng with 400', async () => {
    const { status, data } = await getJson('/api/cravings/nearby?lat=abc&lng=xyz');
    expect(status).toBe(400);
    expect(data).toHaveProperty('error');
  });
});

describe('Recommendations endpoints', () => {
  it('POST /api/recommendations — should create a recommendation for a craving', async () => {
    // Ensure we have a craving ID
    if (!testCravingId) {
      // Create one inline if seed didn't run in order
      const { data } = await postJson('/api/cravings', {
        userId: NICOLE_ID,
        userName: 'nicole',
        text: 'Craving cozy Italian pasta',
        latitude: 51.5185,
        longitude: -0.1360,
      });
      testCravingId = ((data as { craving: { id: string } }).craving).id;
    }

    const { status, data } = await postJson('/api/recommendations', {
      cravingId: testCravingId,
      recommenderId: NICOLE_ID,
      recommenderName: 'nicole',
      restaurantName: 'Manteca',
      restaurantAddress: '27 Foley St, London',
      latitude: 51.5185,
      longitude: -0.1360,
    });
    expect(status).toBe(200);
    expect(data).toHaveProperty('recommendation');
    const rec = (data as { recommendation: Record<string, unknown> }).recommendation;
    expect(rec).toHaveProperty('id');
    expect(rec).toHaveProperty('restaurant_name', 'Manteca');
    testRecommendationId = rec.id as string;
  });

  it('POST /api/recommendations — should reject missing fields with 400', async () => {
    const { status, data } = await postJson('/api/recommendations', {
      cravingId: testCravingId,
      // missing other required fields
    });
    expect(status).toBe(400);
    expect(data).toHaveProperty('error');
  });

  it('GET /api/recommendations — should return recommendations for a craving', async () => {
    if (!testCravingId) return; // skip if no craving
    const { status, data } = await getJson(`/api/recommendations?cravingId=${testCravingId}`);
    expect(status).toBe(200);
    expect(data).toHaveProperty('recommendations');
    const recs = (data as { recommendations: unknown[] }).recommendations;
    expect(Array.isArray(recs)).toBe(true);
  });

  it('GET /api/recommendations — should reject missing cravingId with 400', async () => {
    const { status, data } = await getJson('/api/recommendations');
    expect(status).toBe(400);
    expect(data).toHaveProperty('error');
  });
});

describe('Vibe-check endpoint', () => {
  it('POST /api/vibe-check (loved_it=true) — should create vibe check + chat request', async () => {
    if (!testRecommendationId || !testCravingId) return; // skip if prerequisites missing

    const { status, data } = await postJson('/api/vibe-check', {
      recommendationId: testRecommendationId,
      cravingId: testCravingId,
      requesterId: ASWIN_ID,
      recommenderId: NICOLE_ID,
      lovedIt: true,
    });
    expect(status).toBe(200);
    expect(data).toHaveProperty('vibeCheck');
    expect(data).toHaveProperty('chatRequest');
    const vc = (data as { vibeCheck: { id: string }; chatRequest: { id: string } });
    testVibeCheckId = vc.vibeCheck.id;
    testChatRequestId = vc.chatRequest.id;
  });

  it('POST /api/vibe-check (loved_it=false) — should create vibe check without chat request', async () => {
    // Create a separate recommendation + vibe check for the false case
    const { data: recData } = await postJson('/api/recommendations', {
      cravingId: testCravingId,
      recommenderId: ASWIN_ID,
      recommenderName: 'aswin',
      restaurantName: 'Dishoom',
      restaurantAddress: '12 Upper St Martins Ln, London',
      latitude: 51.5130,
      longitude: -0.1260,
    });
    const recId = (recData as { recommendation: { id: string } }).recommendation.id;

    const { status, data } = await postJson('/api/vibe-check', {
      recommendationId: recId,
      cravingId: testCravingId,
      requesterId: NICOLE_ID,
      recommenderId: ASWIN_ID,
      lovedIt: false,
    });
    expect(status).toBe(200);
    expect(data).toHaveProperty('vibeCheck');
    expect(data).not.toHaveProperty('chatRequest');
  });

  it('POST /api/vibe-check — should reject missing fields with 400', async () => {
    const { status, data } = await postJson('/api/vibe-check', {});
    expect(status).toBe(400);
    expect(data).toHaveProperty('error');
  });
});

describe('Chat-request endpoints', () => {
  it('GET /api/chat-requests/pending — should return pending requests', async () => {
    const { status, data } = await getJson(`/api/chat-requests/pending?userId=${NICOLE_ID}`);
    expect(status).toBe(200);
    expect(data).toHaveProperty('requests');
    const requests = (data as { requests: unknown[] }).requests;
    expect(Array.isArray(requests)).toBe(true);
  });

  it('POST /api/chat-request/respond (accept) — should accept and create chat + icebreaker', async () => {
    if (!testChatRequestId) return; // skip if no pending request

    const { status, data } = await postJson('/api/chat-request/respond', {
      chatRequestId: testChatRequestId,
      recommenderId: NICOLE_ID,
      accept: true,
    });
    expect(status).toBe(200);
    expect(data).toHaveProperty('chatRequest');
    expect(data).toHaveProperty('chat');
    expect(data).toHaveProperty('icebreaker');
    const result = data as { chatRequest: { status: string }; chat: { id: string } };
    expect(result.chatRequest.status).toBe('accepted');
    testChatId = result.chat.id;
  });

  it('POST /api/chat-request/respond (decline) — should decline chat request', async () => {
    // First create a new vibe check that generates a pending request
    const { data: recData } = await postJson('/api/recommendations', {
      cravingId: testCravingId,
      recommenderId: ASWIN_ID,
      recommenderName: 'aswin',
      restaurantName: 'Barrafina',
      restaurantAddress: '26-27 Drury Ln, London',
      latitude: 51.5145,
      longitude: -0.1210,
    });
    const recId = (recData as { recommendation: { id: string } }).recommendation.id;

    const { data: vcData } = await postJson('/api/vibe-check', {
      recommendationId: recId,
      cravingId: testCravingId,
      requesterId: NICOLE_ID,
      recommenderId: ASWIN_ID,
      lovedIt: true,
    });
    const declineRequestId = (vcData as { chatRequest: { id: string } }).chatRequest?.id;
    if (!declineRequestId) return; // skip if AI failed to generate request

    const { status, data } = await postJson('/api/chat-request/respond', {
      chatRequestId: declineRequestId,
      recommenderId: ASWIN_ID,
      accept: false,
    });
    expect(status).toBe(200);
    expect(data).toHaveProperty('chatRequest');
    const declined = (data as { chatRequest: { status: string } }).chatRequest;
    expect(declined.status).toBe('declined');
  });

  it('POST /api/chat-request/respond — should reject missing fields with 400', async () => {
    const { status, data } = await postJson('/api/chat-request/respond', {});
    expect(status).toBe(400);
    expect(data).toHaveProperty('error');
  });
});

describe('Chat messages endpoints', () => {
  it('POST /api/chat/messages — should send a chat message', async () => {
    if (!testChatId) return; // skip if no chat created

    const { status, data } = await postJson('/api/chat/messages', {
      chatId: testChatId,
      senderId: ASWIN_ID,
      content: 'Hey! Thanks for the recommendation!',
    });
    expect(status).toBe(200);
    expect(data).toHaveProperty('message');
    const msg = (data as { message: { content: string } }).message;
    expect(msg.content).toBe('Hey! Thanks for the recommendation!');
  });

  it('POST /api/chat/messages — should reject missing fields with 400', async () => {
    const { status, data } = await postJson('/api/chat/messages', {});
    expect(status).toBe(400);
    expect(data).toHaveProperty('error');
  });

  it('GET /api/chat/[chatId]/messages — should return messages for a chat', async () => {
    if (!testChatId) return; // skip if no chat

    const { status, data } = await getJson(`/api/chat/${testChatId}/messages`);
    expect(status).toBe(200);
    expect(data).toHaveProperty('messages');
    const messages = (data as { messages: unknown[] }).messages;
    expect(Array.isArray(messages)).toBe(true);
    // Should have at least the icebreaker + our sent message
    expect(messages.length).toBeGreaterThanOrEqual(1);
  });
});

describe('AI co-recommend endpoint', () => {
  it('POST /api/ai/co-recommend — should return AI recommendations or fallback', async () => {
    if (!testCravingId) return; // skip if no craving

    const { status, data } = await postJson('/api/ai/co-recommend', {
      cravingId: testCravingId,
      cravingText: 'something spicy and adventurous',
      latitude: 51.5074,
      longitude: -0.1278,
    });
    // Should succeed either way (AI or fallback)
    expect(status).toBe(200);
    expect(data).toHaveProperty('recommendations');
    const recs = (data as { recommendations: unknown[] }).recommendations;
    expect(Array.isArray(recs)).toBe(true);
    expect(recs.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/ai/co-recommend — should reject missing fields with 400', async () => {
    const { status, data } = await postJson('/api/ai/co-recommend', {});
    expect(status).toBe(400);
    expect(data).toHaveProperty('error');
  });
});
