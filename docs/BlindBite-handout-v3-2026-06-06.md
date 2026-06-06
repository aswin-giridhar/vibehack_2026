# BlindBite — Build Handout

> *Conversation summary as of 2026-06-06 — share with teammates, use as your North Star during build.*

| Event | VibeHack London 2026 |
|---|---|
| Track | **Track 2 — Vibe with Zymix** |
| Product name | **BlindBite** |
| Submission deadline | **12:00, Sunday 7 June 2026** |
| Effective build window | ~18 hours |
| Status | **All decisions locked. Build in progress.** |

---

## TL;DR (one paragraph)

BlindBite is an AI-powered restaurant companion for Gen Z friends dining out together. **One person photographs the paper menu; AI parses it and generates a visualised menu where every dish becomes a beautiful AI-rendered image — so nobody has to read descriptions.** Each person picks privately and **all orders consolidate into one screen the host shows the waiter.** While the food is being prepared, the table plays an AI-hosted game: friends guess what each other ordered, with personalized hints from Chef Marco calibrated to each player's flavor profile, and AI-generated dish images comparing each guess to reality. **Judges can join the game live during the demo.** The loser pays a settlement via a (mocked) Zymix wallet. Built as a live multi-player web app synced via Supabase, deployed on Vercel.

---

## Why this idea wins the rubric

| Rubric criterion | Weight | How BlindBite scores |
|---|---|---|
| Relevance to Zymix users | 25% | Wallet+social is Zymix's exact thesis — we embody it in a moment Gen Z lives daily (restaurant dinner with friends). Judges play as Zymix users during the demo. |
| Originality | 20% | "Visualized menu + consolidated ordering + pre-food anticipation game + AI-generated reveal" — a coherent flow no team will accidentally build. Threads Ch.2 (Entertainment Mini) **and** Ch.3 (Coordination Helper). |
| UX quality | 20% | Single end-to-end journey (menu → order → game → settle). One photograph triggers a full visual menu. One screen shows the waiter the whole table's order. Reading descriptions becomes optional. |
| Effective use of AI | 20% | AI is irreplaceable in 5 distinct layers — *menu cannot be visualised, ordering cannot be personalised, game cannot be played, and reveal cannot happen without AI*. |
| Demo clarity | 15% | Theatrical, judge-playable, live multi-player. The "upload-menu → visualised-menu" reveal is a 10-second wow moment by itself. Judges join as players. |

---

## The Pain Points (the *why*)

- **Menu fatigue.** Reading dish descriptions on a paper menu in dim restaurant lighting is exhausting and unfair to anyone less food-fluent at the table.
- **Decision paralysis.** Too many choices, too little visual information. Everyone defers, the waiter waits.
- **Dead time.** 15–20 minutes between ordering and food arriving — phones come out, conversation flattens.
- **Bill-splitting awkwardness.** Settling up at the end is socially fraught.
- **Ordering chaos.** "What did you order again?" — the waiter has to deal with 4 separate conversations.

BlindBite collapses these into one app: **visualised menu** kills decision fatigue, **consolidated ordering** kills waiter chaos, **the game** kills dead time, **wallet-stakes settlement** kills the awkward bill split.

---

## The Game Loop (full flow)

| # | Act | Time | What happens | Who's "active" |
|---|---|---|---|---|
| **0** | **Onboard** (one-time) | 30s | Each player swipes 8 food cards. AI builds your **Taste-DNA** vector. | New user |
| **1** | **Host creates room** | 10s | Host taps "Start Session" → gets room code + QR code. | Host |
| **2** | **Others join** | 20s | Others scan QR or enter room code. Everyone lands in the same session. | Everyone |
| **3** | **Upload menu** | 30s | Host photographs the paper menu. Vision + LLM extract dishes, prices, descriptions into structured data. | Host |
| **4** | **Visualised menu** | 60s passive | GLM-Image generates a beautiful card for every dish. Chef Marco narrates highlights. Each player sees their menu with Taste-DNA-matched dishes flagged ("✨ for you"). | Everyone scrolls |
| **5** | **Secret order** | 60s | Each player privately taps their dish. Picks are hidden from others until reveal. | Everyone |
| **6** | **Consolidated order card** | 20s | All orders aggregate onto the host's screen as one clean card. Host shows phone to waiter — one screen, full table order. Narrated in demo. | Host shows screen |
| **7** | **Game opens** | — | The moment the waiter walks away, the app prompts: *"Food's coming. Play while you wait?"* All in. | Everyone |
| **8** | **Hint + Guess rounds** | 5 min | Round-by-round, Chef Marco generates progressively-revealing hints per dish — warm, helpful, calibrated to that player's Taste-DNA *and* the guessers'. Friends guess. Wrong guesses get gently teased. | Everyone competes |
| **9** | **The Reveal** | 60s | Side-by-side AI-rendered images: "what YOU guessed Sam ordered" vs "what Sam actually picked." Real food arriving = IRL reveal on top. | Everyone watches |
| **10** | **Settle** | 30s | Leaderboard. Loser's screen flips to mocked Zymix wallet pay-up. One-tap "payment sent." Persistent ranking carries to next dinner. | Loser pays |

---

## AI Architecture (5 layers)

```
                    ┌──────────────────┐
   Menu photo ─────►│ Menu Vision      │ (GLM-4 vision PRIMARY)
                    │ → dish list,     │ (Claude Sonnet BACKUP)
                    │   descriptions,  │
                    │   prices         │
                    └────────┬─────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
        ┌──────────────┐  ┌───────┐  ┌──────────────┐
        │ GLM-Image    │  │Personal│ │ Chef Marco   │
        │ render each  │  │ised    │ │ narrates     │
        │ menu dish    │  │recs    │ │ (GLM-4       │
        └──────┬───────┘  │(GLM-4) │  PRIMARY)     │
               │          └───┬────┘ └──────┬───────┘
               ▼              ▼             ▼
        ┌──────────────────────────────────────┐
        │      VISUALISED MENU (Act 4)         │
        └──────────────┬───────────────────────┘
                       │
                       ▼
              Each player's secret pick
              (synced via Supabase real-time)
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │   GAME PHASE (Acts 8-9)              │
        │                                      │
        │   Hint Engine ──► Persona ──► Hint   │
        │   (GLM-4 PRIMARY) (GLM-4)            │
        │   (Claude BACKUP)                    │
        │                                      │
        │   Each guess ──► GLM-Image           │
        │   ┌─► (cached from Act 4 if match)   │
        │                                      │
        │   Reveal: side-by-side images        │
        └──────────────────────────────────────┘
```

**Model split:** GLM-4 is PRIMARY for all text AI (vision, recs, persona, hints). Claude Sonnet is BACKUP if GLM-4 is unavailable. This maximises Z.ai award eligibility.

**Onboarding feeds it all:** Taste-DNA vectors flow into personalized recs (Act 4) and personalized hints (Act 8).

**Cost discipline:** dish images are generated ONCE during Act 4 (visualised menu) and reused at Act 9 (reveal) wherever the guess matches an already-rendered dish. ~12–20 dish images per session ≈ $0.30. Demo cost is trivial.

**Skeleton-first build:** each layer can be turned off and the app still functions. Drop personalized hints → generic hints still work. Drop persona → plain hints. Image gen is the only non-droppable layer — it carries Z.ai integration.

---

## Multi-Player Sync — Supabase (Real)

All players connect to the same Supabase room. State syncs in real-time via Supabase subscriptions.

```
┌─────────────────────────────────────────┐
│           Supabase (Free Tier)           │
│                                          │
│  Table: game_rooms                       │
│  ┌─────────┬──────────┬───────────────┐ │
│  │ room_id │  status  │    state      │ │
│  │ (uuid)  │ (text)   │   (jsonb)     │ │
│  ├─────────┼──────────┼───────────────┤ │
│  │ abc123  │ ordering │ {players:[],  │ │
│  │         │          │  orders:{},   │ │
│  │         │          │  guesses:{},  │ │
│  │         │          │  menu:{...}}  │ │
│  └─────────┴──────────┴───────────────┘ │
│                                          │
│  Real-time subscriptions broadcast       │
│  every change to all connected clients    │
└──────────┬──────────┬──────────┬────────┘
           │          │          │
     ┌─────┴──┐  ┌────┴───┐  ┌──┴──────┐
     │ Player │  │ Player │  │ Player  │
     │ 1      │  │ 2      │  │ 3 (judge)│
     │ (host) │  │(Nicole)│  │         │
     └────────┘  └────────┘  └─────────┘
```

**One table. One row per game. JSON column holds everything. Real-time subscriptions push updates instantly.**

---

## Build vs. Mock (the discipline)

| Build for real | Mock / fake aggressively |
|---|---|
| Next.js + Tailwind web app | The **Zymix shell** (top nav, wallet UI, chat bubble) — pure CSS imitation |
| Menu photo upload + vision parsing (real) | **2–3 pre-parsed London restaurant menus** as fallback if vision fails live |
| Onboarding swipe → Taste-DNA | Wallet "payment" — UI animation only, no real money |
| GLM-Image dish rendering | Real waiter — narrate the consolidated order card verbally |
| Hint generation (GLM-4 primary, Claude backup) | Group chat trigger from Zymix — we open the app directly |
| Persona wrapper (GLM-4) | Real Zymix integration (no SDK exists) |
| **Supabase real-time multi-player sync** | — |
| Vercel deploy + QR code | — |
| Room creation + join via QR/code | — |

**Principle:** every line of code serves the 3-minute demo. Everything else is mocked.

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + Tailwind + shadcn/ui
- **Menu Vision:** GLM-4 vision (primary), Claude Sonnet vision (backup)
- **Text AI:** GLM-4 (primary — hint logic, dish recs, Chef Marco persona), Claude Sonnet (backup)
- **Image AI:** **Z.ai GLM-Image** ($0.015/image — ~$0.30 per full session, ~$3 across demos)
- **Multi-player sync:** **Supabase** (free tier — real-time subscriptions, one table)
- **State:** React state + Supabase real-time (no separate DB needed)
- **Hosting:** Vercel preview URL — judges scan QR and play live during the 3-min demo

---

## Demo Script (3 minutes)

| Time | Beat |
|---|---|
| 0:00–0:20 | "Imagine four friends at a restaurant. Paper menu, no photos, decision paralysis, then 20 minutes of dead time. We turn the whole dinner into a game — and you're playing." |
| 0:20–0:50 | **Menu upload moment.** Someone snaps the paper menu (we have one printed on the table). Watch the visualised menu appear — every dish rendered live. Chef Marco narrates. *This alone is a "whoa" moment.* |
| 0:50–1:10 | Each player picks a dish privately on their own device (judge is Player 3). "All orders consolidate — one screen for the waiter. No more chaos." |
| 1:10–2:00 | "Food's being made. Now we play." Live round: Chef Marco gives a warm, personalized hint. Judge guesses. Wrong guess gets a gentle tease. Right guess = celebration. |
| 2:00–2:30 | **The reveal — the money shot.** Side-by-side AI-generated images: each friend's GUESS vs the ACTUAL pick. Wildly different visual interpretations. |
| 2:30–3:00 | Leaderboard. Loser → mocked Zymix wallet pay-up. "Persistent ranking. That's why they come back next Friday." Close. |

---

## Award Stacking Strategy

| Award | Why we qualify | Effort delta |
|---|---|---|
| **Track 2 — Vibe with Zymix (1st = £1,000)** | Core build | — |
| **Z.ai x Orbit: Best Product Integration (£300)** | GLM-Image is the substrate for BOTH the menu and the reveal; GLM-4 is primary text AI — not decorative, load-bearing | Use Ortie to capture |
| **Z.ai x Orbit: Best Workflow Use (£300)** | GLM-4 used for dev tasks alongside Claude during development | Document via Ortie |
| **Z.ai x Orbit: Best Real-World Potential (£300)** | Genuine restaurant pain + consolidated ordering + replayability + clear monetization | Document via Ortie |
| **Z.ai x Orbit: Best Build-in-Public (£300)** | Capture build process, failures, decisions in this repo | Ortie + post |
| **Manus Real-World Use Case** | Use Manus for research/planning during build | Log Manus session, share link |
| **Fotor Vibe Marketing** | Generate "Chef Marco" character art + promo visuals | Create Fotor post, link in Devpost |

**Realistic ceiling:** £1,000 + up to £1,200 in Z.ai stack + Manus credits + Fotor credits.

---

## Decisions Locked In

- Track 2 (Vibe with Zymix), challenge bridges Ch.2 + Ch.3
- **Product name: BlindBite**
- **Team: Pair** — Aswin (backend) + Nicole (frontend + demo presenter)
- **GLM-4 is PRIMARY** for all text AI (vision, recs, persona, hints). Claude Sonnet is BACKUP.
- **Supabase** for real-time multi-player sync (free tier, one table, real-time subscriptions)
- **Live multi-player demo** — judges can join as players via QR code
- **Consolidated order card** — all orders aggregate on one screen for the waiter (narrated in demo)
- **Game played BEFORE food arrives** (anticipation theater)
- **Menu visualization is the opener** — one photo → AI-rendered menu cards
- **Chef Marco tone: warm & helpful** — not sarcastic; gentle teases on wrong guesses, celebratory on correct ones
- **Zymix app downloaded** by team ✅
- 5 AI layers stacked: Menu Vision → Personalized Recs → Persona → Hints → Image Gen
- Standalone web app (no Zymix SDK)
- Z.ai GLM-Image as load-bearing image generation (used twice: menu + reveal)
- Vercel deploy + QR for judge participation

## Decisions Remaining

1. **2–3 fallback restaurant menus** — which real London menus to pre-parse for demo safety? (Pick after vision parser is built)
2. **Chef Marco catchphrase** — signature line for the persona (decide during persona implementation)

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Menu OCR/vision fails on weird menu layouts during live demo | Pre-parse 2 fallback menus + offer "Use sample menu" button always visible |
| Image gen latency kills the menu reveal moment | Generate images in parallel and progressively reveal; show skeleton cards first |
| Personalized hints feel generic | Pre-build 3 rich fake personas with histories for the demo |
| Time runs out before persona layer | Skeleton works without persona; drop and ship plain hints |
| Judges miss the AI being essential | Demo script explicitly narrates each AI moment |
| Multi-player sync fails during demo | Practice 5+ times; have screen-recorded backup ready |
| GLM-Image API issues at wire | Have Claude/OpenAI image fallback ready, or pre-cache reveal images |
| Supabase free tier rate limits | 4-player demo is well within limits; no risk |
| Judge doesn't want to participate | Pre-seed Player 3 with fake data; judge watches instead |

---

## Team & Responsibilities

| Role | Person | Focus |
|---|---|---|
| **Backend + AI** | Aswin | Supabase setup, API routes (vision parsing, image gen, hint generation, persona), game logic, GLM-4/Claude integration |
| **Frontend + Presenter** | Nicole | All UI screens, component library, Supabase client integration, Tailwind styling, shadcn components, demo delivery |

**See also:** `docs/nicole-frontend-guide.md` — Nicole's standalone frontend reference.

---

*Generated during brainstorming session, 2026-06-06. v3 — renamed to BlindBite, all decisions locked, Supabase sync added.*
