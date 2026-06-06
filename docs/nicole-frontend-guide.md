# BlindBite — Nicole's Frontend Guide

> *Your standalone reference for building the BlindBite frontend. Everything you need — no need to read the backend code.*

---

## Quick Orientation

| What | Value |
|---|---|
| **Product** | BlindBite — AI restaurant companion where friends guess each other's orders |
| **Your role** | Frontend + demo presenter |
| **Stack** | Next.js 15 (App Router) + Tailwind + shadcn/ui |
| **Multi-player** | Supabase real-time (Aswin sets up the backend) |
| **Deadline** | 12:00 Sunday 7 June 2026 |

---

## App Screens (in order)

You need to build **7 screens**. Here they are with what each one shows:

### Screen 1: Onboarding (Taste-DNA)
- **When:** First-time users only
- **What:** 8 food cards the user swipes right (like) or left (dislike)
- **After:** AI builds a "Taste-DNA" vector stored in localStorage
- **Design:** Tinder-style swipe cards, full-bleed food images, big 👋 / ❤️ buttons

### Screen 2: Home / Create or Join Room
- **When:** After onboarding (or if already onboarded)
- **What:**
  - **"Start Session"** button → creates a room, shows room code + QR
  - **"Join Session"** → enter room code or scan QR
- **Design:** Clean landing. Big CTA buttons. Room code is a short 6-char string. QR code generated client-side.

### Screen 3: Waiting Room
- **When:** After creating/joining a room, before menu upload
- **What:**
  - Shows all joined players as avatars/names
  - Host sees "Upload Menu" button
  - Others see "Waiting for host to upload menu..."
  - QR code still visible so others can scan and join late
- **Design:** Player list with join animations. Pulsing "waiting" state.

### Screen 4: Visualised Menu
- **When:** After host uploads menu photo (Aswin's API handles the vision parsing)
- **What:**
  - Grid of dish cards — each with an **AI-generated image** (from GLM-Image), dish name, price
  - Dishes matching the player's Taste-DNA get a **"✨ for you"** badge
  - Chef Marco narration appears as a chat bubble or banner at the top
  - Each player scrolls privately
- **Design:** Pinterest-style card grid. Images are the hero. Price in corner. "✨ for you" is a gold sparkle badge.
- **Images:** Come from Aswin's API (`/api/generate-dish-image`). Show skeleton cards while images load, then reveal progressively.

### Screen 5: Secret Order
- **When:** After visualised menu loads. All players pick simultaneously.
- **What:**
  - Each player taps a dish card to select it
  - Selected card gets a checkmark/highlight
  - "Lock in my order" button → submits to Supabase
  - After locking, player sees a "Shh! Your order is locked in 🤫" screen
  - **You cannot see other players' picks**
- **Design:** Same card grid but now tappable. Subtle selection animation. Lock-in confirmation screen.

### Screen 6: Consolidated Order Card (Host Only)
- **When:** After all players have locked in their orders
- **What:**
  - Host's screen shows ALL orders aggregated:
    ```
    🧾 TABLE ORDER
    2× Pad Thai          £14.00
    1× Green Curry        £8.50
    1× Tom Yum Soup       £6.50
    Total:               £29.00
    ```
  - Big "Show to Waiter" button
  - Non-host players see "Waiting for order to be placed..." with a fun animation
- **Design:** Clean receipt-style layout. Big readable text. One-screen summary.

### Screen 7: Game Phase (Hint + Guess + Reveal)
- **When:** After the order is "placed" (host taps confirm)
- **What — three sub-states:**

  **7a: Hints**
  - Chef Marco (warm, helpful AI persona) appears with a hint about one player's dish
  - Hint is personalized — calibrated to the guesser's Taste-DNA
  - Shows as a chat message or animated bubble from Chef Marco
  - Example: *"Sam loves bold, spicy flavors. Their dish has a rich coconut base..."*

  **7b: Guess**
  - Each player picks from the visualised menu which dish they think the target ordered
  - Submit guess → see others' guesses appear in real-time
  - Wrong guesses get a gentle Chef Marco tease
  - Right guesses get a celebration animation 🎉

  **7c: Reveal**
  - Side-by-side images: "What you guessed" (AI-rendered image of guessed dish) vs "What they actually ordered" (cached image from Act 4)
  - Dramatic reveal animation (flip, swipe, or curtain)
  - Scores update on leaderboard

- **Design:** Chat-style hints at top. Guess cards in the middle. Real-time updates from Supabase. Reveal is the "money shot" — make it dramatic.

### Screen 8: Settle
- **When:** After all reveal rounds
- **What:**
  - Leaderboard with scores
  - Loser's screen shows mocked Zymix wallet → "Pay Up" button → payment animation
  - Winner celebration
  - "Play Again" or "Back to Home"
- **Design:** Leaderboard with ranks. Wallet animation is just UI — no real payment.

---

## Supabase — What You Need to Know

Aswin sets up the Supabase project and table. Here's the shape you'll work with:

### Table: `game_rooms`

| Column | Type | Purpose |
|---|---|---|
| `room_id` | `uuid` | Unique room identifier (auto-generated) |
| `status` | `text` | Current game phase: `waiting` → `menu_loaded` → `ordering` → `ordered` → `game_hints` → `game_guess` → `game_reveal` → `settled` |
| `state` | `jsonb` | Full game state (see below) |

### State JSON Shape

```typescript
interface GameState {
  players: Player[];
  orders: Record<string, string>;      // playerId → dishId
  guesses: Record<string, Record<string, string>>;  // guesserId → targetId → dishId
  menu: MenuData | null;
  currentRound: {
    targetPlayerId: string;            // who we're guessing about
    hintLevel: number;                 // 1, 2, or 3 (progressive)
    hints: string[];                   // generated hints so far
  } | null;
  scores: Record<string, number>;      // playerId → points
  hostId: string;
}

interface Player {
  id: string;
  name: string;
  tasteDna: number[];                  // vector from onboarding
  isHost: boolean;
}

interface MenuData {
  dishes: Dish[];
  rawText: string;                     // full OCR text
}

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;                   // AI-generated image URL
}
```

### Your Supabase Client Code

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Key Operations

```typescript
// 1. Listen for real-time updates (call once when joining a room)
const channel = supabase
  .channel(`room:${roomId}`)
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'game_rooms', filter: `room_id=eq.${roomId}` },
    (payload) => {
      const newState = payload.new.state as GameState;
      const newStatus = payload.new.status as string;
      setGameState(newState);
      setGameStatus(newStatus);
    }
  )
  .subscribe();

// 2. Submit your order
await supabase
  .from('game_rooms')
  .update({ state: { ...currentState, orders: { ...currentState.orders, [myId]: dishId } } })
  .eq('room_id', roomId);

// 3. Submit a guess
await supabase
  .from('game_rooms')
  .update({
    state: {
      ...currentState,
      guesses: {
        ...currentState.guesses,
        [myId]: { ...currentState.guesses[myId], [targetId]: guessedDishId }
      }
    }
  })
  .eq('room_id', roomId);
```

> **Important:** Always read the current state, merge your change, and write back. Supabase real-time will broadcast the update to all other players.

---

## API Routes (Aswin Builds These)

You'll call these from the frontend:

| Route | Method | Purpose | Returns |
|---|---|---|---|
| `POST /api/parse-menu` | POST | Upload menu photo → get parsed dishes | `{ dishes: Dish[] }` |
| `POST /api/generate-images` | POST | Pass dish list → get AI-rendered images | `{ images: Record<dishId, url> }` |
| `POST /api/generate-hint` | POST | Pass target player + guesser + hint level → get Chef Marco hint | `{ hint: string }` |
| `POST /api/taste-dna` | POST | Pass swiped cards → get Taste-DNA vector | `{ vector: number[] }` |
| `POST /api/personalized-recs` | POST | Pass Taste-DNA + dishes → get ranked dishes | `{ recommendations: Dish[] }` |

> **While Aswin builds these,** you can mock them with static JSON files in `public/mock/`. I'll share the exact response shapes once the APIs are ready.

---

## Component Structure

```
src/
├── app/
│   ├── page.tsx                    # Home (create/join room)
│   ├── onboard/
│   │   └── page.tsx                # Taste-DNA swipe cards
│   ├── room/
│   │   └── [roomId]/
│   │       ├── page.tsx            # Waiting room
│   │       ├── menu/
│   │       │   └── page.tsx        # Visualised menu
│   │       ├── order/
│   │       │   └── page.tsx        # Secret order
│   │       ├── order-card/
│   │       │   └── page.tsx        # Consolidated order (host)
│   │       ├── game/
│   │       │   └── page.tsx        # Game phase (hints + guess + reveal)
│   │       └── settle/
│   │           └── page.tsx        # Leaderboard + wallet
│   └── api/                        # Aswin's API routes
├── components/
│   ├── ui/                         # shadcn components
│   ├── DishCard.tsx                # Single dish card (reused in menu + game)
│   ├── ChefMarcoBubble.tsx         # Chef Marco chat bubble
│   ├── PlayerList.tsx              # Player avatars in waiting room
│   ├── OrderCard.tsx               # Consolidated order receipt
│   ├── GuessCard.tsx               # Guess selection card
│   ├── RevealComparison.tsx        # Side-by-side reveal
│   ├── Leaderboard.tsx             # Score rankings
│   ├── WalletPay.tsx               # Mocked Zymix wallet payment
│   └── QRCode.tsx                  # Room QR code
├── lib/
│   ├── supabase.ts                 # Supabase client
│   ├── game-state.ts               # TypeScript types for GameState
│   └── utils.ts                    # Helpers
└── hooks/
    ├── useGameState.ts             # Hook: subscribes to Supabase, returns live state
    ├── usePlayer.ts                # Hook: current player info from localStorage
    └── useRoom.ts                  # Hook: room operations (join, update state)
```

---

## Design Guidelines

### Color Palette
- **Primary:** Warm amber/orange (#F59E0B range) — food, appetite, warmth
- **Accent:** Deep green (#10B981 range) — "for you" badges, correct guesses
- **Background:** Off-white/cream (#FFF7ED) — restaurant ambiance
- **Text:** Dark charcoal (#1C1917) — readable
- **Zymix shell:** Copy the app's nav colors (navy/dark) — pure CSS imitation

### Typography
- **Headings:** Bold, large, rounded — friendly, Gen Z feel
- **Body:** Clean sans-serif (Inter or similar)
- **Chef Marco:** Italic or slightly different font to distinguish AI persona

### Animations (prioritize these)
1. **Dish card reveal** — skeleton → fade in image (most important!)
2. **Guess submission** — card flies to center
3. **Reveal flip** — side-by-side images appear with dramatic animation
4. **Wallet pay** — fun "cha-ching" animation
5. **Player join** — avatar pops in

### Mobile-First
- All screens should look great on a phone (375px width)
- The demo will be on real phones
- Touch targets: minimum 44px
- No hover states as primary interaction

---

## Game Status → Screen Mapping

Use the `status` field from Supabase to drive navigation:

| `status` | Screen to show |
|---|---|
| `waiting` | Waiting Room |
| `menu_loaded` | Visualised Menu |
| `ordering` | Secret Order |
| `ordered` | Consolidated Order Card (host) / "Waiting..." (others) |
| `game_hints` | Game — Hints sub-state |
| `game_guess` | Game — Guess sub-state |
| `game_reveal` | Game — Reveal sub-state |
| `settled` | Settle / Leaderboard |

```typescript
// Simple router based on game status
function getScreen(status: string, isHost: boolean) {
  switch (status) {
    case 'waiting': return <WaitingRoom />;
    case 'menu_loaded': return <VisualisedMenu />;
    case 'ordering': return <SecretOrder />;
    case 'ordered': return isHost ? <ConsolidatedOrderCard /> : <WaitingForOrder />;
    case 'game_hints': return <GameHints />;
    case 'game_guess': return <GameGuess />;
    case 'game_reveal': return <GameReveal />;
    case 'settled': return <Settle />;
  }
}
```

---

## Mock Data (While APIs Are Being Built)

Create `public/mock/` with:

### `menu.json` — A sample parsed menu
```json
{
  "dishes": [
    { "id": "d1", "name": "Pad Thai", "description": "Stir-fried rice noodles with shrimp, peanuts, and lime", "price": 12.00, "imageUrl": "/mock/pad-thai.jpg" },
    { "id": "d2", "name": "Green Curry", "description": "Thai basil coconut curry with chicken and bamboo shoots", "price": 11.50, "imageUrl": "/mock/green-curry.jpg" },
    { "id": "d3", "name": "Tom Yum Soup", "description": "Spicy and sour shrimp soup with lemongrass", "price": 8.50, "imageUrl": "/mock/tom-yum.jpg" },
    { "id": "d4", "name": "Mango Sticky Rice", "description": "Sweet coconut sticky rice with fresh mango", "price": 7.00, "imageUrl": "/mock/mango-sticky-rice.jpg" }
  ]
}
```

### `hints.json` — Sample Chef Marco hints
```json
{
  "level1": "This dish is a beloved Thai classic — warming, aromatic, and full of depth.",
  "level2": "It features a rich coconut milk base with Thai basil and bamboo shoots.",
  "level3": "If you love bold, creamy curries, this one has your name on it — it's the Green Curry! 🌿"
}
```

### Use placeholder food images
- Download 8-12 free food images from Unsplash or Pexels
- Drop them in `public/mock/`

---

## Priority Build Order

If time runs out, screens are prioritized:

| Priority | Screen | Why |
|---|---|---|
| 🔴 P0 | Visualised Menu | The "whoa" moment — must work |
| 🔴 P0 | Secret Order | Core flow — must work |
| 🔴 P0 | Game (Guess + Reveal) | The demo payoff |
| 🟡 P1 | Home (Create/Join Room) | Needed for multi-player demo |
| 🟡 P1 | Consolidated Order Card | Shows coordination value |
| 🟢 P2 | Waiting Room | Nice to have |
| 🟢 P2 | Onboarding | Can skip with pre-seeded Taste-DNA |
| 🟢 P2 | Settle / Wallet | Can be minimal |

---

## Chef Marco — Character Guide

- **Tone:** Warm, encouraging, helpful — like a friendly Italian uncle who loves food
- **Wrong guess:** Gentle tease, never mean. *"Oh, not quite! But I can see why you'd think that — great instinct!"*
- **Right guess:** Celebratory. *"Mamma mia! You read your friend like a menu! 🎉"*
- **Hints:** Progressive — starts vague, gets specific. Always warm.
- **Catchphrase:** TBD (we'll decide during build)

---

## Questions? Ask Aswin

- **Supabase credentials:** Aswin will share `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **API routes:** Aswin builds all `/api/` endpoints. Use mock data until they're ready.
- **Game logic (who guesses who, scoring):** Aswin handles on the backend. You just render what Supabase tells you.
- **QR code library:** Use `qrcode.react` — simple, works in Next.js

---

*BlindBite Frontend Guide — v1, 2026-06-06. For Nicole.*
