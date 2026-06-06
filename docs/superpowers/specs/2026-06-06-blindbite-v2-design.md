# BlindBite v2 — Product Design Spec

> *Pivot from restaurant game → social food/drink recommendation app. Conversation summary as of 2026-06-06.*

| Event | VibeHack London 2026 |
|---|---|
| Track | **Track 2 — Vibe with Zymix** |
| Product name | **BlindBite** |
| Tagline | **"Crave. Pin. Vibe. Connect."** |
| Submission deadline | **12:00, Sunday 7 June 2026** |
| Status | **Design locked. Ready for build.** |

---

## TL;DR (one paragraph)

BlindBite is a social food and drink discovery app where you post a craving ("best grilled octopus nearby", "authentic Japanese matcha around Waterloo") and other users respond by pinning restaurant suggestions on a shared map. Each pin is AI-enriched with a rendered dish/drink image, a vibe summary, and tags. AI also acts as a co-recommender when no humans have responded yet, so the map is never empty. You pick a recommendation, go try it, then do a vibe check — if you loved it, a chat request goes to the recommender, and if they accept, AI generates an icebreaker to start the conversation. Making new friends through food.

---

## Why This Wins the Rubric

| Rubric criterion | Weight | How BlindBite v2 scores |
|---|---|---|
| Relevance to Zymix users | 25% | Gen Z lives on food/drink discovery. The craving→recommend→connect loop IS social. Judges can participate live. |
| Originality | 20% | "Map-based craving requests + AI-enriched pins + two-way chat unlock" — no team will build this. Threads Ch.1 (Social Vibe), Ch.3 (Coordination), and Ch.4 (Community Builder). |
| Quality of user experience | 20% | Corner-inspired map UI. One tap to post a craving. Pins appear with rich AI cards. Two-tap vibe check. One AI-generated icebreaker to start chatting. |
| Effective use of AI | 20% | AI is load-bearing in 4 distinct layers — pins cannot be enriched, matches cannot be ranked, empty maps cannot be filled, and conversations cannot start without AI. |
| Demo clarity | 15% | Two-device live demo. Aswin posts craving → Nicole pins a restaurant → AI enriches the pin → Aswin picks it → "Loved it!" → chat request → Nicole accepts → icebreaker appears. Theatrical and real. |

---

## Core User Flow

```
POST CRAVING → MAP VIEW (pins appear) → PICK ONE & GO → VIBE CHECK → CHAT UNLOCK (two-way) → CHAT (AI icebreaker)
```

### Detailed Steps

| # | Step | Who | Time | What happens |
|---|---|---|---|---|
| **1** | **Post a craving** | Requester | 10s | Type or speak what you want ("best grilled octopus nearby"). App uses your location. Craving appears as a pin on the map. |
| **2** | **Map view** | Everyone | — | Your craving is centered on the map. Recommendation pins appear around you (from humans + AI). |
| **3** | **AI co-recommender** (fallback) | AI | Immediate | If no human has responded within a few seconds, AI suggests 2-3 real nearby restaurants as AI pins (🤖 badge). |
| **4** | **Pin a recommendation** | Recommender | 20s | Search/select a restaurant → it appears as a pin on the requester's map. AI auto-enriches it. |
| **5** | **AI pin enrichment** | AI | 5s | When a pin is placed, AI generates: dish/drink image, vibe summary, tags. Smart Match ranks pins by fit to craving. |
| **6** | **Pick & go** | Requester | 5s | Tap a pin → see enriched card → tap "I'm going here!" |
| **7** | **Vibe check** | Requester | 5s | After visiting (or when they return to the app): "How was it?" [💚 Loved it!] [💔 Not for me] |
| **8** | **Chat request** | System | — | "Loved it" sends a chat request to the recommender. Requester sees "Waiting for confirmation..." |
| **9** | **Chat confirmation** | Recommender | 5s | Recommender sees: "@aswin loved your rec! Start chatting?" [👋 Start chatting] [✕ Maybe later] |
| **10** | **Chat with icebreaker** | Both | — | If recommender accepts → chat opens with AI-generated icebreaker ("You both love grilled seafood! 🐙") |

---

## 4 AI Layers (Load-Bearing)

| # | Layer | When | What | Model |
|---|---|---|---|---|
| 1 | **Pin Enrichment** | Someone pins a restaurant | AI generates dish/drink image + vibe summary + tags | GLM-Image + GLM-4 |
| 2 | **Smart Match** | Recommendations appear on map | Ranks pins by fit to craving, badges "✨ Best match" | GLM-4 |
| 3 | **AI Co-recommender** | No human recs yet (0-30s after posting) | Suggests 2-3 real nearby restaurants as AI pins | GLM-4 |
| 4 | **Chat Icebreaker** | Chat is unlocked (both confirmed) | Generates opening line based on shared food interest | GLM-4 |

**Human pins vs AI pins are visually distinct:**
- Human pins: avatar + name of recommender
- AI pins: 🤖 badge, labeled "AI suggestion"
- Both get the same enriched card format (image, vibe, tags)

---

## Challenge Direction Fit

| Challenge | How BlindBite fits |
|---|---|
| **Ch1: Social Vibe Tool** | Two-way chat unlock with AI icebreaker. Strangers break the ice over food. |
| **Ch3: Coordination Helper** | "Where should I eat?" → post craving → get real recommendations on a map. No more 40-message group chat. |
| **Ch4: Community Builder** | Discover like-minded food people. Shared taste = genuine connection, not algorithm-pushed. |

---

## Demo Script (3 minutes)

| Time | Beat |
|---|---|
| 0:00–0:20 | "You're in a new city. You want grilled octopus but don't know where. You could scroll Google reviews from strangers — or you could ask real people who actually care." |
| 0:20–0:40 | **Post craving.** Aswin types "best grilled octopus nearby" → pin appears on map. AI co-recommender immediately drops 2-3 suggestions (🤖 pins). Map is never empty. |
| 0:40–1:10 | **Nicole responds.** On her phone, she sees the craving. She pins "O Pescador" → AI enriches it instantly: rendered dish image, vibe summary "Cozy Portuguese spot, their octopus is legendary", tags #cozy #seafood. ✨ Best match badge. |
| 1:10–1:30 | **Aswin picks it.** Sees the enriched card. "I'm going here!" |
| 1:30–1:50 | **Vibe check.** Aswin returns: "How was @nicole's rec?" 💚 Loved it! Chat request sent to Nicole. |
| 1:50–2:10 | **Nicole confirms.** "@aswin loved your rec! Start chatting?" 👋 Start chatting. |
| 2:10–2:30 | **Chat opens with AI icebreaker.** "You both love grilled seafood! 🐙" — two strangers, now friends, over octopus. |
| 2:30–3:00 | "That's BlindBite. Post a craving, get real recommendations from real people, make friends over food. The map is never empty because AI fills the gap. But the connections are always human." Close. |

---

## Build vs. Mock

| Build for real | Mock / fake aggressively |
|---|---|
| Next.js + Tailwind web app | The **Zymix shell** (top nav, wallet UI) — pure CSS imitation |
| Map with real pins (Mapbox or Leaflet) | Real restaurant data (hardcode 10-15 London spots for demo) |
| Craving post + map display | Chat functionality — just show icebreaker + 1 message each |
| AI pin enrichment (GLM-Image + GLM-4) | "I'm going here" navigation — just visual, no real routing |
| AI co-recommender fallback | Push notifications — just in-app badges |
| Smart Match ranking | Profile screens — minimal |
| Vibe check + chat request flow | Real-time location tracking — use fixed demo locations |
| Chat with AI icebreaker | Taste profile / onboarding — skip, use pre-seeded data |

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + Tailwind + shadcn/ui + Mapbox GL JS (or Leaflet)
- **Map:** Mapbox GL JS (primary) or Leaflet + OpenStreetMap (fallback, no API key needed)
- **AI — Image:** GLM-Image (dish/drink rendering for pins)
- **AI — Text:** GLM-4 (pin enrichment, smart match, co-recommender, icebreaker) — PRIMARY
- **AI — Backup:** Claude Sonnet (if GLM-4 unavailable)
- **Backend:** Supabase (real-time subscriptions, PostGIS for location queries)
- **Hosting:** Vercel preview URL — judges scan QR and play live

---

## Award Stacking Strategy

| Award | Why we qualify | Effort delta |
|---|---|---|
| **Track 2 — Vibe with Zymix (1st = £1,000)** | Core build | — |
| **Z.ai x Orbit: Best Product Integration (£300)** | GLM-Image renders every pin card; GLM-4 powers 4 AI layers — not decorative, load-bearing | Use Ortie to capture |
| **Z.ai x Orbit: Best Workflow Use (£300)** | GLM-4 used for dev tasks alongside Claude | Document via Ortie |
| **Z.ai x Orbit: Best Real-World Potential (£300)** | Genuine Gen Z food discovery pain + replayability + monetization (restaurant partnerships) | Document via Ortie |
| **Z.ai x Orbit: Best Build-in-Public (£300)** | Capture pivot story, decisions, failures | Ortie + post |
| **Manus Real-World Use Case** | Use Manus for research/planning | Log session |
| **Fotor Vibe Marketing** | Generate promo visuals | Create Fotor post |

**Realistic ceiling:** £1,000 + up to £1,200 in Z.ai stack + Manus credits + Fotor credits.

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Two-device demo choreography fails | Practice 5+ times; have screen-recorded backup ready |
| Map doesn't load or pins don't appear | Pre-seed demo location with hardcoded pins; fall back to list view |
| AI image gen too slow for live demo | Pre-generate images for the 3 demo restaurants; show cached images |
| GLM-4 API issues at wire | Claude Sonnet as backup for all text AI |
| AI co-recommender suggests wrong restaurants | Hardcode 2-3 "AI suggestions" for the demo location as fallback |
| Judge doesn't want to participate | Demo works with just Aswin + Nicole on two devices |
| Mapbox API key issues | Leaflet + OpenStreetMap as zero-config fallback |

---

## Team & Responsibilities

| Role | Person | Focus |
|---|---|---|
| **Backend + AI** | Aswin | Supabase setup, API routes, AI layers (enrichment, matching, co-recommender, icebreaker), location queries |
| **Frontend + Presenter** | Nicole | Map UI, craving input, pin cards, vibe check, chat UI, demo delivery |

---

*Generated during brainstorming session, 2026-06-06. BlindBite v2 — pivot from restaurant game to social food/drink recommendation.*
