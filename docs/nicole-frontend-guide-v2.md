# BlindBite v2 — Nicole's Frontend Guide

> *Your standalone reference for building the BlindBite v2 frontend. Everything you need — no need to read the backend code.*

---

## Quick Orientation

| What | Value |
|---|---|
| **Product** | BlindBite — Post a craving, get AI-enriched recommendations on a map, make friends over food |
| **Your role** | Frontend + demo presenter |
| **Stack** | Next.js 15 (App Router) + Tailwind + shadcn/ui + Mapbox GL JS (or Leaflet) |
| **Real-time** | Supabase real-time subscriptions (Aswin sets up the backend) |
| **Deadline** | 12:00 Sunday 7 June 2026 |
| **Inspiration app** | Corner (App Store ID 1668282277) — map-first, pin-based, Gen Z aesthetic |

---

## The Core Flow (what the user experiences)

```
Post craving → Map with pins → Tap pin → Enriched card → "I'm going here!" → Vibe check → Chat unlock → Chat
```

1. User posts what they want ("best grilled octopus nearby")
2. Map appears centered on them with their craving pin
3. Recommendations appear as pins (from other users + AI fallback)
4. Each pin is an AI-enriched card with dish image, vibe, tags
5. User picks one → "I'm going here!"
6. Later: vibe check → "Loved it" sends chat request
7. Recommender confirms → chat opens with AI icebreaker

---

## App Screens (in order)

You need to build **7 screens**:

### Screen 1: Home / Post a Craving

- **When:** App opens
- **What:**
  - Big text input: "What are you craving?"
  - Placeholder examples: "best grilled octopus nearby", "authentic Japanese matcha", "cozy wine bar for date night"
  - Location is auto-detected (or can be set manually)
  - "Post craving" button → sends to map
- **Design:** Minimal, warm. Big centered input. Food/drink emoji accents. Think Corner's clean onboarding energy.
- **Also shows:** If the user has active cravings or pending chat requests, show them as small cards below the input.

### Screen 2: Map View (THE MAIN SCREEN)

- **When:** After posting a craving (or browsing nearby cravings)
- **What:**
  - **Map fills the screen** (Corner-style — this IS the app, not a secondary view)
  - User's craving pin is centered (distinct color/icon — e.g., pulsing dot with 🔥)
  - Recommendation pins appear around it:
    - **Human pins:** Show recommender's avatar mini + restaurant icon. Tappable.
    - **AI pins:** 🤖 badge. Same card format when tapped. Tappable.
  - Bottom sheet / card carousel showing pinned recommendations in list form (swipeable)
  - "✨ Best match" badge on top-ranked pin (from Smart Match AI)
- **Design:** Map is full-screen. Pins are colorful, not generic Google Maps markers. Bottom sheet slides up when you tap a pin. Think Corner's map — aesthetic, personal, warm.

**Map Pin States:**
```
🔥  = Your craving (pulsing animation)
🍕 = Human recommendation (shows small avatar)
🤖 = AI recommendation (robot badge)
✨ = Best match (golden glow around pin)
```

### Screen 3: Enriched Pin Card (bottom sheet / overlay)

- **When:** User taps a pin on the map
- **What:**
  - **AI-generated dish/drink image** (hero — big, beautiful)
  - Restaurant name
  - **Vibe summary** (1 line from AI, e.g., "Cozy Portuguese spot, their octopus is legendary")
  - **Tags** (e.g., #cozy #seafood #datenight)
  - Recommender info:
    - Human: avatar + "@nicole 🥨 recommended this"
    - AI: 🤖 "AI suggestion"
  - "✨ Best match for you" badge (if top-ranked)
  - **"I'm going here!"** button (primary CTA)
  - Distance / walking time
- **Design:** Bottom sheet that slides up from the map (doesn't leave the map). Image is the hero. Rounded corners. Warm colors. Corner's card aesthetic.

### Screen 4: Recommender View — Browse Cravings

- **When:** User opens app and wants to help others (or gets notification about nearby craving)
- **What:**
  - Map showing nearby cravings from other users (🔥 pins)
  - Tap a craving → see what they want + their location
  - "Recommend a place" button → search/select restaurant → pin it on their map
  - Search: autocomplete restaurant names (use hardcoded demo data)
- **Design:** Same map. Craving pins are the focus. Search bar at top.

### Screen 5: Vibe Check

- **When:** After user has picked a place and returns to the app (or taps "I'm back" button)
- **What:**
  - Card showing: restaurant name, recommender name, AI image
  - "How was @nicole's recommendation?"
  - [💚 Loved it!] — big, satisfying button
  - [💔 Not for me] — smaller, secondary
  - After "Loved it":
    - "Chat request sent to @nicole ✉️"
    - "Waiting for confirmation..."
- **Design:** Full-screen overlay. Warm, celebratory. Big buttons. No overthinking.

### Screen 6: Chat Request (Recommender's side)

- **When:** Someone loved the recommender's recommendation
- **What:**
  - Notification card: "🐙 @aswin loved your rec for 'Grilled Octopus at O Pescador'!"
  - [👋 Start chatting] — primary
  - [✕ Maybe later] — secondary
- **Design:** Modal notification. Friendly. Low pressure.

### Screen 7: Chat

- **When:** Both parties confirmed chat
- **What:**
  - Standard chat UI
  - **AI icebreaker** appears as the first message (styled differently):
    - "You both love grilled seafood! 🐙" or
    - "Next time, try their pastel de nata — @nicole swears by it! 🍰"
  - Then normal chat between the two users
- **Design:** Simple chat. AI icebreaker in a special styled bubble (gradient or sparkle border). Rest is standard.

---

## Supabase — What You Need to Know

Aswin sets up the Supabase project and tables. Here's the shape you'll work with:

### Table: `cravings`

| Column | Type | Purpose |
|---|---|---|
| `id` | `uuid` | Unique craving ID |
| `user_id` | `uuid` | Who posted it |
| `user_name` | `text` | Display name |
| `text` | `text` | What they want ("best grilled octopus nearby") |
| `latitude` | `float8` | Location lat |
| `longitude` | `float8` | Location lng |
| `status` | `text` | `active` / `fulfilled` / `expired` |
| `created_at` | `timestamptz` | When posted |

### Table: `recommendations`

| Column | Type | Purpose |
|---|---|---|
| `id` | `uuid` | Unique recommendation ID |
| `craving_id` | `uuid` | Which craving this responds to |
| `recommender_id` | `uuid` | Who recommended |
| `recommender_name` | `text` | Display name |
| `restaurant_name` | `text` | Restaurant name |
| `restaurant_address` | `text` | Address |
| `latitude` | `float8` | Pin location lat |
| `longitude` | `float8` | Pin location lng |
| `image_url` | `text` | AI-generated dish/drink image URL |
| `vibe_summary` | `text` | AI-generated vibe line |
| `tags` | `text[]` | AI-generated tags |
| `is_ai_generated` | `boolean` | true = AI co-recommender, false = human |
| `smart_match_score` | `float` | AI ranking score (higher = better match) |
| `is_best_match` | `boolean` | Top-ranked for this craving |
| `created_at` | `timestamptz` | When pinned |

### Table: `vibe_checks`

| Column | Type | Purpose |
|---|---|---|
| `id` | `uuid` | Unique vibe check ID |
| `recommendation_id` | `uuid` | Which recommendation |
| `requester_id` | `uuid` | Who did the vibe check |
| `loved_it` | `boolean` | true = loved it, false = not for me |
| `chat_requested` | `boolean` | Did they request chat? |
| `created_at` | `timestamptz` | When |

### Table: `chat_requests`

| Column | Type | Purpose |
|---|---|---|
| `id` | `uuid` | Unique request ID |
| `recommendation_id` | `uuid` | Which recommendation |
| `requester_id` | `uuid` | Who wants to chat |
| `recommender_id` | `uuid` | Who is being asked |
| `status` | `text` | `pending` / `accepted` / `declined` |
| `icebreaker` | `text` | AI-generated icebreaker message |
| `created_at` | `timestamptz` | When |
| `responded_at` | `timestamptz` | When recommender responded |

### Table: `chats`

| Column | Type | Purpose |
|---|---|---|
| `id` | `uuid` | Unique chat ID |
| `chat_request_id` | `uuid` | Which request opened this chat |
| `created_at` | `timestamptz` | When |

### Table: `chat_messages`

| Column | Type | Purpose |
|---|---|---|
| `id` | `uuid` | Unique message ID |
| `chat_id` | `uuid` | Which chat |
| `sender_id` | `uuid` | Who sent |
| `content` | `text` | Message text |
| `is_icebreaker` | `boolean` | true = AI-generated first message |
| `created_at` | `timestamptz` | When |

---

## Your Supabase Client Code

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

---

## API Routes (Aswin Builds These)

You'll call these from the frontend:

| Route | Method | Purpose | Returns |
|---|---|---|---|
| `POST /api/cravings` | POST | Post a new craving | `{ craving: Craving }` |
| `GET /api/cravings/nearby` | GET | Get nearby active cravings | `{ cravings: Craving[] }` |
| `POST /api/recommendations` | POST | Pin a restaurant recommendation | `{ recommendation: Recommendation }` (AI-enriched) |
| `GET /api/recommendations?cravingId=xxx` | GET | Get all recs for a craving | `{ recommendations: Recommendation[] }` |
| `POST /api/vibe-check` | POST | Submit vibe check (loved it / not for me) | `{ vibeCheck: VibeCheck, chatRequest?: ChatRequest }` |
| `POST /api/chat-request/respond` | POST | Accept or decline chat request | `{ chatRequest: ChatRequest, chat?: Chat }` |
| `GET /api/chat-requests/pending` | GET | Get pending chat requests for current user | `{ requests: ChatRequest[] }` |
| `POST /api/chat/messages` | POST | Send a chat message | `{ message: ChatMessage }` |
| `GET /api/chat/[chatId]/messages` | GET | Get chat messages | `{ messages: ChatMessage[] }` |
| `POST /api/ai/co-recommend` | POST | Get AI co-recommendations for a craving | `{ recommendations: Recommendation[] }` |

> **While Aswin builds these,** you can mock them with static JSON files in `public/mock/`.

---

## Component Structure

```
src/
├── app/
│   ├── page.tsx                    # Home / Post a craving
│   ├── map/
│   │   └── page.tsx                # Map view (main screen)
│   ├── cravings/
│   │   └── page.tsx                # Browse nearby cravings (recommender view)
│   ├── vibe-check/
│   │   └── page.tsx                # Vibe check screen
│   ├── chat/
│   │   ├── requests/
│   │   │   └── page.tsx            # Chat request (recommender)
│   │   └── [chatId]/
│   │       └── page.tsx            # Chat screen
│   └── api/                        # Aswin's API routes
├── components/
│   ├── ui/                         # shadcn components
│   ├── map/
│   │   ├── MapView.tsx             # Main map component
│   │   ├── CravingPin.tsx          # Custom craving marker (pulsing)
│   │   ├── RecommendationPin.tsx   # Custom recommendation marker
│   │   └── PinCard.tsx             # Enriched card bottom sheet
│   ├── craving/
│   │   ├── CravingInput.tsx        # Post craving form
│   │   └── CravingCard.tsx         # Craving summary card
│   ├── recommendation/
│   │   ├── EnrichedCard.tsx        # Full enriched pin card
│   │   ├── RecommendForm.tsx       # Search & pin a restaurant
│   │   └── BestMatchBadge.tsx      # Best match badge
│   ├── chat/
│   │   ├── VibeCheck.tsx           # Loved it / Not for me
│   │   ├── ChatRequestCard.tsx     # Incoming chat request
│   │   ├── ChatView.tsx            # Chat messages
│   │   └── IcebreakerBubble.tsx    # AI icebreaker styled message
│   └── shared/
│       ├── Avatar.tsx              # User avatar
│       └── TagBadge.tsx            # Tag pill (#cozy, #seafood)
├── lib/
│   ├── supabase.ts                 # Supabase client
│   ├── types.ts                    # TypeScript types
│   └── utils.ts                    # Helpers
└── hooks/
    ├── useNearbyCravings.ts        # Hook: subscribe to nearby cravings
    ├── useRecommendations.ts       # Hook: subscribe to recs for a craving
    ├── useChatRequests.ts          # Hook: subscribe to incoming chat requests
    └── useChatMessages.ts          # Hook: subscribe to chat messages
```

---

## Design System

### Color Palette
- **Primary:** Warm coral/orange (#FF6B6B → #F97316 range) — appetite, warmth, craving energy
- **Accent:** Teal/mint (#14B8A6) — "Loved it" button, best match badge
- **Map pins:** Warm amber (#F59E0B) for human recs, cool blue (#60A5FA) for AI recs, coral pulsing for cravings
- **Background:** Off-white/cream (#FFF7ED) — warm, not sterile
- **Text:** Dark charcoal (#1C1917)
- **Chat icebreaker:** Gradient bubble (coral → teal)

### Typography
- **Headings:** Bold, rounded — friendly Gen Z feel (Inter or DM Sans)
- **Body:** Clean sans-serif (Inter)
- **Vibe summaries:** Slightly italic or handwritten feel (to distinguish AI personality)
- **Tags:** Pill-shaped, small, muted

### Map Style
- **Light/warm** style (not dark — Corner uses light, friendly maps)
- **Custom pin markers** — not default teardrops. Colored circles with icons/avatars.
- **Smooth zoom** into user location on load
- **Cluster pins** if many in one area (Mapbox has built-in clustering)

### Animations (prioritize these)
1. **Pin drop** — new recommendation appears with a satisfying drop + bounce
2. **Card slide-up** — bottom sheet smoothly slides when tapping a pin
3. **AI enrichment reveal** — skeleton card → image fades in with vibe text
4. **Vibe check** — Loved it button has a satisfying press + heart burst
5. **Chat unlock** — icebreaker bubble appears with sparkle animation

### Mobile-First
- All screens should look great on a phone (375px width)
- The demo will be on real phones
- Touch targets: minimum 44px
- Map interactions are all touch (pinch zoom, tap pins, swipe cards)
- No hover states as primary interaction

---

## Priority Build Order

If time runs out, screens are prioritized:

| Priority | Screen | Why |
|---|---|---|
| 🔴 P0 | Map View + Pin Cards | THE app. Must work. |
| 🔴 P0 | Post a Craving | Entry point. Must work. |
| 🔴 P0 | Enriched Pin Card | The AI wow moment. Must work. |
| 🟡 P1 | Vibe Check | Core social mechanic. |
| 🟡 P1 | Chat Request + Chat | The "make friends" payoff. |
| 🟢 P2 | Browse Cravings | Nice for recommender flow but can demo with Aswin posting. |
| 🟢 P2 | Home with active cravings | Can skip, go straight to map. |

---

## Mock Data (While APIs Are Being Built)

Create `public/mock/` with:

### `nearby-cravings.json`
```json
{
  "cravings": [
    { "id": "c1", "user_name": "aswin", "text": "best grilled octopus nearby", "latitude": 51.5074, "longitude": -0.1278, "status": "active" },
    { "id": "c2", "user_name": "nicole", "text": "authentic Japanese matcha around Waterloo", "latitude": 51.5033, "longitude": -0.1116, "status": "active" }
  ]
}
```

### `recommendations.json`
```json
{
  "recommendations": [
    { "id": "r1", "craving_id": "c1", "recommender_name": "nicole", "restaurant_name": "O Pescador", "latitude": 51.5080, "longitude": -0.1260, "image_url": "/mock/octopus.jpg", "vibe_summary": "Cozy Portuguese spot, their octopus is legendary", "tags": ["cozy", "seafood", "portuguese"], "is_ai_generated": false, "is_best_match": true },
    { "id": "r2", "craving_id": "c1", "recommender_name": "AI", "restaurant_name": "Casual Seafood Grill", "latitude": 51.5065, "longitude": -0.1290, "image_url": "/mock/grill.jpg", "vibe_summary": "Lively spot known for fresh catches and smoky grills", "tags": ["lively", "grilled", "casual"], "is_ai_generated": true, "is_best_match": false }
  ]
}
```

### Use placeholder food/drink images
- Download 6-8 free images from Unsplash or Pexels (grilled octopus, matcha, wine, etc.)
- Drop them in `public/mock/`

---

## Demo Setup Checklist

Before judges arrive:
- [ ] Two phones (or browser tabs in mobile view) open to the app
- [ ] Phone 1 (Aswin): logged in as "aswin", location set to demo spot
- [ ] Phone 2 (Nicole): logged in as "nicole", same demo location
- [ ] Both connected to same Supabase instance
- [ ] Pre-seeded: 1 active craving from Aswin
- [ ] Pre-seeded: 2 AI recommendations (fallback pins)
- [ ] Practice the full flow at least 3 times

---

## Questions? Ask Aswin

- **Supabase credentials:** Aswin will share `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **API routes:** Aswin builds all `/api/` endpoints. Use mock data until they're ready.
- **AI enrichment:** When someone pins a restaurant, the backend handles GLM-Image + GLM-4. The frontend just receives the enriched recommendation with `image_url`, `vibe_summary`, and `tags` already filled.
- **Map library:** Use Mapbox GL JS if you have an API key, otherwise Leaflet + OpenStreetMap works with zero setup.

---

*BlindBite v2 Frontend Guide — 2026-06-06. For Nicole.*
