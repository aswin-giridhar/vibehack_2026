# BlindBite v2 — Aswin's Backend Spec

> *Backend + AI architecture for the BlindBite v2 pivot. Social food/drink recommendation app.*

**Team:** Aswin (backend) | Nicole (frontend)
**Deadline:** 12:00 Sunday 7 June 2026
**Stack:** Next.js 15 API Routes + Supabase + GLM-4/Claude + GLM-Image

---

## Key Optimizations from v1

1. **API stubs first** — ship all routes with mock data in Phase 1. Nicole builds every screen against stubs while you implement real AI behind them in Phase 2.
2. **Shared AI utilities** — all AI routes share the same "call model, parse JSON" pattern. Build ONE utility, then every route is a thin wrapper.
3. **4 AI layers share the same call pattern** — Pin Enrichment, Smart Match, Co-recommender, Icebreaker are all just different prompts to GLM-4.

---

## Supabase Schema

### Enable PostGIS Extension
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Table: `users`
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  taste_profile JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Table: `cravings`
```sql
CREATE TABLE cravings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  user_name TEXT NOT NULL,
  text TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE cravings;

-- Index for nearby queries
CREATE INDEX idx_cravings_location ON cravings USING GIST (location);

-- RLS
ALTER TABLE cravings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for hackathon" ON cravings FOR ALL USING (true) WITH CHECK (true);
```

### Table: `recommendations`
```sql
CREATE TABLE recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  craving_id UUID REFERENCES cravings(id),
  recommender_id UUID REFERENCES users(id),
  recommender_name TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  restaurant_address TEXT,
  location GEOGRAPHY(POINT, 4326),
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  image_url TEXT,
  vibe_summary TEXT,
  tags TEXT[] DEFAULT '{}',
  is_ai_generated BOOLEAN DEFAULT false,
  smart_match_score FLOAT DEFAULT 0,
  is_best_match BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE recommendations;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for hackathon" ON recommendations FOR ALL USING (true) WITH CHECK (true);
```

### Table: `vibe_checks`
```sql
CREATE TABLE vibe_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recommendation_id UUID REFERENCES recommendations(id),
  craving_id UUID REFERENCES cravings(id),
  requester_id UUID REFERENCES users(id),
  recommender_id UUID REFERENCES users(id),
  loved_it BOOLEAN NOT NULL,
  chat_requested BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Table: `chat_requests`
```sql
CREATE TABLE chat_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recommendation_id UUID REFERENCES recommendations(id),
  craving_id UUID REFERENCES cravings(id),
  requester_id UUID REFERENCES users(id),
  recommender_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  icebreaker TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ
);

ALTER PUBLICATION supabase_realtime ADD TABLE chat_requests;
ALTER TABLE chat_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for hackathon" ON chat_requests FOR ALL USING (true) WITH CHECK (true);
```

### Table: `chats`
```sql
CREATE TABLE chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_request_id UUID REFERENCES chat_requests(id),
  requester_id UUID REFERENCES users(id),
  recommender_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Table: `chat_messages`
```sql
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id),
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  is_icebreaker BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for hackathon" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
```

---

## API Routes

### Craving Routes

#### `POST /api/cravings` — Post a new craving
```typescript
// Request
{
  userId: string,
  userName: string,
  text: string,
  latitude: number,
  longitude: number
}

// Response
{
  craving: {
    id: string,
    userId: string,
    userName: string,
    text: string,
    latitude: number,
    longitude: number,
    status: "active",
    createdAt: string
  }
}
```

After inserting, **trigger AI co-recommender** in the background (don't block the response).

#### `GET /api/cravings/nearby?lat=51.5&lng=-0.12&radius=2000` — Get nearby cravings
```typescript
// Response
{
  cravings: Craving[]
}
```

Uses PostGIS `ST_DWithin` for location queries.

---

### Recommendation Routes

#### `POST /api/recommendations` — Pin a restaurant (human)
```typescript
// Request
{
  cravingId: string,
  recommenderId: string,
  recommenderName: string,
  restaurantName: string,
  restaurantAddress?: string,
  latitude: number,
  longitude: number
}

// Response (after AI enrichment)
{
  recommendation: {
    id: string,
    cravingId: string,
    recommenderName: string,
    restaurantName: string,
    imageUrl: string,       // AI-generated
    vibeSummary: string,    // AI-generated
    tags: string[],         // AI-generated
    isAiGenerated: false,
    smartMatchScore: number,
    isBestMatch: boolean
  }
}
```

**This is the AI-heavy route.** When a human pins a restaurant:
1. Call GLM-4 to generate vibe summary + tags
2. Call GLM-Image to generate dish/drink image
3. Call GLM-4 to compute smart match score
4. Update best match flags across all recs for this craving
5. Return enriched recommendation

#### `GET /api/recommendations?cravingId=xxx` — Get all recs for a craving
```typescript
// Response
{
  recommendations: Recommendation[]
}
```

---

### Vibe Check and Chat Routes

#### `POST /api/vibe-check` — Submit vibe check
```typescript
// Request
{
  recommendationId: string,
  cravingId: string,
  requesterId: string,
  recommenderId: string,
  lovedIt: boolean
}

// Response
{
  vibeCheck: VibeCheck,
  chatRequest?: ChatRequest  // only if lovedIt === true
}
```

If `lovedIt === true`:
1. Insert into `vibe_checks` with `chat_requested = true`
2. Insert into `chat_requests` with `status = 'pending'`
3. Generate AI icebreaker (async, store on chat_request)
4. Return the chat request

If `lovedIt === false`:
1. Insert into `vibe_checks` with `chat_requested = false`
2. Return just the vibe check

#### `POST /api/chat-request/respond` — Accept or decline
```typescript
// Request
{
  chatRequestId: string,
  recommenderId: string,
  accept: boolean
}

// Response (if accepted)
{
  chatRequest: ChatRequest,
  chat: Chat,
  icebreaker: ChatMessage
}
```

If `accept === true`:
1. Update `chat_requests` status to `accepted`
2. Create `chats` entry
3. Insert icebreaker as first `chat_messages` entry with `is_icebreaker = true`
4. Return everything

If `accept === false`:
1. Update `chat_requests` status to `declined`
2. Return just the updated chat request

#### `GET /api/chat-requests/pending?userId=xxx` — Get pending requests
```typescript
// Response
{
  requests: ChatRequest[]
}
```

#### `POST /api/chat/messages` — Send a chat message
```typescript
// Request
{
  chatId: string,
  senderId: string,
  content: string
}

// Response
{
  message: ChatMessage
}
```

#### `GET /api/chat/[chatId]/messages` — Get chat messages
```typescript
// Response
{
  messages: ChatMessage[]
}
```

---

### AI-Specific Route

#### `POST /api/ai/co-recommend` — AI co-recommender
```typescript
// Request
{
  cravingId: string,
  cravingText: string,
  latitude: number,
  longitude: number
}

// Response
{
  recommendations: Recommendation[]  // 2-3 AI-generated pins
}
```

This is called automatically after a craving is posted (with a small delay). It:
1. Uses GLM-4 to suggest 2-3 real restaurant types/names that match the craving
2. For each suggestion, generates a pin with plausible coordinates near the user
3. Enriches each with image + vibe + tags (same as human pins)
4. Inserts as `is_ai_generated = true`
5. Returns the enriched recommendations

**Demo fallback:** Hardcode 2-3 London restaurants for the demo location. If AI fails, return these.

---

## AI Prompts

### Pin Enrichment Prompt (GLM-4)
```
You are a food and drink expert. Given this restaurant recommendation:
- Restaurant: {restaurantName}
- Craving: {cravingText}

Generate a JSON object:
{
  "vibe_summary": "One warm, descriptive sentence about the vibe (e.g., 'Cozy Portuguese spot, their octopus is legendary')",
  "tags": ["3-5 lowercase tags like: cozy, seafood, datenight, authentic, lively"]
}

Return ONLY the JSON object.
```

### Pin Image Prompt (GLM-Image)
```
A beautiful, appetizing food photography style image of {dishName} at a {restaurantType} restaurant. Warm lighting, shallow depth of field, restaurant ambiance in background. No text overlays.
```

### Smart Match Prompt (GLM-4)
```
Given this craving: "{cravingText}"
And these recommendations:
{list of recommendations with name, vibe_summary, tags}

Rank them by how well they match the craving (0-1 score).
Return JSON array: [{"id": "...", "score": 0.95}, ...]
Return ONLY the JSON array.
```

### Co-Recommendation Prompt (GLM-4)
```
A user near London is craving: "{cravingText}"

Suggest 2-3 real types of restaurants or specific well-known spots near central London that would satisfy this craving.
Return JSON array:
[
  {
    "name": "Restaurant Name",
    "address": "Approximate address",
    "cuisine_type": "Portuguese",
    "dish_to_image": "grilled octopus with potatoes",
    "vibe_summary": "One sentence vibe",
    "tags": ["tag1", "tag2", "tag3"]
  }
]
Return ONLY the JSON array.
```

### Icebreaker Prompt (GLM-4)
```
Two people just connected over a food recommendation. Person A craved: "{cravingText}". Person B recommended: "{restaurantName}" described as: "{vibeSummary}".

Generate one warm, fun icebreaker message (max 20 words) that references their shared food interest. Include one relevant emoji. No quotation marks.
```

---

## AI Utilities

```typescript
// src/lib/ai.ts

// GLM-4 text call
export async function callGLM4(prompt: string, systemPrompt?: string): Promise<string>

// GLM-Image call
export async function callGLMImage(prompt: string): Promise<string>

// Claude fallback
export async function callClaude(prompt: string, systemPrompt?: string): Promise<string>

// JSON parser (handles AI response noise)
export function parseAIJson<T>(raw: string): T

// Combined: try GLM-4, fallback to Claude
export async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    return await callGLM4(prompt, systemPrompt);
  } catch {
    return await callClaude(prompt, systemPrompt);
  }
}
```

---

## Phase 1: Foundation + Stubs (45 min)

### 1.1 Scaffold Project (10 min)
- [ ] `npx create-next-app@latest blindbite --typescript --tailwind --eslint --app --src-dir`
- [ ] Install deps: `@supabase/supabase-js`
- [ ] `.env.local` with all placeholders (Supabase + GLM + Claude keys)
- [ ] `src/lib/env.ts` for typed env access

### 1.2 Supabase Setup (10 min)
- [ ] Create free Supabase project
- [ ] Run all SQL from schema above
- [ ] Enable Realtime on: cravings, recommendations, chat_requests, chat_messages
- [ ] Copy credentials to `.env.local`
- [ ] Create `src/lib/supabase.ts` (client + admin)

### 1.3 Types + AI Utilities (10 min)
- [ ] Create `src/lib/types.ts` with all TypeScript interfaces
- [ ] Create `src/lib/ai.ts` with shared AI call utilities (see above)

### 1.4 Demo Data (10 min)
- [ ] Create `src/data/demo-restaurants.ts` with 10-15 hardcoded London restaurants with lat/lng, names, addresses
- [ ] Create `src/data/demo-users.ts` with 2 demo users (aswin, nicole)

### 1.5 API Stubs (5 min)
- [ ] `POST /api/cravings` returns mock craving
- [ ] `GET /api/cravings/nearby` returns mock cravings array
- [ ] `POST /api/recommendations` returns mock enriched recommendation
- [ ] `GET /api/recommendations?cravingId=xxx` returns mock recs
- [ ] `POST /api/vibe-check` returns mock vibe check
- [ ] `POST /api/chat-request/respond` returns mock chat
- [ ] `GET /api/chat-requests/pending` returns empty array
- [ ] `POST /api/chat/messages` returns mock message
- [ ] `GET /api/chat/[chatId]/messages` returns mock messages with icebreaker
- [ ] `POST /api/ai/co-recommend` returns 2 mock AI recommendations

### 1.6 Share with Nicole
- [ ] Push to GitHub
- [ ] Share Supabase credentials
- [ ] Nicole can now build ALL screens with mock data

---

## Phase 2: Real AI Implementation (90 min)

### Track A: Craving + Recommendation Pipeline (30 min)

#### A1. Real Craving Post (5 min)
- [ ] Replace stub with real Supabase insert
- [ ] After insert, call AI co-recommender in background (don't block response)

#### A2. Real Nearby Cravings (10 min)
- [ ] Replace stub with PostGIS query:
```sql
SELECT * FROM cravings
WHERE status = 'active'
AND ST_DWithin(location, ST_MakePoint($1, $2)::geography, $3)
ORDER BY created_at DESC;
```

#### A3. Real Recommendation + AI Enrichment (15 min)
- [ ] Replace stub with real Supabase insert
- [ ] Call `callAI(PIN_ENRICHMENT_PROMPT)` to get vibe_summary + tags
- [ ] Call `callGLMImage(IMAGE_PROMPT)` to get image URL
- [ ] Call `callAI(SMART_MATCH_PROMPT)` to get scores, update best match flags
- [ ] Write enriched recommendation back to Supabase
- [ ] Real-time broadcasts to all connected clients

### Track B: AI Co-Recommendation Pipeline (20 min)

#### B1. Real Co-Recommendation (15 min)
- [ ] Replace stub with real GLM-4 call using `CO_RECOMMENDATION_PROMPT`
- [ ] Parse response, create recommendation entries with `is_ai_generated = true`
- [ ] For each: generate image via GLM-Image, write vibe + tags
- [ ] Insert into Supabase for real-time broadcast

#### B2. Demo Fallback (5 min)
- [ ] If GLM-4 or GLM-Image fails, return hardcoded London restaurants from `demo-restaurants.ts`

### Track C: Vibe Check + Chat Pipeline (40 min)

#### C1. Real Vibe Check (10 min)
- [ ] Replace stub with real Supabase insert
- [ ] If `lovedIt === true`, create chat_request entry + generate icebreaker (async)

#### C2. Real Chat Request Response (15 min)
- [ ] If accepted: update chat_request, create chat, insert icebreaker message
- [ ] If declined: update chat_request status only

#### C3. Real Icebreaker Generation (5 min)
- [ ] Call `callAI(ICEBREAKER_PROMPT)` with craving text + restaurant info
- [ ] Insert as first chat_message with `is_icebreaker = true`

#### C4. Real Chat Messages (10 min)
- [ ] Insert messages into chat_messages
- [ ] Fetch messages for a chat
- [ ] Real-time broadcasts via Supabase

---

## Phase 3: Integration + Deploy (30 min)

### 3.1 Wire Everything (10 min)
- [ ] Verify all stubs replaced with real implementations
- [ ] Test full flow: post craving, AI co-recommend, human pin, enrichment, pick, vibe check, chat request, accept, chat

### 3.2 Vercel Deploy (10 min)
- [ ] `npx vercel` to deploy
- [ ] Set all env vars in Vercel dashboard
- [ ] Verify deployed URL works on mobile

### 3.3 Practice Demo (10 min)
- [ ] Run through 3-minute demo script with Nicole on two devices
- [ ] Prepare screen-recorded backup

---

## Phase 4: Z.ai Award Evidence (15 min)

- [ ] Use GLM-4 for at least one dev task
- [ ] Document the workflow: what Claude did vs what GLM-4 did
- [ ] Save evidence to `/evidence/`
- [ ] Trigger Ortie capture

---

## API Contract Summary

| Endpoint | Method | Request | Response | Phase |
|---|---|---|---|---|
| `/api/cravings` | POST | `{ userId, userName, text, lat, lng }` | `{ craving }` | 1.5 Stub, A1 Real |
| `/api/cravings/nearby` | GET | `?lat&lng&radius` | `{ cravings }` | 1.5 Stub, A2 Real |
| `/api/recommendations` | POST | `{ cravingId, recommenderId, restaurantName, lat, lng }` | `{ recommendation }` (AI-enriched) | 1.5 Stub, A3 Real |
| `/api/recommendations` | GET | `?cravingId` | `{ recommendations }` | 1.5 Stub |
| `/api/vibe-check` | POST | `{ recommendationId, cravingId, requesterId, recommenderId, lovedIt }` | `{ vibeCheck, chatRequest? }` | 1.5 Stub, C1 Real |
| `/api/chat-request/respond` | POST | `{ chatRequestId, recommenderId, accept }` | `{ chatRequest, chat?, icebreaker? }` | 1.5 Stub, C2 Real |
| `/api/chat-requests/pending` | GET | `?userId` | `{ requests }` | 1.5 Stub |
| `/api/chat/messages` | POST | `{ chatId, senderId, content }` | `{ message }` | 1.5 Stub, C4 Real |
| `/api/chat/[chatId]/messages` | GET | — | `{ messages }` | 1.5 Stub, C4 Real |
| `/api/ai/co-recommend` | POST | `{ cravingId, cravingText, lat, lng }` | `{ recommendations }` | 1.5 Stub, B1 Real |

---

*BlindBite v2 Backend Spec, 2026-06-06. For Aswin.*
