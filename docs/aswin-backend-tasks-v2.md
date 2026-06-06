# BlindBite — Aswin's Backend Task List (v2 — Optimized)

> *Parallelized, API-stub-first, grouped by pipeline. Wall-clock time: ~2.5 hrs (down from ~5.5 hrs sequential).*

**Team:** Aswin (backend) | Nicole (frontend)
**Deadline:** 12:00 Sunday 7 June 2026
**Stack:** Next.js 15 API Routes + Supabase + GLM-4/Claude + GLM-Image

---

## Three Key Optimizations

1. **API stubs first** — ship all routes with mock data in Phase 1. Nicole builds every screen against stubs while you implement real AI behind them in Phase 2.
2. **Shared AI utilities** — all 5+ AI routes share the same "call model → parse JSON" pattern. Build ONE utility, then every route is a thin wrapper with a different prompt.
3. **Three parallel pipelines** — Menu, Personalization, and Game are independent after Phase 1. Run them concurrently via subagents.

---

## Phase 1: Foundation + Stubs (45 min) 🔴 UNBLOCKS NICOLE

> **Goal:** Nicole can build ALL screens after this phase. Every API returns mock data.

### 1.1 Scaffold Project (10 min)
- [ ] `npx create-next-app@latest blindbite --typescript --tailwind --eslint --app --src-dir`
- [ ] Install deps: `@supabase/supabase-js`, `qrcode.react`
- [ ] `.env.local` with all placeholders (Supabase + GLM + Claude keys)
- [ ] `src/lib/env.ts` for typed env access
- [ ] Push scaffold to GitHub

### 1.2 Supabase Setup (10 min)
- [ ] Create free Supabase project
- [ ] Create `game_rooms` table + enable Realtime + set RLS policy:
  ```sql
  CREATE TABLE game_rooms (
    room_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting',
    state JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
  ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Allow all for hackathon" ON game_rooms FOR ALL USING (true) WITH CHECK (true);
  ```
- [ ] Copy credentials → `.env.local`
- [ ] Create `src/lib/supabase.ts` (client + admin)

### 1.3 Types + AI Utilities (10 min)
- [ ] Create `src/lib/types.ts` — all shared TypeScript interfaces (Player, Dish, MenuData, GameState, GameStatus, GameRoom)
- [ ] Create `src/lib/ai.ts` — shared AI call utilities:
  ```typescript
  // One function for all GLM-4 text calls
  export async function callGLM4(prompt: string, systemPrompt?: string): Promise<string>

  // One function for all GLM-4 vision calls
  export async function callGLM4Vision(imageBase64: string, prompt: string): Promise<string>

  // One function for all GLM-Image calls
  export async function callGLMImage(prompt: string): Promise<string>

  // Claude fallback wrapper
  export async function callClaude(prompt: string, systemPrompt?: string): Promise<string>

  // JSON parser that handles AI response noise (extracts JSON from markdown blocks, etc.)
  export function parseAIJson<T>(raw: string): T
  ```
- [ ] Create `src/lib/room-code.ts` — 6-char safe alphabet generator
- [ ] Create `src/lib/prompts/chef-marco.ts` — Chef Marco system prompt constant

### 1.4 Room Management APIs — REAL (15 min)
These are pure CRUD — no AI needed, implement for real now:
- [ ] `POST /api/rooms` — create room with host player
- [ ] `POST /api/rooms/[roomId]/join` — add player to room
- [ ] `PATCH /api/rooms/[roomId]` — update status/state (the workhorse)
- [ ] `GET /api/rooms/[roomId]` — fetch current state

### 1.5 API Stubs — All Remaining Routes (5 min)
> **Each stub returns hardcoded mock data matching the real response shape. Nicole wires her frontend to these immediately.**

- [ ] `POST /api/parse-menu` → returns sample Thai menu `{ dishes: Dish[] }`
- [ ] `POST /api/generate-images` → returns placeholder image URLs `{ images: Record<dishId, url> }`
- [ ] `POST /api/taste-dna` → returns hardcoded vector `{ vector: [0.8,0.6,0.3,0.5,0.9], summary: "..." }`
- [ ] `POST /api/personalized-recs` → returns top 3 dishIds `{ recommendations: ["d1","d3","d7"] }`
- [ ] `POST /api/generate-hint` → returns sample hint `{ hint: "This dish has roots in Southeast Asian cuisine..." }`
- [ ] `POST /api/rooms/[roomId]/advance` → transitions status + returns updated state
- [ ] `GET /api/sample-menu?type=thai` → returns full sample menu

### 1.6 Share with Nicole
- [ ] Push to GitHub
- [ ] Share Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] Nicole can now build ALL screens with mock data ✅

---

## Phase 2: Three Parallel Pipelines (~60 min each, run concurrently)

> **All three tracks are independent.** Use subagents/worktrees to build them in parallel, or do them sequentially if solo. Each track replaces its stubs with real AI implementations.

---

### Track A: Menu Pipeline 🔴 THE "WOW MOMENT"

> Parses a photo → renders beautiful dish images. This is the 10-second demo magic.

#### A1. Real Parse Menu — `POST /api/parse-menu` (20 min)
- [ ] Replace stub with real GLM-4 vision call
- [ ] Accept `FormData` with image file
- [ ] Call `callGLM4Vision(imageBase64, MENU_PARSE_PROMPT)`:
  ```
  You are a menu parser. Analyze this restaurant menu photo and extract every dish.
  Return a JSON array where each item has: "id", "name", "description", "price".
  Return ONLY the JSON array, no other text.
  ```
- [ ] Parse response with `parseAIJson<Dish[]>()`
- [ ] **Fallback:** if GLM-4 fails → try `callClaude()` with same prompt
- [ ] **Double fallback:** if both fail → return sample menu

#### A2. Real Generate Images — `POST /api/generate-images` (20 min)
- [ ] Replace stub with real GLM-Image calls
- [ ] Accept `{ dishes: Dish[] }`
- [ ] For each dish → `callGLMImage(FOOD_PHOTO_PROMPT)` with dish-specific prompt
- [ ] **Generate in parallel** with `Promise.all` (not sequential!)
- [ ] Return `{ images: Record<dishId, url> }`
- [ ] **Fallback:** if GLM-Image fails → return Unsplash placeholder URLs
- [ ] **Cost:** ~$0.015/image × 12 = $0.18/session

#### A3. Sample Menu Data (10 min)
- [ ] Create `src/data/sample-menus.ts` with 3 pre-parsed London menus:
  - Thai (10-12 dishes) — primary demo menu
  - Italian (10-12 dishes)
  - British pub (8-10 dishes)
- [ ] Wire `GET /api/sample-menu` to return these
- [ ] This is the **demo safety net**

#### A4. Pre-seeded Demo Room (10 min)
- [ ] Create `src/data/demo-seed.ts` with a fully pre-populated game:
  - 3 fake players with Taste-DNA
  - Pre-parsed Thai menu with cached image URLs
  - Pre-generated hints
- [ ] `POST /api/rooms/demo-seed` → creates this room instantly
- [ ] **Nuclear fallback:** if everything else fails, demo from this room

---

### Track B: Personalization Pipeline 🟡 "✨ FOR YOU" BADGES

> Builds Taste-DNA from swipes → recommends dishes per player.

#### B1. Real Taste-DNA — `POST /api/taste-dna` (15 min)
- [ ] Replace stub with real GLM-4 call
- [ ] Accept `{ swipes: Array<{ dishName, liked }> }` (8 items)
- [ ] Call `callGLM4(TASTE_DNA_PROMPT)`:
  ```
  A user swiped on 8 food items. Their likes: [...]. Dislikes: [...].
  Generate a JSON object: { "vector": [spicy,savory,sweet,healthy,adventurous] (0-1 each), "summary": "1-sentence taste summary" }
  Return ONLY the JSON object.
  ```
- [ ] Parse with `parseAIJson()`, return `{ vector, summary }`

#### B2. Real Personalized Recs — `POST /api/personalized-recs` (15 min)
- [ ] Replace stub with real GLM-4 call
- [ ] Accept `{ tasteDna, tasteSummary, dishes }`
- [ ] Call `callGLM4(RECS_PROMPT)`:
  ```
  Given this taste profile [vector + summary] and these dishes [list],
  rank top 3 matches. Return JSON array of dish IDs only.
  ```
- [ ] Parse, return `{ recommendations: string[] }`

---

### Track C: Game Pipeline 🔴 THE DEMO PAYOFF

> State machine + Chef Marco hints + scoring + reveal logic.

#### C1. Game State Machine (20 min)
- [ ] Create `src/lib/game-engine.ts`:
  ```
  VALID TRANSITIONS:
  waiting → menu_loaded     (host uploaded menu + images ready)
  menu_loaded → ordering    (frontend ready for picks)
  ordering → ordered        (all players submitted orders)
  ordered → game_hints      (host confirmed order placed)
  game_hints → game_guess   (manual advance or timer)
  game_guess → game_reveal  (all guesses submitted)
  game_reveal → game_hints  (next round) OR → settled (all rounds done)
  ```
- [ ] `canTransition(currentStatus, action)` → boolean
- [ ] `applyTransition(state, action)` → new GameState
- [ ] Scoring: correct = 3pts, wrong = 0pts (skip "close guess" for simplicity — P2)

#### C2. Real Advance Game — `POST /api/rooms/[roomId]/advance` (10 min)
- [ ] Replace stub with real state machine logic
- [ ] Accept `{ action: "next_hint" | "start_guessing" | "reveal" | "next_round" }`
- [ ] Validate via `canTransition()`, apply via `applyTransition()`
- [ ] If `next_round` → pick next target player, reset currentRound
- [ ] If no more rounds → set status to `settled`
- [ ] Write new state + status to Supabase → real-time broadcasts to all players

#### C3. Real Generate Hint — `POST /api/generate-hint` (15 min)
- [ ] Replace stub with real GLM-4 + Chef Marco persona call
- [ ] Accept `{ targetPlayer, orderedDish, guesserTasteDna, hintLevel, previousHints }`
- [ ] Call `callGLM4(hintPrompt, CHEF_MARCO_SYSTEM_PROMPT)`:
  ```
  You're giving hint level [1/2/3] about a friend's order.
  Level 1: Very vague. Level 2: More specific. Level 3: Almost gives it away.
  Be warm, encouraging. Never reveal the dish name. 1-2 sentences.
  ```
- [ ] Return `{ hint: string }`
- [ ] Store hint in `state.currentRound.hints` on Supabase

#### C4. Reveal Narration (5 min)
- [ ] Generate Chef Marco reaction for each reveal:
  `callGLM4("Given [guesser] guessed [X] but [target] ordered [Y], react as Chef Marco in 1 sentence. Warm, fun, never mean.", CHEF_MARCO_SYSTEM_PROMPT)`
- [ ] Return alongside reveal images

---

## Phase 3: Integration + Deploy (30 min)

### 3.1 Wire Everything Together (10 min)
- [ ] Verify all stubs have been replaced with real implementations
- [ ] Test full flow: create room → join → upload menu → order → game → reveal → settle
- [ ] Fix any integration issues (state shape mismatches, missing fields)

### 3.2 Vercel Deploy (10 min)
- [ ] `npx vercel` — deploy
- [ ] Set all env vars in Vercel dashboard
- [ ] Verify deployed URL works
- [ ] Test QR code → phone opens app → joins room

### 3.3 Practice Demo (10 min)
- [ ] Run through the 3-minute demo script once
- [ ] Identify any timing issues or UI gaps
- [ ] Prepare screen-recorded backup

---

## Phase 4: Z.ai Award Evidence (15 min)

### 4.1 Use GLM-4 for a Dev Task (10 min)
- [ ] Pick ONE: use GLM-4 to generate sample menu data / write Chef Marco prompt / review code
- [ ] Document the tool-switch: what Claude did vs what GLM-4 did
- [ ] Save evidence to `/evidence/` (screenshots, prompts, output comparisons)

### 4.2 Ortie Capture (5 min)
- [ ] Trigger `"Ortie, capture my persona"`
- [ ] Answer Ortie's clarification questions
- [ ] Save SKILL.md + Z.ai evidence files

---

## Time Comparison

| | Sequential (v1) | Parallelized (v2) |
|---|---|---|
| Phase 1: Foundation + Stubs | 30 min | 45 min (includes stubs) |
| Phase 2: Menu Pipeline | 75 min | **60 min** (parallel) |
| Phase 2: Personalization Pipeline | 30 min | **30 min** (parallel) |
| Phase 2: Game Pipeline | 60 min | **50 min** (parallel) |
| Phase 2: Chef Marco | 20 min | **0 min** (folded into Track C) |
| Phase 3: Integration + Deploy | 20 min | 30 min |
| Phase 4: Z.ai Evidence | 15 min | 15 min |
| **Total wall-clock (parallel)** | — | **~2.5 hrs** |
| **Total wall-clock (solo)** | **~5.5 hrs** | **~3.5 hrs** (sequential but fewer phases) |

> **Even without subagents**, the optimized version saves ~2 hours by: eliminating Chef Marco as a separate phase (folded into game pipeline), building AI utilities once (not per-route), and shipping stubs first (unblocks Nicole immediately).

---

## Build Order Diagram

```
PHASE 1: Foundation + Stubs (45 min) — Nicole unblocked after this
│
├── 1.1 Scaffold
├── 1.2 Supabase
├── 1.3 Types + AI Utilities + Room Code + Chef Marco prompt
├── 1.4 Room Management APIs (REAL — no AI needed)
├── 1.5 API Stubs (all other routes return mock data)
└── 1.6 Share credentials + push to GitHub
         │
         ▼
PHASE 2: Three Parallel Pipelines
  ┌────────────────────────────────────────────────────┐
  │ TRACK A: Menu Pipeline        TRACK B: Personalize │
  │ A1. Real Parse Menu           B1. Real Taste-DNA   │
  │ A2. Real Image Gen            B2. Real Recs        │
  │ A3. Sample Menu Data                               │
  │ A4. Demo Seed Room            TRACK C: Game Pipeline│
  │                               C1. State Machine     │
  │                               C2. Real Advance API  │
  │                               C3. Real Hint Gen     │
  │                               C4. Reveal Narration  │
  └────────────────────────────────────────────────────┘
         │
         ▼
PHASE 3: Integration + Deploy (30 min)
├── 3.1 Verify all stubs replaced, test full flow
├── 3.2 Vercel deploy + env vars
└── 3.3 Practice demo
         │
         ▼
PHASE 4: Z.ai Evidence (15 min)
├── 4.1 GLM-4 dev task + documentation
└── 4.2 Ortie capture
```

---

## API Contract Summary

Quick reference for every endpoint — both Aswin and Nicole use this:

| Endpoint | Method | Request | Response | Phase |
|---|---|---|---|---|
| `/api/rooms` | POST | `{ playerName, tasteDna }` | `{ roomId, roomCode, state }` | 1.4 Real |
| `/api/rooms/[roomId]/join` | POST | `{ playerName, tasteDna }` | `GameState` | 1.4 Real |
| `/api/rooms/[roomId]` | GET | — | `{ roomId, roomCode, status, state }` | 1.4 Real |
| `/api/rooms/[roomId]` | PATCH | `{ status?, state? }` | `GameState` | 1.4 Real |
| `/api/rooms/[roomId]/advance` | POST | `{ action }` | `GameState` | 1.5 Stub → C2 Real |
| `/api/rooms/demo-seed` | POST | — | `{ roomId, roomCode }` | A4 Real |
| `/api/parse-menu` | POST | FormData (image) | `{ dishes: Dish[] }` | 1.5 Stub → A1 Real |
| `/api/generate-images` | POST | `{ dishes: Dish[] }` | `{ images: Record<id,url> }` | 1.5 Stub → A2 Real |
| `/api/taste-dna` | POST | `{ swipes: Array<{dishName,liked}> }` | `{ vector, summary }` | 1.5 Stub → B1 Real |
| `/api/personalized-recs` | POST | `{ tasteDna, tasteSummary, dishes }` | `{ recommendations: string[] }` | 1.5 Stub → B2 Real |
| `/api/generate-hint` | POST | `{ targetPlayer, orderedDish, guesserTasteDna, hintLevel, previousHints }` | `{ hint }` | 1.5 Stub → C3 Real |
| `/api/sample-menu` | GET | `?type=thai\|italian\|pub` | `{ dishes: Dish[] }` | A3 Real |

---

*BlindBite Backend Task List — v2 optimized, 2026-06-06. For Aswin.*
