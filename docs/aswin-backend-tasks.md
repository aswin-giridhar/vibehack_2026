# BlindBite — Aswin's Backend Task List

> *Everything the backend needs to deliver. Ordered by dependency and demo priority.*

**Team:** Aswin (backend) | Nicole (frontend)
**Deadline:** 12:00 Sunday 7 June 2026
**Stack:** Next.js 15 API Routes + Supabase + GLM-4/Claude + GLM-Image

---

## How to Read This

- 🔴 **P0** = Demo-blocking. Must work.
- 🟡 **P1** = Important for rubric. Should work.
- 🟢 **P2** = Nice-to-have. Ship if time allows.
- `→ depends on` = can't start until the listed task is done
- Each task has a **time estimate** (optimistic, hackathon pace)

---

## Phase 1: Foundation (30 min)

### 1.1 🔴 Scaffold Next.js Project
**Estimate:** 10 min

- [ ] `npx create-next-app@latest blindbite --typescript --tailwind --eslint --app --src-dir`
- [ ] Install dependencies:
  ```bash
  npm install @supabase/supabase-js qrcode.react
  npm install -D @types/node
  ```
- [ ] Create `.env.local` with placeholders:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  GLM_API_KEY=
  CLAUDE_API_KEY=
  ```
- [ ] Create `src/lib/env.ts` for typed env access
- [ ] Push initial scaffold to GitHub

### 1.2 🔴 Supabase Project Setup
**Estimate:** 15 min

- [ ] Create Supabase project at supabase.com (free tier)
- [ ] Create `game_rooms` table:
  ```sql
  CREATE TABLE game_rooms (
    room_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting',
    state JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```
- [ ] Enable Realtime on `game_rooms`:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
  ```
- [ ] Set Row Level Security (allow all for hackathon):
  ```sql
  ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Allow all for hackathon" ON game_rooms
    FOR ALL USING (true) WITH CHECK (true);
  ```
- [ ] Copy Supabase URL + anon key + service role key → `.env.local`
- [ ] Create `src/lib/supabase.ts`:
  ```typescript
  import { createClient } from '@supabase/supabase-js'

  export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  ```

### 1.3 🔴 TypeScript Types
**Estimate:** 5 min

- [ ] Create `src/lib/types.ts` with all shared types:
  ```typescript
  export interface Player {
    id: string;
    name: string;
    tasteDna: number[];
    isHost: boolean;
  }

  export interface Dish {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
  }

  export interface MenuData {
    dishes: Dish[];
    rawText: string;
  }

  export interface GameRound {
    targetPlayerId: string;
    hintLevel: number;
    hints: string[];
  }

  export interface GameState {
    players: Player[];
    orders: Record<string, string>;           // playerId → dishId
    guesses: Record<string, Record<string, string>>;  // guesserId → targetId → dishId
    menu: MenuData | null;
    currentRound: GameRound | null;
    scores: Record<string, number>;           // playerId → points
    hostId: string;
  }

  export type GameStatus =
    | 'waiting'
    | 'menu_loaded'
    | 'ordering'
    | 'ordered'
    | 'game_hints'
    | 'game_guess'
    | 'game_reveal'
    | 'settled';

  export interface GameRoom {
    roomId: string;
    roomCode: string;
    status: GameStatus;
    state: GameState;
    createdAt: string;
  }
  ```

---

## Phase 2: Room Management (45 min)

### 2.1 🔴 API: Create Room — `POST /api/rooms`
**Estimate:** 15 min

- [ ] Generate a unique 6-character room code (alphanumeric, no ambiguous chars like O/0/1/I)
- [ ] Initialize `GameState` with host as first player, empty orders/guesses, null menu
- [ ] Insert into Supabase `game_rooms`
- [ ] Return `{ roomId, roomCode, state }`
- [ ] **Response shape:**
  ```json
  {
    "roomId": "uuid",
    "roomCode": "A3K7X9",
    "state": { "players": [...], "orders": {}, ... }
  }
  ```

### 2.2 🔴 API: Join Room — `POST /api/rooms/[roomId]/join`
**Estimate:** 10 min

- [ ] Accept `{ playerName, tasteDna }` in body
- [ ] Read current state from Supabase
- [ ] Append new player to `state.players`
- [ ] Write updated state back to Supabase
- [ ] Return updated `GameState`
- [ ] **Edge cases:** Room full (max 6 players), room not found, game already started (status ≠ 'waiting')

### 2.3 🔴 API: Update Room State — `PATCH /api/rooms/[roomId]`
**Estimate:** 10 min

- [ ] Generic endpoint to update `status` and/or `state`
- [ ] Accept `{ status?, state? }` in body
- [ ] Merge state updates (shallow merge at top level)
- [ ] Write to Supabase
- [ ] **This is the workhorse** — used for: submitting orders, submitting guesses, advancing game status, updating scores

### 2.4 🟡 API: Get Room State — `GET /api/rooms/[roomId]`
**Estimate:** 5 min

- [ ] Fetch current room from Supabase
- [ ] Return `{ roomId, roomCode, status, state }`
- [ ] For frontend polling fallback (if real-time subscription has issues)

### 2.5 🟡 Room Code Generator Utility
**Estimate:** 5 min

- [ ] Create `src/lib/room-code.ts`
- [ ] Generate 6-char codes from safe alphabet: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
- [ ] Check uniqueness against Supabase before returning

---

## Phase 3: Menu Vision — Parsing a Photo into Dishes (45 min)

### 3.1 🔴 API: Parse Menu — `POST /api/parse-menu`
**Estimate:** 30 min

- [ ] Accept `FormData` with a single image file
- [ ] Call GLM-4 vision (primary) with a carefully crafted prompt:
  ```
  You are a menu parser. Analyze this restaurant menu photo and extract every dish.

  Return a JSON array where each item has:
  - "id": a unique short identifier (e.g., "d1", "d2")
  - "name": the dish name exactly as written
  - "description": the dish description (empty string if none)
  - "price": the price as a number (0 if not found)

  If the menu is unclear or partially visible, extract what you can.
  Return ONLY the JSON array, no other text.
  ```
- [ ] Parse the JSON response, validate structure
- [ ] **If GLM-4 fails** → fall back to Claude Sonnet vision with same prompt
- [ ] **If both fail** → return 500 with error message
- [ ] Return `{ dishes: Dish[] }`

### 3.2 🟡 Fallback: Sample Menu Endpoint — `GET /api/sample-menu`
**Estimate:** 10 min

- [ ] Return a pre-parsed London restaurant menu (hardcoded JSON)
- [ ] Create 2-3 sample menus:
  - Thai restaurant menu (10-12 dishes)
  - Italian restaurant menu (10-12 dishes)
  - British pub menu (8-10 dishes)
- [ ] Accept `?type=thai|italian|pub` query param
- [ ] Store in `src/data/sample-menus.ts`
- [ ] This is the **demo safety net** — if live vision fails, frontend hits this instead

### 3.3 🟢 Menu Vision Robustness
**Estimate:** 5 min

- [ ] Add image preprocessing: resize large images before sending to vision API (reduce latency + cost)
- [ ] Limit file size (max 10MB)
- [ ] Add timeout handling (vision API should respond in < 30s)

---

## Phase 4: Image Generation — AI Dish Renders (30 min)

### 4.1 🔴 API: Generate Dish Images — `POST /api/generate-images`
**Estimate:** 25 min

- [ ] Accept `{ dishes: Dish[] }` in body
- [ ] For each dish, call **GLM-Image** with a prompt:
  ```
  A professional food photography shot of [dish name], [dish description].
  Styled on a white ceramic plate, warm restaurant lighting, shallow depth of field,
  vibrant colors, appetizing presentation. No text, no labels, no watermarks.
  ```
- [ ] **Generate in parallel** (Promise.all) — not sequentially
- [ ] Return image URLs in a map: `{ images: { "d1": "url1", "d2": "url2", ... } }`
- [ ] Store image URLs in Supabase state (`menu.dishes[i].imageUrl`)
- [ ] **If GLM-Image fails** → fall back to placeholder images from `/mock/`
- [ ] **Cost control:** ~$0.015/image × 12 dishes = $0.18/session

### 4.2 🟡 Image Caching Strategy
**Estimate:** 5 min

- [ ] When the game reaches "reveal" phase, check if guess matches an already-rendered dish
- [ ] If yes → reuse cached imageUrl from menu phase (no duplicate generation)
- [ ] If no → generate new image for the guessed dish
- [ ] This is already implicit in the architecture, but add a comment/utility function for clarity

---

## Phase 5: Taste-DNA & Personalization (30 min)

### 5.1 🔴 API: Generate Taste-DNA — `POST /api/taste-dna`
**Estimate:** 15 min

- [ ] Accept `{ swipes: Array<{ dishName: string, liked: boolean }> }` (8 items)
- [ ] Call GLM-4 to generate a taste profile vector:
  ```
  A user has swiped on 8 food items. Here are their likes and dislikes:
  [list]

  Generate a taste profile as a JSON object with these fields:
  - "vector": an array of 5 numbers (0-1) representing: [spicy, savory, sweet, healthy, adventurous]
  - "summary": a 1-sentence taste summary (e.g., "Loves bold, spicy flavors with a sweet tooth")

  Return ONLY the JSON object.
  ```
- [ ] Return `{ vector: number[], summary: string }`
- [ ] Store `vector` in player's `tasteDna` field on Supabase

### 5.2 🟡 API: Personalized Recommendations — `POST /api/personalized-recs`
**Estimate:** 15 min

- [ ] Accept `{ tasteDna: number[], dishes: Dish[] }` in body
- [ ] Call GLM-4:
  ```
  Given this user's taste profile [vector + summary] and these menu dishes [list],
  rank the top 3 dishes that best match their preferences.

  Return a JSON array of dish IDs in ranked order.
  Return ONLY the JSON array.
  ```
- [ ] Return `{ recommendations: string[] }` (array of dishIds)
- [ ] Frontend uses this to show "✨ for you" badges

---

## Phase 6: Game Logic — Hints, Guesses, Reveal (60 min)

### 6.1 🔴 API: Generate Hint — `POST /api/generate-hint`
**Estimate:** 20 min

- [ ] Accept:
  ```json
  {
    "targetPlayer": { "name": "Sam", "tasteDna": [0.8, 0.6, ...], "tasteSummary": "..." },
    "orderedDish": { "name": "Green Curry", "description": "..." },
    "guesserTasteDna": [0.3, 0.7, ...],
    "hintLevel": 1,
    "previousHints": []
  }
  ```
- [ ] Call GLM-4 with Chef Marco persona:
  ```
  You are Chef Marco, a warm and helpful Italian chef. You're giving hint level [1/2/3]
  about what a friend ordered at a restaurant.

  The friend: [targetPlayer name and taste summary]
  Their dish: [dish name and description]
  The guesser's taste profile: [guesser taste DNA]

  Rules:
  - Level 1: Very vague ("This dish has roots in Southeast Asian cuisine...")
  - Level 2: More specific but still guessable ("It features a rich coconut base...")
  - Level 3: Almost giving it away ("If you love creamy curries, this one's for you...")

  Be warm, encouraging, and fun. Never reveal the dish name directly.
  Keep hints to 1-2 sentences.
  ```
- [ ] Return `{ hint: string }`
- [ ] Store hint in `state.currentRound.hints` on Supabase

### 6.2 🔴 Game State Machine — Status Transitions
**Estimate:** 20 min

- [ ] Create `src/lib/game-engine.ts` with the state machine:

  ```
  waiting → menu_loaded     (when menu is parsed + images generated)
  menu_loaded → ordering    (when all images are ready)
  ordering → ordered        (when all players have submitted orders)
  ordered → game_hints      (host confirms order placed)
  game_hints → game_guess   (after hint is shown, 10s timer or manual advance)
  game_guess → game_reveal  (when all players have submitted guesses)
  game_reveal → game_hints  (next round, or → settled if all rounds done)
  settled                    (terminal state)
  ```

- [ ] Each transition should:
  1. Validate the transition is allowed
  2. Update `state` as needed (e.g., set `currentRound` for new hint round)
  3. Update `status` in Supabase
  4. Real-time broadcast handles the rest (frontend auto-navigates)

### 6.3 🔴 Scoring Logic
**Estimate:** 10 min

- [ ] After each reveal round:
  - Correct guess = **3 points**
  - Close guess (same cuisine/category) = **1 point**
  - Wrong guess = **0 points**
- [ ] "Close guess" determination: ask GLM-4 to classify (or just use dish categories)
- [ ] Update `state.scores` in Supabase after each round
- [ ] After all rounds → sort scores → determine winner/loser

### 6.4 🔴 API: Advance Game Round — `POST /api/rooms/[roomId]/advance`
**Estimate:** 10 min

- [ ] Accept `{ action: "next_hint" | "start_guessing" | "reveal" | "next_round" }`
- [ ] Validate action is allowed at current status
- [ ] Transition status per state machine
- [ ] If `next_round` and rounds remain → pick next target player, reset `currentRound`
- [ ] If `next_round` and no rounds remain → set status to `settled`
- [ ] Return updated `GameState`

---

## Phase 7: Chef Marco Persona Layer (20 min)

### 7.1 🟡 Chef Marco System Prompt
**Estimate:** 10 min

- [ ] Create `src/lib/prompts/chef-marco.ts` with the full persona system prompt:
  ```
  You are Chef Marco, a warm, encouraging, and helpful Italian chef who loves food
  and loves helping friends discover amazing dishes.

  Your personality:
  - Warm and nurturing — like a favorite uncle who happens to be a Michelin-star chef
  - Genuinely excited about food — you light up when describing flavors
  - Encouraging — even wrong guesses get a kind word
  - Never mean, never sarcastic, never condescending
  - Occasionally use Italian expressions naturally (mamma mia, bellissimo, etc.)

  When someone guesses wrong:
  - "Oh, not quite! But I love your thinking — that's a great dish too!"
  - "Close! You're in the right neighborhood. Let me give you another hint..."

  When someone guesses right:
  - "Mamma mia! You know your friend well! That's exactly right! 🎉"
  - "Bellissimo! You read them like a recipe! 🌟"

  Keep all responses to 1-3 sentences maximum.
  ```

### 7.2 🟡 Reveal Narration
**Estimate:** 10 min

- [ ] When reveal happens, generate a Chef Marco reaction:
  ```
  Given that [guesser] guessed [guessedDish] but [target] actually ordered [actualDish],
  write a 1-sentence Chef Marco reaction. Be warm, fun, and never mean.
  ```
- [ ] Return alongside the reveal images

---

## Phase 8: Demo Safety & Fallbacks (20 min)

### 8.1 🔴 Pre-seeded Demo Data
**Estimate:** 10 min

- [ ] Create `src/data/demo-seed.ts` with:
  - 3 fake players with rich Taste-DNA profiles
  - A pre-parsed menu with cached image URLs
  - Pre-generated hints for the demo menu
- [ ] API endpoint: `POST /api/rooms/demo-seed` → creates a room pre-loaded with demo data
- [ ] This is the **nuclear fallback** — if everything fails, we load this room and demo from it

### 8.2 🟡 "Use Sample Menu" Flow
**Estimate:** 5 min

- [ ] If vision parsing fails, frontend can hit `GET /api/sample-menu?type=thai`
- [ ] The response shape matches exactly what `/api/parse-menu` returns
- [ ] Seamless fallback — Nicole doesn't need to change any frontend code

### 8.3 🟢 Pre-cache Reveal Images
**Estimate:** 5 min

- [ ] For the demo menu, pre-generate and cache all dish images before the hackathon
- [ ] Store URLs in `src/data/demo-seed.ts`
- [ ] If GLM-Image is down during demo, we use pre-cached URLs

---

## Phase 9: Deployment (15 min)

### 9.1 🔴 Vercel Deploy
**Estimate:** 10 min

- [ ] `npx vercel` — deploy to Vercel
- [ ] Set all env vars in Vercel dashboard (Supabase keys, API keys)
- [ ] Verify the deployed URL works
- [ ] Test QR code generation with the deployed URL

### 9.2 🟡 QR Code for Demo
**Estimate:** 5 min

- [ ] The QR code should point to: `https://[vercel-app].vercel.app/room/[roomId]`
- [ ] Generate QR client-side (Nicole handles this) using `qrcode.react`
- [ ] Test that scanning QR on a phone opens the app and joins the room

---

## Phase 10: Z.ai Award Evidence (15 min)

### 10.1 🟡 Ortie Capture
**Estimate:** 5 min

- [ ] At the end of the build, trigger `"Ortie, capture my persona"`
- [ ] Answer Ortie's questions about engineering style
- [ ] Save the generated SKILL.md

### 10.2 🟡 Z.ai Workflow Evidence
**Estimate:** 10 min

- [ ] Use GLM-4 for at least **one development task** (not just in the product):
  - Option A: Use GLM-4 to write the Chef Marco prompt
  - Option B: Use GLM-4 to generate sample menu data
  - Option C: Use GLM-4 to review/refactor a backend function
- [ ] Document the tool-switching moment (Claude ↔ GLM) — note what each was used for
- [ ] Save evidence to `/evidence/` folder:
  - Screenshots of GLM-4 usage in workflow
  - Prompt snippets
  - Comparison of outputs (Claude vs GLM for same task)

---

## Summary: Time Budget

| Phase | Task | Priority | Estimate |
|---|---|---|---|
| 1 | Foundation (scaffold + Supabase + types) | 🔴 | 30 min |
| 2 | Room management APIs | 🔴 | 45 min |
| 3 | Menu vision parsing | 🔴 | 45 min |
| 4 | Image generation | 🔴 | 30 min |
| 5 | Taste-DNA + personalization | 🔴 | 30 min |
| 6 | Game logic (hints, state machine, scoring) | 🔴 | 60 min |
| 7 | Chef Marco persona | 🟡 | 20 min |
| 8 | Demo safety + fallbacks | 🔴 | 20 min |
| 9 | Deployment | 🔴 | 15 min |
| 10 | Z.ai award evidence | 🟡 | 15 min |
| | **Total P0** | | **~275 min (~4.5 hrs)** |
| | **Total P0 + P1** | | **~310 min (~5.2 hrs)** |
| | **Total everything** | | **~325 min (~5.5 hrs)** |

---

## Recommended Build Order

```
1.1 Scaffold ──→ 1.2 Supabase ──→ 1.3 Types
                                        │
                    ┌───────────────────┘
                    ▼
              2.1-2.5 Room Management APIs
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
    3.1 Parse   4.1 Image   5.1 Taste-DNA
    Menu        Gen         & 5.2 Recs
          │         │         │
          └─────────┼─────────┘
                    ▼
          6.1-6.4 Game Logic (hints, state machine, scoring)
                    │
                    ▼
          7.1-7.2 Chef Marco Persona
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
    8.1 Demo    8.2 Fallback  9.1 Vercel
    Seed        Menus         Deploy
                    │
                    ▼
          10.1-10.2 Z.ai Evidence + Ortie Capture
```

---

*BlindBite Backend Task List — v1, 2026-06-06. For Aswin.*
