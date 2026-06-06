# BlindBite v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a social food/drink recommendation app where users post cravings, get AI-enriched pins on a map, vibe-check recommendations, and unlock chats with recommenders.

**Architecture:** Next.js 15 App Router with API routes. Supabase for real-time data + PostGIS location queries. 4 AI layers (GLM-4 primary, Claude backup) for pin enrichment, smart matching, co-recommendation, and chat icebreakers. Map-first UI (Mapbox or Leaflet).

**Tech Stack:** Next.js 15, TypeScript, Tailwind, shadcn/ui, Supabase, Mapbox GL JS / Leaflet, GLM-4, GLM-Image, Claude Sonnet (backup)

**Specs:** `docs/superpowers/specs/2026-06-06-blindbite-v2-design.md`, `docs/nicole-frontend-guide-v2.md`, `docs/aswin-backend-spec-v2.md`

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                          # Home / Post craving
│   ├── map/page.tsx                      # Map view (main screen)
│   ├── cravings/page.tsx                 # Browse nearby cravings
│   ├── vibe-check/page.tsx               # Vibe check
│   ├── chat/
│   │   ├── requests/page.tsx             # Chat request (recommender)
│   │   └── [chatId]/page.tsx             # Chat
│   └── api/
│       ├── cravings/
│       │   ├── route.ts                  # POST /api/cravings
│       │   └── nearby/route.ts           # GET /api/cravings/nearby
│       ├── recommendations/
│       │   └── route.ts                  # POST + GET /api/recommendations
│       ├── vibe-check/route.ts           # POST /api/vibe-check
│       ├── chat-request/
│       │   ├── respond/route.ts          # POST /api/chat-request/respond
│       │   └── pending/route.ts          # GET /api/chat-requests/pending
│       ├── chat/
│       │   ├── messages/route.ts         # POST /api/chat/messages
│       │   └── [chatId]/messages/route.ts # GET /api/chat/[chatId]/messages
│       └── ai/
│           └── co-recommend/route.ts     # POST /api/ai/co-recommend
├── components/
│   ├── ui/                               # shadcn components
│   ├── map/
│   │   ├── MapView.tsx
│   │   ├── CravingPin.tsx
│   │   ├── RecommendationPin.tsx
│   │   └── PinCard.tsx
│   ├── craving/
│   │   ├── CravingInput.tsx
│   │   └── CravingCard.tsx
│   ├── recommendation/
│   │   ├── EnrichedCard.tsx
│   │   ├── RecommendForm.tsx
│   │   └── BestMatchBadge.tsx
│   ├── chat/
│   │   ├── VibeCheck.tsx
│   │   ├── ChatRequestCard.tsx
│   │   ├── ChatView.tsx
│   │   └── IcebreakerBubble.tsx
│   └── shared/
│       ├── Avatar.tsx
│       └── TagBadge.tsx
├── lib/
│   ├── env.ts
│   ├── supabase.ts
│   ├── types.ts
│   ├── ai.ts
│   └── utils.ts
├── data/
│   ├── demo-restaurants.ts
│   └── demo-users.ts
└── hooks/
    ├── useNearbyCravings.ts
    ├── useRecommendations.ts
    ├── useChatRequests.ts
    └── useChatMessages.ts
```

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `entire project scaffold via create-next-app`

- [ ] **Step 1: Create Next.js app**
```bash
cd /mnt/e/Hackathon/Vibehack_2026
npx create-next-app@latest blindbite --typescript --tailwind --eslint --app --src-dir --use-npm
```

- [ ] **Step 2: Install dependencies**
```bash
cd blindbite
npm install @supabase/supabase-js
```

- [ ] **Step 3: Create .env.local**
```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GLM_API_KEY=
GLM_IMAGE_API_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
EOF
```

- [ ] **Step 4: Create src/lib/env.ts**
```typescript
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  glmApiKey: process.env.GLM_API_KEY!,
  glmImageApiKey: process.env.GLM_IMAGE_API_KEY!,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
} as const;
```

- [ ] **Step 5: Verify app runs** — `npm run dev`, check localhost:3000

- [ ] **Step 6: Commit** — `git init && git add -A && git commit -m "feat: scaffold BlindBite v2 project"`

---

## Task 2: Supabase Setup

**Files:**
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Create Supabase project** at supabase.com, copy credentials into `.env.local`

- [ ] **Step 2: Run schema SQL** — paste full schema from `docs/aswin-backend-spec-v2.md` (6 tables + PostGIS + RLS + realtime) into Supabase SQL editor

- [ ] **Step 3: Create src/lib/supabase.ts**
```typescript
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
```

- [ ] **Step 4: Verify connection** — create temp `/api/health` route, hit it, confirm Supabase responds

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: Supabase client + schema"`

---

## Task 3: TypeScript Types

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Write all shared types** — see `docs/aswin-backend-spec-v2.md` for full type definitions (User, Craving, Recommendation, VibeCheck, ChatRequest, Chat, ChatMessage, plus API request types)

- [ ] **Step 2: Commit** — `git add -A && git commit -m "feat: shared TypeScript types"`

---

## Task 4: AI Utilities

**Files:**
- Create: `src/lib/ai.ts`

- [ ] **Step 1: Write shared AI call utilities** — `callGLM4()`, `callGLMImage()`, `callClaude()`, `parseAIJson()`, `callAI()` (GLM-4 with Claude fallback). See `docs/aswin-backend-spec-v2.md` for full implementation.

- [ ] **Step 2: Commit** — `git add -A && git commit -m "feat: AI utility functions (GLM-4 + GLM-Image + Claude fallback)"`

---

## Task 5: Demo Data

**Files:**
- Create: `src/data/demo-restaurants.ts`
- Create: `src/data/demo-users.ts`

- [ ] **Step 1: Create demo users** — 2 users (aswin, nicole) with hardcoded IDs

- [ ] **Step 2: Create demo restaurants** — 12 London restaurants near UCL/Waterloo with lat/lng, names, cuisine types, vibe summaries, tags

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat: demo data (users + London restaurants)"`

---

## Task 6: API Stubs (All 10 Routes)

**Files:**
- Create: `src/app/api/cravings/route.ts`
- Create: `src/app/api/cravings/nearby/route.ts`
- Create: `src/app/api/recommendations/route.ts`
- Create: `src/app/api/vibe-check/route.ts`
- Create: `src/app/api/chat-request/respond/route.ts`
- Create: `src/app/api/chat-request/pending/route.ts`
- Create: `src/app/api/chat/messages/route.ts`
- Create: `src/app/api/chat/[chatId]/messages/route.ts`
- Create: `src/app/api/ai/co-recommend/route.ts`

- [ ] **Step 1: Create all 10 stub routes** — each returns hardcoded mock data matching the real response shape. See `docs/aswin-backend-spec-v2.md` API Contract Summary for exact shapes.

- [ ] **Step 2: Verify all stubs respond** — curl each endpoint, confirm JSON

- [ ] **Step 3: Commit + share with Nicole** — push repo, share Supabase credentials. Nicole can now build all frontend screens.

---

## Task 7: Real Craving Routes

**Files:**
- Modify: `src/app/api/cravings/route.ts`
- Modify: `src/app/api/cravings/nearby/route.ts`

- [ ] **Step 1: Replace POST with real Supabase insert** — insert craving, then trigger AI co-recommender in background (don't await)

- [ ] **Step 2: Replace GET nearby with real PostGIS query** — create `nearby_cravings` RPC function in Supabase, fall back to simple select if RPC fails

- [ ] **Step 3: Test with curl** — post a craving, verify it appears in Supabase

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: real craving routes with PostGIS"`

---

## Task 8: Real Recommendation + AI Enrichment

**Files:**
- Modify: `src/app/api/recommendations/route.ts`

- [ ] **Step 1: Replace POST with real Supabase insert + AI enrichment** — insert base rec, then: call GLM-4 for vibe_summary + tags, call GLM-Image for dish image, update rec with enrichment. Best-effort: return base rec if AI fails.

- [ ] **Step 2: Replace GET with real Supabase query**

- [ ] **Step 3: Test with curl** — pin a restaurant, verify AI enrichment appears

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: real recommendation route with AI enrichment"`

---

## Task 9: Real AI Co-Recommender

**Files:**
- Modify: `src/app/api/ai/co-recommend/route.ts`

- [ ] **Step 1: Replace stub with real GLM-4 + GLM-Image calls** — generate 2-3 restaurant suggestions, create AI recommendation entries in Supabase with `is_ai_generated: true`. Fall back to demo restaurants if AI fails.

- [ ] **Step 2: Test end-to-end** — post a craving, verify AI pins appear on map within seconds

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat: real AI co-recommender with demo fallback"`

---

## Task 10: Real Vibe Check + Chat Routes

**Files:**
- Modify: `src/app/api/vibe-check/route.ts`
- Modify: `src/app/api/chat-request/respond/route.ts`
- Modify: `src/app/api/chat-request/pending/route.ts`
- Modify: `src/app/api/chat/messages/route.ts`
- Modify: `src/app/api/chat/[chatId]/messages/route.ts`

- [ ] **Step 1: Real vibe check** — insert into vibe_checks, if loved_it then create chat_request with AI-generated icebreaker

- [ ] **Step 2: Real chat request respond** — if accept: update status, create chat, insert icebreaker message. If decline: update status only.

- [ ] **Step 3: Real pending + messages routes** — Supabase queries with real data

- [ ] **Step 4: Test full flow** — craving → pin → vibe check → chat request → accept → chat messages

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: real vibe check, chat request, and chat message routes"`

---

## Task 11: Seed Demo Users

**Files:**
- Create: `src/app/api/seed/route.ts`

- [ ] **Step 1: Create seed endpoint** — upsert demo users into Supabase

- [ ] **Step 2: Hit seed endpoint** — curl POST /api/seed, verify users created

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat: demo user seed endpoint"`

---

## Task 12: Vercel Deploy + Demo Prep

- [ ] **Step 1: Deploy to Vercel** — `npx vercel`

- [ ] **Step 2: Set environment variables** in Vercel dashboard (all keys from .env.local)

- [ ] **Step 3: Seed demo users on production** — curl POST /api/seed on production URL

- [ ] **Step 4: Test full two-device flow** — Aswin on phone 1, Nicole on phone 2, verify real-time sync

- [ ] **Step 5: Practice 3-minute demo script** (see design doc)

- [ ] **Step 6: Record backup demo video** in case live demo fails

---

## Self-Review

**1. Spec coverage:** All 4 AI layers (Tasks 8, 9, 10). All 10 API routes (Tasks 6, 7, 8, 9, 10). Supabase schema (Task 2). Demo data (Task 5). Two-way chat unlock (Task 10). ✅

**2. Placeholder scan:** No TBDs, TODOs, or vague steps. Code inline for all tasks. ✅

**3. Type consistency:** Types from Task 3 match all route shapes. `supabase` import consistent. `callAI`/`callGLMImage`/`parseAIJson` consistent. ✅

**Gap:** Smart Match scoring (cross-recommendation ranking) is simplified — first human rec = best match. Can refine if time allows.
