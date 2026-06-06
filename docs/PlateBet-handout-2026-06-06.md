# PlateBet — Build Handout

> *Conversation summary as of 2026-06-06 — share with teammates, use as your North Star during build.*

| Event | VibeHack London 2026 |
|---|---|
| Track | **Track 2 — Vibe with Zymix** |
| Working name | **PlateBet** *(open to rename)* |
| Submission deadline | **12:00, Sunday 7 June 2026** |
| Effective build window | ~18 hours |
| Status | Design proposed (v2 flow), awaiting final approval → spec doc → build |

---

## TL;DR (one paragraph)

PlateBet is an AI-powered restaurant companion for Gen Z friends dining out together. **One person photographs the paper menu; AI parses it and generates a visualised menu where every dish becomes a beautiful AI-rendered image — so nobody has to read descriptions.** Each person picks privately and shows their phone to the waiter to place the order. **While the food is being prepared, the table plays an AI-hosted game: friends guess what each other ordered, with personalized hints from "Chef Marco" calibrated to each player's flavor profile, and AI-generated dish images comparing each guess to reality.** The loser pays a settlement via a (mocked) Zymix wallet. Built as a standalone web app that feels native to Zymix.

---

## Why this idea wins the rubric

| Rubric criterion | Weight | How PlateBet scores |
|---|---|---|
| Relevance to Zymix users | 25% | Wallet+social is Zymix's exact thesis — we embody it in a moment Gen Z lives daily (restaurant dinner with friends). |
| Originality | 20% | "Visualized menu + pre-food anticipation game + AI-generated reveal" — a coherent flow no team will accidentally build. Threads Ch.2 (Entertainment Mini) **and** Ch.3 (Coordination Helper). |
| UX quality | 20% | Single end-to-end journey (menu → order → game → settle). One photograph triggers a full visual menu. Reading descriptions becomes optional. |
| Effective use of AI | 20% | AI is irreplaceable in 5 distinct layers — *menu cannot be visualised, ordering cannot be personalised, game cannot be played, and reveal cannot happen without AI*. |
| Demo clarity | 15% | Theatrical, judge-playable. The "upload-menu → visualised-menu" reveal is a 10-second wow moment by itself. |

---

## The Pain Points (the *why*)

- **Menu fatigue.** Reading dish descriptions on a paper menu in dim restaurant lighting is exhausting and unfair to anyone less food-fluent at the table.
- **Decision paralysis.** Too many choices, too little visual information. Everyone defers, the waiter waits.
- **Dead time.** 15–20 minutes between ordering and food arriving — phones come out, conversation flattens.
- **Bill-splitting awkwardness.** Settling up at the end is socially fraught.

PlateBet collapses these into one app: **visualised menu** kills decision fatigue, **the game** kills dead time, **wallet-stakes settlement** kills the awkward bill split.

---

## The Game Loop (full flow)

| # | Act | Time | What happens | Who's "active" |
|---|---|---|---|---|
| **0** | **Onboard** (one-time) | 30s | Each player swipes 8 food cards. AI builds your **Taste-DNA** vector. | New user |
| **1** | **Arrive** | — | Friends sit at the restaurant table together. | Everyone |
| **2** | **Upload menu** | 30s | One player photographs the paper menu. Vision + LLM extract dishes, prices, descriptions into structured data. | Host |
| **3** | **Visualised menu** | 60s passive | GLM-Image generates a beautiful card for every dish. Chef Marco (AI) narrates highlights. Each player sees their menu with Taste-DNA-matched dishes flagged ("✨ for you"). | Everyone scrolls |
| **4** | **Secret order** | 60s | Each player privately taps their dish. The app records each pick. | Everyone |
| **5** | **Show waiter** | 30s | Each phone displays a clean "Order Card" — dish name, modifiers, allergens. Players show phones to waiter, who keys orders in. | Waiter sees screens |
| **6** | **Game opens** | — | The moment the waiter walks away, the app prompts: *"Food's coming. Play while you wait?"* All in. | Everyone |
| **7** | **Hint + Guess rounds** | 5 min | Round-by-round, Chef Marco generates progressively-revealing hints per dish — calibrated to that player's Taste-DNA *and* the guessers'. Friends guess. Wrong guesses get roasted in-character. | Everyone competes |
| **8** | **The Reveal** | 60s | Side-by-side AI-rendered images: "what YOU guessed Sam ordered" vs "what Sam actually picked." Real food arriving = IRL reveal on top. | Everyone watches |
| **9** | **Settle** | 30s | Leaderboard. Loser's screen flips to mocked Zymix wallet pay-up. One-tap "payment sent." Persistent ranking carries to next dinner. | Loser pays |

---

## AI Architecture (5 layers)

```
                    ┌──────────────────┐
   Menu photo ─────►│ Menu Vision      │ (Claude vision OR GPT-4 vision)
                    │ → dish list,     │
                    │   descriptions,  │
                    │   prices         │
                    └────────┬─────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
        ┌──────────────┐  ┌───────┐  ┌──────────────┐
        │ GLM-Image    │  │Personal│ │ Chef Marco   │
        │ render each  │  │ised    │ │ narrates     │
        │ menu dish    │  │recs    │ │ (GLM-4)      │
        └──────┬───────┘  │(Claude)│ └──────┬───────┘
               │          └───┬────┘        │
               ▼              ▼             ▼
        ┌──────────────────────────────────────┐
        │      VISUALISED MENU (Act 3)         │
        └──────────────┬───────────────────────┘
                       │
                       ▼
              Each player's secret pick
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │   GAME PHASE (Acts 7-8)              │
        │                                      │
        │   Hint Engine ──► Persona ──► Hint   │
        │   (Claude)        (GLM-4)            │
        │                                      │
        │   Each guess ──► GLM-Image           │
        │   ┌─► (cached from Act 3 if match)   │
        │                                      │
        │   Reveal: side-by-side images        │
        └──────────────────────────────────────┘
```

**Onboarding feeds it all:** Taste-DNA vectors flow into personalized recs (Act 3) and personalized hints (Act 7).

**Cost discipline:** dish images are generated ONCE during Act 3 (visualised menu) and reused at Act 8 (reveal) wherever the guess matches an already-rendered dish. So generating ~12–20 dish images per restaurant session costs us roughly ~$0.30. Demo cost is trivial.

**Skeleton-first build:** each layer can be turned off and the app still functions. If we run out of time, we drop personalized hints; the game still works with generic hints. If we drop persona, hints become plain. Image gen is the only non-droppable layer — it carries Z.ai integration.

---

## Build vs. Mock (the discipline)

| Build for real | Mock / fake aggressively |
|---|---|
| Next.js + Tailwind web app | The **Zymix shell** (top nav, wallet UI, chat bubble) — pure CSS imitation |
| Menu photo upload + vision parsing (real) | **2–3 pre-parsed London restaurant menus** as fallback if vision fails live |
| Onboarding swipe → Taste-DNA | Wallet "payment" — UI animation only, no real money |
| GLM-Image dish rendering | Multi-device sync — second "phone" is a second browser tab |
| Hint generation (Claude Sonnet) | Real waiter (we either explain the beat verbally OR ask a judge to play waiter) |
| Persona wrapper (GLM-4) | Group chat trigger from Zymix — we open the app directly |
| Vercel deploy + QR code | Real Zymix integration (no SDK exists) |

**Principle:** every line of code serves the 3-minute demo. Everything else is mocked.

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + Tailwind + shadcn/ui
- **Menu Vision:** Claude Sonnet vision OR GPT-4 vision (whichever has lowest latency for table photos)
- **Text AI:** Claude Sonnet (hint logic, dish recs) + GLM-4 (Chef Marco persona)
- **Image AI:** **Z.ai GLM-Image** ($0.015/image — ~$0.30 per full session, ~$3 across demos)
- **State:** React + localStorage (no DB)
- **Hosting:** Vercel preview URL — judges scan QR and play live during the 3-min demo

---

## Demo Script (3 minutes)

| Time | Beat |
|---|---|
| 0:00–0:20 | "Imagine four friends at a restaurant. Paper menu, no photos, decision paralysis, then 20 minutes of dead time. We turn the whole dinner into a game." |
| 0:20–0:50 | **Menu upload moment.** Someone snaps the paper menu (we have one printed on the table). Watch the visualised menu appear — every dish rendered live. Chef Marco narrates. *This alone is a "whoa" moment.* |
| 0:50–1:20 | Each "player" (judge or pre-set fake friend) picks a dish privately. Phone screens show clean "Order Card" — *that's what you show the waiter*. |
| 1:20–2:15 | "Food's being made. Now we play." Live round: AI generates a personalized hint as Chef Marco. Judge laughs. Wrong guess gets roasted in character. |
| 2:15–2:40 | **The reveal — the money shot.** Side-by-side AI-generated images: each friend's GUESS vs Sam's ACTUAL pick. Four wildly different visual interpretations of "Sam's mystery dish." |
| 2:40–3:00 | Leaderboard. Loser → mocked Zymix wallet pay-up. "Persistent ranking. That's why they come back next Friday." Close. |

---

## Award Stacking Strategy

| Award | Why we qualify | Effort delta |
|---|---|---|
| **Track 2 — Vibe with Zymix (1st = £1,000)** | Core build | — |
| **Z.ai x Orbit: Best Product Integration (£300)** | GLM-Image is the substrate for BOTH the menu and the reveal — not a feature, the foundation | Use Ortie to capture |
| **Z.ai x Orbit: Best Workflow Use (£300)** | Built using GLM-4 alongside Claude during development | Document via Ortie |
| **Z.ai x Orbit: Best Real-World Potential (£300)** | Genuine restaurant pain + replayability + clear monetization (vouchers, partnerships) | Document via Ortie |
| **Z.ai x Orbit: Best Build-in-Public (£300)** | Capture build process, failures, decisions in this repo | Ortie + post |
| **Manus Real-World Use Case** | Use Manus for research/planning during build | Log Manus session, share link |
| **Fotor Vibe Marketing** | Generate "Chef Marco" character art + promo visuals | Create Fotor post, link in Devpost |

**Realistic ceiling:** £1,000 + up to £1,200 in Z.ai stack + Manus credits + Fotor credits.

---

## Decisions Locked In

- Track 2 (Vibe with Zymix), challenge bridges Ch.2 + Ch.3
- **Game played BEFORE food arrives** (anticipation theater)
- **Menu visualization is the opener** — one photo → AI-rendered menu cards (NEW)
- **"Show your phone to the waiter"** is the order-handoff moment (NEW)
- 5 AI layers stacked: Menu Vision → Personalized Recs → Persona → Hints → Image Gen
- Standalone web app (no Zymix SDK)
- Z.ai GLM-Image as load-bearing image generation (now used twice: menu + reveal)

## Decisions Pending

1. **Product name** — "PlateBet" working title.
2. **Final Claude/GLM text split** — proposed: Claude Sonnet for hints + vision, GLM-4 for persona.
3. **Team composition** — solo, pair, or full team of 4? Affects parallelization.
4. **Zymix app downloaded by team?** — required prerequisite for "Relevance to Zymix users" rubric.
5. **2–3 fallback restaurant menus** — which real London menus to pre-parse for demo safety?
6. **Chef Marco character** — final voice, name, persona detail.
7. **Demo multi-device strategy** — real second phone, or split-screen tabs?
8. **Waiter beat in demo** — judge plays waiter, or we narrate it verbally?

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Menu OCR/vision fails on weird menu layouts during live demo | Pre-parse 2 fallback menus + offer "Use sample menu" button always visible |
| Image gen latency kills the menu reveal moment | Generate images in parallel and progressively reveal; show skeleton cards first |
| Personalized hints feel generic | Pre-build 3 rich fake personas with histories for the demo |
| Time runs out before persona layer | Skeleton works without persona; drop and ship plain hints |
| Judges miss the AI being essential | Demo script explicitly narrates each AI moment |
| Multi-device choreography fails | Practice 5+ times; have screen-recorded backup ready |
| GLM-Image API issues at wire | Have OpenAI image fallback ready, or pre-cache reveal images |

---

## What's Next

1. **You review this handout.** Note disagreements, missing pieces, rebrand ideas.
2. **Lock pending decisions** (especially team size, Zymix download status, fallback menus).
3. **I commit a formal spec** to `docs/superpowers/specs/2026-06-06-platebet-design.md`.
4. **Hand off to the writing-plans skill** for a sequenced build plan.
5. **Start the clock on the build.**

---

*Generated during brainstorming session, 2026-06-06. v2 — incorporates menu-upload flow.*
