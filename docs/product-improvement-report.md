# BlindBite v2: Product Improvement Report

**Prepared for:** VibeHack London 2026 | Track 2: "Vibe with Zymix"
**Date:** 7 June 2026
**Status:** Research & Recommendations

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [AI Functionalities to Add](#2-ai-functionalities-to-add)
3. [Social & Community Features](#3-social--community-features)
4. [Monetization Opportunities](#4-monetization-opportunities)
5. [Technical Improvements](#5-technical-improvements)
6. [Competitive Landscape](#6-competitive-landscape)
7. [Hackathon-Specific Quick Wins](#7-hackathon-specific-quick-wins)
8. [Prioritized Roadmap](#8-prioritized-roadmap)

---

## 1. Executive Summary

BlindBite v2 occupies a unique position at the intersection of **social food discovery**, **AI-powered recommendations**, and **Gen Z community building**. Our research across competitive apps, hackathon winning patterns, and the 2026 food-tech landscape reveals a clear opportunity: BlindBite can differentiate by being the **only app where AI is not just an enrichment layer but the core social fabric** -- connecting people through taste, not just geography.

### Key Findings

| Area | Top Opportunity | Effort | Impact |
|------|----------------|--------|--------|
| AI | Taste Twin matching + conversational cravings | Medium | Very High |
| Social | Recommender reputation system | Low | High |
| Monetization | Sponsored pins + premium AI taste DNA | Medium | Medium |
| Technical | Google Places API (New) with AI summaries | Low | High |
| Competitive | Map-first + social chat unlock is defensible | N/A | N/A |
| Hackathon | Live voice craving + real-time AI decision assistant | 2-4 hrs | Very High |

---

## 2. AI Functionalities to Add

### 2.1 Competitive AI Feature Analysis

Our research identified the following AI features across competing and adjacent apps:

#### What Competitors Are Doing

| App | AI Features | Maturity |
|-----|------------|----------|
| **Corner** | AI vibe summaries on place pages; natural language search (v5.0); TikTok/Instagram link-to-pin via AI | Production, 125K users |
| **Beli** | Comparative ranking algorithm; taste similarity scoring between friends; personalized recommendation engine from ranked data | Production, 80M+ reviews globally |
| **Seemor** | 35-dimension "Restaurant DNA" analysis; "For You" personal fit score; review authenticity detection; occasion-based weighting | Production, 35 cities |
| **Bonapi** | "Taste Graph" ML model; explainable AI ("Because you loved that spicy ramen..."); 13 food categories; allergen safety filtering | Production |
| **MoodBite** | Mood-card selection + natural language craving input; mood-scored recommendations; travel mode for multi-city planning | Production |
| **Forki** | Mood-to-food matching; "FridgeMagic" (photo pantry -> meal suggestions); restaurant mood-matching | Production |
| **Crvyn** | Photo-based dish search ("I want something that looks like this"); taste memory profile; dish-level (not restaurant-level) matching | Production |
| **TasteBuddy** | Palate matching (spice/umami/bitterness preferences); instant menu photo analysis; cross-cuisine preference portability | Production |
| **Flavry** | "TasteDNA" living flavor profile; "CravePulse" real-time flavor trends; mood-shift-aware recommendations | Production |
| **Honeycomb** | 29-allergen severity scale; verified restaurant dietary practices; group mode for shared dietary needs | Production, 2500+ cities |
| **Menami** | Personal food agent via MCP/CLI/API; proactive anniversary/trip suggestions; taste profile that acts on your behalf | Open source, 3K+ restaurants |
| **NearSpotty** | Gemini 3-powered dietary scoring; smart dietary scoring from review sentiment ("They modified my pasta for allergies") | Production |

#### Critical Gap Analysis: What BlindBite Should NOT Copy

These are features competitors already own or that create more complexity than value:

| Feature | Why Skip | Better Alternative |
|---------|----------|-------------------|
| Star ratings (1-5) | Google/Yelp commodity; Beli proved comparative ranking is better | Keep Smart Match ranking (already differentiator) |
| Review authenticity detection | Seemor owns this niche; expensive to build | Use vibe-check sentiment as proxy for quality |
| Full menu scraping | MadisonBites/Chevze showed this is fragile | Use Google Places API menu data + AI enrichment |
| Photo-heavy feed | Beli/Instagram territory | Keep map-first, photo only in pin cards |
| Generic "for you" scores | Seemor/Boni do this without social context | BlindBite's "For You" = friend-recommended + AI-ranked |
| Diet-only focus | Honeycomb owns this deeply | Allergen detection as layer ON TOP of social recs |

### 2.2 Recommended New AI Layers (Beyond Current 4)

BlindBite currently has 4 AI layers: Pin Enrichment, Smart Match, Co-recommender, Chat Icebreaker. We recommend adding these **6 new layers**:

#### AI Layer 5: Taste Twin Engine

**What it does:** Uses collaborative filtering + embedding similarity to find users whose palate profiles match yours. When you get a recommendation from your Taste Twin, it gets a badge and boosted ranking.

```
Input: User's craving history, vibe-check responses, accepted/rejected pins
Process:
  1. Build flavor embedding vector per user (cuisine prefs, spice tolerance,
     price range, ambiance偏好, dietary constraints, rating patterns)
  2. Compute cosine similarity between all user pairs
  3. Identify top-K taste twins within geographic proximity
  4. Surface their recommendations with "Your Taste Twin loved this" badge
Output: Ranked list of taste-similar users + their pinned recommendations
```

**Why it wins:** No competitor combines taste similarity WITH social chat unlock. Beli has taste similarity scores but no mechanism to meet those people. This is BlindBite's moat.

**Implementation approach (hackathon):**
- Start with a simple cosine similarity on cuisine tag overlap
- Expand to full embedding post-hackathon
- Show "92% taste match" on recommender profiles in pin cards

#### AI Layer 6: Conversational Craving Input

**What it does:** Replace structured craving forms with natural language: "I want something spicy but not too heavy, maybe Thai, under 15 pounds, good for a first date kinda vibe"

**Competitor precedent:** Corner v5.0 launched exactly this ("completely new way to find your next favorite place using natural language"). Seemor: "Say it the same way you'd say it to a friend." MoodBite: "Pick a mood card or type what you're craving."

**Implementation approach (hackathon):**
- GLM-4 / Claude API call with structured output schema
- Extract: cuisine, price_range, mood, dietary, party_size, ambiance, urgency
- Pre-fill the craving pin with extracted fields
- Show user what AI understood ("Got it: Spicy Thai, <GBP15, date vibes")

#### AI Layer 7: Voice Craving (Multimodal Input)

**What it does:** Push-to-talk voice cravings. "Ugh I'm starving and I really want like... comfort food? Something warm. Not sushi though, had that yesterday."

**Competitor precedent:** Yumi (HackHarvard 2025 3rd place) used ElevenLabs for voice input. VoiceBite built a full voice ordering concierge. Chefeze built push-to-talk cooking copilot.

**Why it's a demo wow factor:** Voice is inherently social and casual -- perfect for Gen Z. It makes the demo feel magical.

**Implementation approach (hackathon):**
- Web Speech API (free, browser-native) for STT
- Send transcript to existing GLM-4 craving parser
- Add microphone button to craving composer
- Show live waveform animation while recording
- **Effort: 2-3 hours**

#### AI Layer 8: Real-Time AI Decision Assistant

**What it does:** When a user has 3+ pinned recommendations and can't decide, they tap "Help me choose" and get an AI assistant that compares options side-by-side, asks clarifying questions ("Do you care more about ambiance or speed?"), and gives a reasoned pick.

**Competitor precedent:** Seemor's Compare feature shows best food/value/ambiance/service across up to 500 restaurants. But none of them do it conversationally.

**Demo script for judges:**
> "OK so I posted 'best curry in Shoreditch' and got 4 pins. I'm torn between Dishoom and Gymkhana. Let me ask BlindBite..." *taps AI Assistant* "...it's comparing vibe scores, my friend's ratings, wait times, and my spice tolerance. It recommends Dishoom because two of my taste twins loved it AND it fits my 'casual Friday' mood pattern."

**Implementation approach (hackathon):**
- New "Debate Mode" modal on craving detail view
- Takes array of pinned restaurants as context
- LLM prompt: "You are a food-savvy friend helping decide. Compare these 3 options considering: {user_taste_profile}. Ask 1-2 questions then recommend."
- Stream response token-by-token for demo effect
- **Effort: 3-4 hours**

#### AI Layer 9: Photo-Based Craving ("Visual Craving")

**What it does:** User uploads or snaps a photo of a dish they want (from Instagram, camera roll, or a magazine) and BlindBite finds visually + semantically similar dishes nearby.

**Competitor precedent:** Crvyn's entire value prop is "Tell Crvyn what you're craving -- by memory, flavor, mood, or **photo**." TasteBuddy's "Snap a photo of any menu and our AI instantly reads and analyzes every dish."

**Implementation approach (post-hackathon, complex):**
- GLM-4 Vision / Claude Vision for image understanding
- Embed dish photo into vector space
- Match against Google Places restaurant photo dataset
- Return nearest visual matches within radius

#### AI Layer 10: Vibe Check Sentiment Engine

**What it does:** Analyzes tone, specificity, and enthusiasm in vibe-check responses to:
- Weight recommender reputation (enthusiastic + specific = higher trust)
- Detect fake/generic responses ("yeah it's good")
- Improve future Smart Match rankings based on what vibe check dimensions correlate with actual satisfaction

**Data points to extract per vibe-check:**
```json
{
  "sentiment_score": 0.87,
  "specificity": "high",  // mentions specific dishes, flavors, details
  "enthusiasm": "high",   // exclamation marks, emotional words
  "dimensions_mentioned": ["ambiance", "service", "value"],
  "trust_signal": "strong",
  "recommended_for": ["date_night", "casual_dinner"]
}
```

### 2.3 Complete AI Architecture (Current + Proposed)

```
LAYER 0: Data Foundation
  - PostGIS spatial index (Supabase)
  - Google Places API (New) restaurant data
  - User interaction events

LAYER 1: Pin Enrichment (EXISTING)
  - GLM-Image: dish photo generation/enhancement
  - GLM-4: vibe summary + tag extraction from restaurant data

LAYER 2: Smart Match Ranking (EXISTING)
  - Craving-pin fit score
  - Distance, freshness, recommender weight

LAYER 3: AI Co-Recommender (EXISTING)
  - Fills map when no human pins yet
  - Uses Places API + local popularity signals

LAYER 4: Chat Icebreaker (EXISTING)
  - Generates opening message after mutual vibe-check confirm

LAYER 5: Taste Twin Engine (NEW)
  - User flavor embeddings
  - Cosine similarity matching
  - "Your Taste Twin loved this" badges

LAYER 6: Conversational Craving Parser (NEW)
  - NL -> structured craving extraction
  - GLM-4 with JSON schema output

LAYER 7: Voice Craving Input (NEW)
  - Web Speech API STT -> text -> Layer 6

LAYER 8: Decision Assistant (NEW)
  - Multi-option comparison + interactive Q&A
  - Streaming LLM response

LAYER 9: Visual Craving (NEW, POST-HACKATHON)
  - Vision model image embedding
  - Visual similarity search

LAYER 10: Sentiment Engine (NEW)
  - Vibe-check NLP analysis
  - Reputation signal generation
```

---

## 3. Social & Community Features

### 3.1 How Competitors Build Social Stickiness

#### Corner's Social Model
- **Core loop:** Save places -> Build lists -> Follow friends -> See their spots -> Discover new places -> Go IRL
- **Key insight from founder Eliza Wu:** "The point of Corner is not to get you socializing on the app; it's designed to make a plan to go somewhere with the actual people you want to be social with."
- **Social proof:** 125K users across 425 cities; App Store featured story (May 2026); raised $3.8M
- **What works:** Lists as identity expression ("bars with main-character energy"); TikTok/Instagram save import; Gen Z aesthetic curation
- **What doesn't translate to BlindBite:** Corner is about places generally, not food specifically. No chat/unlock mechanic.

#### Beli's Social Model
- **Core loop:** Eat somewhere -> Rank it (comparative) -> See friends' rankings -> Build taste graph -> Get better recs
- **Gamification:** Leaderboards (city + global), streaks (Duolingo-style nudge), "Match Score" with friends
- **Social proof:** 80M+ global reviews; 75M reviews across 30K cities (Sept 2025); 4.9 App Store rating; ~80% of users under 35
- **Key quote (Stanford Daily, Jan 2026):** "Beli's social side is fun because I can see my friends' tastes in food" while having "a fun social aspect while not being designed to be addictive unlike every other social media app."
- **What works:** Food diary as identity; tagging dining companions; comparative ranking creates engagement depth
- **User complaints (Google Play):**
  - "Hard to convince friends to switch if I'm unconvinced"
  - "Setup is a chore" -- can't import Google Maps saved places easily
  - "App wants to be Facebook so bad" -- too many social prompts
  - "Content hidden behind social paywall if you don't invite enough people"
  - Takes forever to add missing restaurants
  - Focus on elite/expensive restaurants generates "unmerited buzz"

#### BeReal's Anti-Social-Stickiness Model (Lessons for BlindBite)
- **One notification per day** at random time -- creates anticipation, not addiction
- **No filters, no editing** -- authenticity over curation
- **See friends' moments only after posting your own** -- reciprocity mechanic
- **Lesson for BlindBite:** Time-limited craving windows could create similar daily anticipation. "Post your craving in the next 30 min to see what your friends are craving too."

#### Locket's Model (Lessons for BlindBite)
- **Auto-updating home screen widget** with friends' photos
- **Zero-friction sharing** -- take photo, it appears on friends' lockscreens
- **Lesson for BlindBite:** Widget showing "3 friends craving near you right now" could drive daily opens

### 3.2 Recommended Social Features for BlindBite

#### Feature 1: Recommender Reputation Score

Every user who pins recommendations builds a public reputation:

| Signal | Weight | How Measured |
|--------|--------|-------------|
| Acceptance rate | 40% | % of their pins that get positive vibe-checks |
| Specificity | 20% | NLP analysis of their pin descriptions |
| Diversity | 15% | Range of cuisines/price points they recommend |
| Responsiveness | 15% | Speed of reply to chat unlocks |
| Streak | 10% | Consecutive weeks of active recommending |

**Display:** "Alex R. -- 94% loved-it rate -- 47 recommendations" on pin cards.

**Why this matters:** Solves the trust problem that plagues all user-generated content platforms. Beli has no reputation system -- every user's word is equal. This is a clear differentiation.

**Implementation (hackathon):** Simple weighted average displayed on profiles. Full scoring pipeline post-hackathon.

#### Feature 2: Friend-of-Friend Trust Graph

When you receive a pin recommendation, show the social distance:

```
[Pin Card]
Restaurant: Morito
Pinned by: Sarah K.
Connection: Friend of Alex (you've eaten together 3x)
Reputation: 91% loved-it rate
Sarah says: "Best octopus in London, order the burnt eggplant too"
```

**Why it matters:** Research consistently shows friend-of-friend recommendations have 3-5x higher conversion than stranger recs. Corner's entire value prop is "one recommendation from a trusted friend is worth 1,000 reviews." BlindBite extends this to friends-of-friends.

#### Feature 3: Taste Circles

Auto-grouped communities of users with similar palates within a city:

```
Your Taste Circle: "Shoreditch Spice Seekers"
12 members | 87% avg match to you | Active now

Recent pins from your circle:
- Kimchi caramel pork belly @ Jidori (new!)
- Lamb chops @ Berenjak (verified amazing)
```

**Differentiation vs. Beli:** Beli shows individual taste similarity (1:1). BlindBite shows taste communities (1:N). More social, more discoverable.

#### Feature 4: Restaurant Streaks & Food Challenges

Gamification borrowed from Duolingo/Beli but adapted for discovery:

| Challenge Type | Example | Reward |
|---------------|---------|--------|
| Cuisine Streak | Try 3 new cuisines this week | "Adventurous Eater" badge |
| Neighborhood Explorer | Visit 5 restaurants in one borough | Local expert status |
| Budget Challenger | Find great meals under GBP12 | Featured in "Best Value Hunters" circle |
| Recommender Streak | Give 7 recommendations that get accepted | Reputation boost multiplier |

**Critical design lesson from Beli complaints:** Users criticized Beli for making streaks feel like pressure rather than fun. BlindBite should make challenges opt-in, celebratory (not shaming), and social (share your challenge progress).

#### Feature 5: Local Food Community Feed

A reverse-chronological feed (like noplace's "world's biggest group chat") showing:

- Friends' recent cravings and pins
- Taste circle activity
- "Someone you know is at [Restaurant] right now" (optional, privacy-respecting)
- Weekly "Top Cravings in Your City" roundup

**Design principle from noplace:** Reverse chronological, algorithm-free feed. What you see is what's happening NOW. No doomscroll optimization.

### 3. Social Feature Priority Matrix

| Feature | Hackathon Feasibility | Retention Impact | Dev Effort | Priority |
|---------|----------------------|------------------|------------|----------|
| Recommender Reputation Score | High (simple calc) | High | Low | **P0** |
| Friend-of-Friend labeling | High (use existing social graph) | Medium | Low | **P0** |
| Taste Circles (basic) | Medium (need clustering) | High | Medium | P1 |
| Restaurant Streaks | Medium (need tracking) | Medium | Medium | P1 |
| Community Feed | High (filter existing data) | Medium | Low | **P1** |
| Time-limited craving windows | High (frontend toggle) | Medium | Low | P2 |

---

## 4. Monetization Opportunities

### 4.1 Current Food App Revenue Models (2026)

Based on our research into food delivery and discovery monetization:

| Model | Who Pays | Typical Revenue | Best For | Examples |
|-------|----------|-----------------|----------|----------|
| Commission | Restaurants | 15-30% per order | Delivery platforms | Uber Eats, Deliveroo |
| Subscription | Users | $5-15/month | Power users | MoodBite Pro, Honeycomb Premium |
| Sponsored Listings | Restaurants | CPM/CPC model | Marketplaces | Yelp, Google Maps |
| Delivery Fees | Users | $2-5 per order | Logistics coverage | All delivery apps |
| Surge Pricing | Users | Dynamic 1.5-3x | Demand balancing | Uber Eats |
| Merchant Tools | Restaurants | $50-200/month | POS/integration | Toast, Square |
| White-label | Businesses | Custom pricing | Enterprise chains | Custom builds |
| Affiliate/R referral | Partners | Per-booking commission | Reservation flows | Resy, OpenTable |

### 4.2 Recommended Monetization for BlindBite

#### Tier 1: Near-Term (Post-Hackathon, 0-6 months)

##### 4.2.1 Sponsored Pins (Restaurant Partnerships)

Restaurants pay to appear as AI-enriched pins when cravings match their cuisine/profile:

```
[Sponsored Pin Badge] 🏷️
Restaurant: Padella
Sponsor: Shoreditch location
Why shown: User craved "pasta nearby"
AI Enrichment: Fresh pasta made in-house daily, avg wait 45min
Offer: "Show this pin for 10% off your first visit"
```

**Pricing model:** Cost-per-pin-view (like Google Local Services) or flat monthly for guaranteed visibility in specific craving categories.

**Why it works for Gen Z:** Native, non-intrusive, actually useful (discount + AI context). Unlike banner ads that Gen Z tunes out.

**Revenue estimate (conservative):** At 10K active users in London, 3 cravings/user/week = 30K weekly pin impressions. At GBP 0.05 CPM = GBP 1.5K/month at scale. With sponsorship premiums: GBP 5-15K/month.

##### 4.2.2 Premium AI Features (BlindBite+)

| Free | Premium (GBP 4.99/mo or GBP 39.99/yr) |
|------|--------------------------------------|
| Basic Smart Match ranking | **TasteDNA Deep Analysis** -- full flavor embedding breakdown |
| 3 co-recommendations/day | **Unlimited co-recommendations** + priority AI responses |
| Text cravings only | **Voice cravings** + **visual/photo cravings** |
| Basic taste twin matches | **Taste Twin Radar** -- see ALL matches globally, not just local |
| Standard icebreaker | **Super Icebreaker** -- generates 3 opening styles (funny, genuine, bold) |
| 7-day history | **Full craving archive** + export your taste profile |
| Community feed | **Early access** to new restaurants before general map population |

**Why subscription works here:** The AI features have real marginal cost (LLM API calls). Free tier demonstrates value; power users pay for unlimited AI. Same model as MoodBite (3 free searches/day, Pro for unlimited).

**Reference point:** Honeycomb charges lifetime access for premium allergen features. MoodBite charges for unlimited searches + travel mode. Both prove users will pay for AI food intelligence.

#### Tier 2: Mid-Term (6-18 months)

##### 4.2.3 Group Ordering Integration

When a chat unlocked via BlindBite results in a group going to a restaurant together:

```
Chat: You, Sarah, Mike (deciding on Morito)
BlindBite: "Great choice! 4 of you want to go?
           → Split menu by dietary prefs
           → Pre-order for the table (skip the 20-min ordering debate)
           → Split bill automatically"
```

**Integration partners:** Uber Eats API, Deliveroo API (for pickup orders), or direct restaurant POS integration.

**Revenue:** Take rate on group orders (3-8%) OR monthly SaaS fee from restaurants for the "group booking + pre-order" tool.

##### 4.2.4 Food Delivery Integration

Deep-link pinned restaurants to delivery:

```
[Pin Card: Dishoom]
AI Vibe: "Lively, perfect for groups, try the black daal"
Deliver to me in 35 min -- GBP4.99 delivery
OR Book a table for tonight (via Resy/OpenTable)
```

**API options:**
- **Uber Eats Developer Platform:** Restaurant menu + ordering + delivery tracking
- **Deliveroo API:** UK-focused, strong London coverage
- **Just Eat:** UK market leader, partner API available

**Revenue:** Affiliate commission per completed delivery order (typically 5-10%).

##### 4.2.5 Reservation Booking

Integration with Resy or OpenTable for one-tap booking from pin cards:

```
[Pin Card Actions]
💬 Vibe Check | 🔓 Chat | 📅 Book Table (Tonight, 7pm, 4 guests)
```

**Resy API advantages:** Returns availability, venue details, Foursquare/Google ratings, platform-specific tags. Clean REST API.

**OpenTable advantages:** 38% market share, verified diner reviews, richer restaurant data. No public API (affiliate program only).

**Revenue:** Per-booking affiliate fee (GBP 1-3 per seated guest, per OpenTable's model).

#### Tier 3: Long-Term (18+ months)

##### 4.2.6 BlindBite for Restaurants (B2B Dashboard)

Restaurant owners get:

- Real-time analytics on how often their restaurant appears in pins/cravings
- Sentiment analysis of vibe-check mentions
- Competitive benchmarking (how often competitors get recommended instead)
- Sponsored pin management tools
- "Reply to craving" -- restaurant can respond directly to user cravings with offers

**Pricing:** GBP 49-199/month depending on market size and feature tier.

**Reference:** PetPooja (hackathon project) built a full BCG-matrix revenue intelligence dashboard for restaurants. The demand exists.

### 4.3 Monetization Cautionary Lessons

From Beli's challenges (per StartupSignals analysis):
1. **Low dining frequency = hard habit formation** -- don't rely on daily active usage for ad revenue
2. **Transition from free to paid must preserve core value** -- never gate social features behind paywall (Beli made this mistake with invite-gating)
3. **Monetize the recommendation, not the connection** -- restaurants should pay to be discovered; users should never pay to talk to each other

---

## 5. Technical Improvements

### 5.1 Restaurant Data APIs: 2026 State of the Art

Our research into the current API landscape reveals significant changes from previous years:

#### Google Places API (New) -- PRIMARY RECOMMENDATION

The new Places API (rolled out 2025-2026) is a game-changer for BlindBite:

| Capability | Details |
|-----------|---------|
| **Place Details (New)** | Comprehensive info: address, phone, rating, reviews, hours, photos |
| **Text Search (New)** | Natural language queries: "Spicy Vegetarian Food in Shoreditch" |
| **Nearby Search (New)** | Radius-based search with type filters |
| **Place Photos (New)** | High-quality photos from Google's database |
| **Autocomplete (New)** | Session-token-billed autocomplete |
| **AI-Powered Summaries** | Gemini-generated place/review/area summaries (NEW!) |
| **Accessibility fields** | Wheelchair accessibility, parking info |
| **Price** | $17 per 1,000 Place Details calls (can scale quickly) |

**The killer feature: AI Summaries.** Google now returns Gemini-generated summaries about places directly in the API response. This includes:
- **Place summaries:** Short overview with menu highlights, vibe description
- **Review summaries:** Digestible synthesis of what reviewers said
- **Area summaries:** Neighborhood overviews with popular nearby places

**For BlindBite:** This means the Pin Enrichment AI layer can use Google's AI summaries as a foundation, then add BlindBite-specific social context (friend recommendations, vibe checks). Reduces LLM cost significantly.

**Cost reality check:** For 30,000 monthly record pulls (scaling), costs hit $510-960/month. For hackathon/demo: well within free tier.

#### Yelp Fusion API -- SECONDARY DATA SOURCE

| Pro | Con |
|-----|-----|
| 5K free calls/day trial | Transitioned to paid-only (2025) |
| Rich review excerpts (160 chars) | Only 3 review excerpts per business |
| 32-country coverage | Concentrated in US; weaker internationally |
| Transaction search (delivery) | No full review text via API |
| GraphQL API (beta, 10K queries/day) | 24-hr cache limit only |

**Verdict:** Useful as secondary source for review sentiment, but not primary due to paid transition and coverage gaps.

#### Foursquare Places API -- PERSONALIZATION ENGINE

| Pro | Con |
|-----|-----|
| 100K free requests/month | Contact data incomplete (40% have phones) |
| 1,000+ category taxonomy | Complex category ID system |
| Strong location intelligence | Strict licensing (no storage/redistribution) |
| Popularity/pvisit signals | Weaker review content than Google/Yelp |
| Pilot plan: free tier generous | Paid plans from $200/month |

**Verdict:** Excellent for Taste Twin Engine (behavioral/personalization signals). Use alongside Google for place data.

#### OpenTable -- RESERVATIONS ONLY

| Pro | Con |
|-----|-----|
| Verified diner data (every reviewer dined there) | No public API |
| 4-axis sub-ratings (food, service, ambience, noise) | Scraping only (and they notice volume) |
| 38% reservation market share | Small dataset per restaurant |
| Unfakeable reviews | Reservation-only sample bias |

**Verdict:** Post-hackathon integration via affiliate program only.

### 5.2 Recommended Technical Stack for BlindBite

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│  React / Next.js + Mapbox GL JS (or Leaflet)        │
│  PWA manifest (offline-first)                       │
│  Web Speech API (voice cravings)                     │
│  Push Notifications (Web Push API)                  │
│  Real-time subscriptions (Supabase Realtime)        │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────┐
│                    BACKEND                          │
│  Supabase (Postgres + PostGIS + Realtime + Auth)    │
│  Edge Functions (Deno) for AI orchestration          │
│  Vector store (pgvector) for taste embeddings        │
└───────────────────┬─────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌────────┐   ┌──────────┐   ┌──────────────┐
│ GLM-4  │   │ Google   │   │  Claude      │
│ (Zhipu)│   │ Places   │   │  (fallback)  │
│ Vision │   │ API (New)│   │              │
│ + Text │   │ + Photos │   │              │
└────────┘   └──────────┘   └──────────────┘
```

### 5.3 Real-Time Location Sharing ("Meet at the Restaurant")

After a chat is unlocked and the group decides on a restaurant:

```
Phase 1: Decision Made
  Group selects restaurant from pinned options

Phase 2: Meet-Up Mode
  - Optional real-time location sharing (like Google Maps' "Share location")
  - Shows ETA for each person on the map
  - "Everyone's here!" notification when all arrive within 50m

Phase 3: Transition to IRL
  - Auto-suggests "Log this meal" post-visit prompt
  - Photos from the meal can become future pin enrichment material
```

**Technical approach:**
- Browser Geolocation API with watchPosition() for continuous updates
- Supabase Realtime channel for broadcasting location to group members
- Privacy-first: location sharing is opt-in, time-limited (auto-stops after 2 hours), group-scoped only

### 5.4 Push Notification Strategy

| Trigger | Notification Content | Timing |
|---------|----------------------|--------|
| Friend pinned on your craving | "Sarah pinned Dishoom for your curry craving! Tap to vibe-check" | Immediate |
| New craving in your area | "3 people craving Italian in Shoreditch right now" | Batched hourly |
| Taste twin activity | "Your taste twin Alex just loved a new ramen spot nearby" | Daily digest |
| Streak reminder | "You're on a 5-day recommendation streak! One more to earn the badge" | 10am local |
| Post-meal nudge | "How was Morito? Rate it to improve your recommendations" | 24h after chat unlock confirmed |

**Critical design rule:** Max 2 notifications per day. Gen Z aggressively mutes spammy apps. Every notification must deliver clear value.

**Implementation:** Supabase Edge Functions + Web Push API (standard PWA push, no native app needed for demo).

### 5.5 Offline-First PWA Architecture

For hackathon demo and beyond:

```
Service Worker Strategy:
  - Cache-first for static assets (UI shell)
  - Network-first for real-time data (cravings, pins, chats)
  - Stale-while-revalidate for restaurant data (Places API results)
  - Background sync for queued actions (post craving, submit vibe-check when back online)

Offline Capabilities:
  - View previously loaded map area + pins
  - Draft cravings (saved locally, sent when online)
  - Read cached chat messages
  - View profile + reputation score
```

**Why PWA matters for hackathon:** Judges can open the URL on any device, no App Store needed. Works on laptop for projection during demo. Installable for "app-like" feel.

### 5.6 Accessibility & Allergen AI Detection

Building on Honeycomb's model but adapted for BlindBite's social context:

#### Allergen Detection Pipeline

```
Step 1: User sets dietary profile (onboarding + settings)
  - 29 allergens with severity (preference / intolerance / severe allergy)
  - 9 diet templates (vegan, keto, halal, kosher, etc.)
  - Combination support: "Nut-free + dairy-intolerant + pescatarian"

Step 2: AI scans pinned restaurant recommendations
  - Cross-reference restaurant menu data (from Places API / web scrape)
  - Flag dishes that match or might match user's restrictions
  - Severity gating: severe allergies = only show verified-safe restaurants

Step 3: Allergen badges on pin cards
  - ✅ "Safe for your diet" (green)
  - ⚠️ "Ask about nuts" (yellow, intolerance level)
  - ❌ "Contains shellfish -- skipped" (red, auto-filtered)

Step 4: Social allergen context
  - When group chatting, show overlapping safe options
  - "3 of 4 people can eat here -- Mike's nut allergy flagged 2 dishes"
```

**Reference implementation:** Honeycomb's system covers 25,000+ diet/allergen combinations across 2,500 cities. NearSpotty uses Gemini 3 for smart dietary scoring from review sentiment ("They modified my pasta for allergies" = high safety score). Chefeze implements 14 EU allergen categories with STOP/WARN/TIP alert levels.

**Hackathon minimum viable version:**
- Dietary profile settings page (checkboxes for common allergens)
- Simple keyword filter on restaurant cuisine type + menu keywords
- "Safe for you" / "Check carefully" badges on pin cards
- **Effort: 2-3 hours**

---

## 6. Competitive Landscape

### 6.1 Competitor Deep Dives

#### CORNER
| Attribute | Detail |
|-----------|--------|
| Founded | 2022 by Eliza Wu & Jake Xia |
| Funding | $3.8M raised |
| Users | 125K+ across 425 cities |
| Model | Social map curation (places generally, not just food) |
| Revenue | Unknown (likely pre-revenue, growth stage) |
| Strengths | Beautiful UX, strong Gen Z branding, App Store featuring, "no bots no ads" positioning |
| Weaknesses | No food-specific features, no chat/meetup mechanic, no AI beyond basic summaries |
| Threat to BlindBite | **Medium** -- could add food features, but BlindBite's social-chat-unlock is defensible |
| **BlindBite should COPY** | Aesthetic sensibility, list-as-identity, TikTok save import |
| **BlindBite should NOT copy** | General-purpose place focus (dilutes food positioning) |

#### BELI
| Attribute | Detail |
|-----------|--------|
| Founded | 2021 by Judy Thelen & Eliot Frost (HBS alumni) |
| Funding | Minimal (bootstrapped/organic growth) |
| Users | 80M+ global reviews, 60M+ ratings, 10% international |
| Model | Social restaurant ranking (Letterboxd for food) |
| Revenue | Unclear (exploring: ads, premium, influencer lists) |
| Strengths | Deep engagement from superusers (1000+ ratings each), strong word-of-mouth, OpenTable + TikTok/IG integrations, college campus penetration |
| Weaknesses | No meetup/chat feature, low-frequency engagement problem, elite-restaurant bias, ranking system forces awkward comparisons, slow restaurant database updates |
| Threat to BlindBite | **High** -- closest direct competitor, could add map-pins + chat |
| **BlindBite should COPY** | Gamification done right (streaks, leaderboards), taste similarity scoring, friend feed |
| **BlindBite should NOT copy** | Comparative ranking (forces apples-oranges comparisons), invite-gating features, elite-restaurant skew |

#### SEEMOR
| Attribute | Detail |
|-----------|--------|
| Model | AI-powered restaurant analysis (35 dimensions) |
| Coverage | 35 cities across 7 countries (London included) |
| Strengths | Deepest AI analysis of any competitor, "For You" personal fit score, review authenticity detection, compare mode |
| Weaknesses | No social features whatsoever, analysis-paralysis risk (too much data), US-centric |
| Threat to BlindBite | **Low** -- different product category (analysis tool vs social app) |
| Opportunity | Partner or integrate Seemor-style analysis INTO BlindBite pin cards |

#### MOODBITE / FORKI / FLAVRY / CRVYN / TASTEBUDDY
| App | Angle | Different from BlindBite |
|-----|-------|------------------------|
| MoodBite | Mood -> restaurant matching | No social, no map, no human recommendations |
| Forki | Mood + fridge -> recipes/restaurants | Recipe focus, no social graph |
| Flavry | TasteDNA emotional intelligence | Individual, not social |
| Crvyn | Photo/taste-based dish search | Dish-level, not social |
| TasteBuddy | Palate matching on any menu | Utility tool, no community |

**Collective threat: LOW.** These are all individual recommendation tools. None combine AI + map + social chat + community. BlindBite's multi-layer approach is unique.

#### HONEYCOMB / NEARSPOTTY
| App | Angle | Lesson for BlindBite |
|-----|-------|---------------------|
| Honeycomb | Allergen-safe restaurant finder | Prove allergen detection is a solvable, valuable problem |
| NearSpotty | Gemini 3 dietary scoring | AI can extract dietary safety from review sentiment |

**Threat: NONE.** These are complementary. BlindBite should implement allergen features as a layer, not as the main value prop.

### 6.2 What Makes BlindBite Unique

After mapping the entire competitive landscape, BlindBite's defensible uniqueness comes from **the combination** of 5 elements that no competitor has together:

```
BLINDBITE'S UNIQUE COMBO:

1. MAP-FIRST UI         (Corner has this, Beli doesn't)
2. SOCIAL PINS           (Both have social, but BlindBite pins = recommendations, not just saves)
3. AI ENRICHMENT         (Seemor has deeper AI, but no social context)
4. CHAT UNLOCK MECHANIC  (NOBODY has this -- it's the moat)
5. CRAVING-DRIVEN        (Everyone else is browse/search-driven)
```

**The "Chat Unlock" is the single most important differentiator.** No other food app lets you:
1. Post a need ("I'm hungry and indecisive")
2. Get help from real people + AI
3. Vibe-check the suggestion
4. Unlock a chat with the recommender
5. Potentially make a friend over food

This is Tinder for food, but with AI quality control and genuine social intent. That story resonates with judges and with Gen Z.

### 6.3 What BlindBite Should Explicitly NOT Do

| Temptation | Why Avoid | Alternative |
|-----------|-----------|-------------|
| Become a review platform | Yelp/Beli/Google saturated; review fatigue is real | Vibe-checks ARE micro-reviews, keep them casual |
| Star ratings | Commodity; psychologically biased toward 4 stars | Smart Match ranking (relative, contextual) |
| Broaden beyond food | Corner's general-place approach dilutes focus | Own "food + drink" deeply |
| Paywall social features | Beli got backlash for invite-gating | Monetize AI features and restaurant partnerships, never connections |
| Infinite scroll feed | Gen Z is actively rejecting addictive social design | Time-bounded craving windows, digest-format feeds |
| Elite/restaurant bias | Beli criticism: "unmerited buzz," excludes authentic local spots | Algorithmic diversity boost for under-discovered gems |

---

## 7. Hackathon-Specific Quick Wins

### 7.1 VibeHack London 2026 Context

From the official event page:
- **Duration:** 24 hours to build and ship
- **Requirement:** Demo a **live working AI product** -- no slides, no concept-only pitches
- **Judging criteria:** Creativity, execution, usability, technical skill, real-world potential
- **Track 2:** "Vibe with Zymix" -- implies emphasis on AI integration, user experience, and social/vibe elements

### 7.2 Features Addable in 2-4 Hours (Ranked by Judge Wow Factor)

#### #1: Voice Craving Input (2-3 hours)

**Wow factor:** 9/10 -- judges see someone speak naturally and the app understands

**What to build:**
1. Add microphone button to craving composer (30 min)
2. Integrate Web Speech API for speech-to-text (1 hr)
3. Pipe transcript into existing GLM-4 craving parser (30 min)
4. Add waveform animation while recording (30 min)
5. Show "BlindBite heard: [transcript]" confirmation (15 min)

**Demo line:** "Instead of typing filters, I just say what I want..."

**Risk:** Microphone permissions in browser demo environment. **Mitigation:** Have text fallback ready; test audio beforehand.

#### #2: AI Decision Assistant / "Debate Mode" (3-4 hours)

**Wow factor:** 9/10 -- shows AI doing something genuinely useful (decision-making), not just generating text

**What to build:**
1. "Help me choose" button on craving with 3+ pins (15 min)
2. Modal with side-by-side pin cards (1 hr)
3. LLM prompt engineering for comparison logic (1 hr)
4. Streaming token-by-token response display (1 hr)
5. One follow-up question then final recommendation (30 min)

**Demo line:** "I can't decide between these 4 spots. Let me ask BlindBite to debate them with me..."

**Risk:** LLM latency during demo. **Mitigation:** Pre-warm the API call; have cached response as fallback; show loading animation with fun facts about the restaurants.

#### #3: Conversational Craving Parser (2 hours)

**Wow factor:** 7/10 -- elegant, reduces friction, shows NL understanding

**What to build:**
1. Text input field replacing/supplementing form fields (30 min)
2. GLM-4 call with structured JSON output schema (1 hr)
3. Preview panel showing extracted fields (30 min)

**Demo line:** "I don't need to fill out a form. I just type like I'm texting a friend..."

**Risk:** LLM extracts wrong fields. **Mitigation:** Show preview with edit capability; handle graceful fallback to manual form.

#### #4: Recommender Reputation Display (1-2 hours)

**Wow factor:** 6/10 -- subtle but shows product thinking

**What to build:**
1. Calculate simple acceptance-rate score from existing data (30 min)
2. Add reputation badge to pin cards and user profiles (1 hr)
3. Show "loved-it rate" percentage (30 min)

**Demo line:** "Every recommender builds a reputation -- Sarah's pins have a 94% acceptance rate..."

**Risk:** No historical data in fresh demo. **Mitigation:** Seed with realistic demo data; explain it's calculated from vibe-check outcomes.

#### #5: Taste Twin Badges (2-3 hours)

**Wow factor:** 8/10 -- emotionally resonant ("someone out there loves the same food you do")

**What to build:**
1. Simple cosine similarity on cuisine tags (1 hr)
2. "Taste Twin" badge on matching recommenders' pins (1 hr)
3. Match percentage display (30 min)

**Demo line:** "BlindBite found my Taste Twins -- people who love the same food I do. Their recommendations are worth 3x more to me..."

**Risk:** Not enough users for real matching in demo. **Mitigation:** Pre-populate with demo accounts that have varied taste profiles; show the matching algorithm working between them.

#### #6: Google Places AI Summaries Integration (1-2 hours)

**Wow factor:** 7/10 -- shows integration with Google's latest AI capabilities

**What to build:**
1. Call Places API (New) with AI summary fields enabled (1 hr)
2. Display AI-generated vibe/summary on pin cards (30 min)
3. Combine with BlindBite's social context (30 min)

**Demo line:** "We use Google's Gemini summaries as a baseline, then layer in what your friends actually think..."

**Risk:** API key setup, billing concerns. **Mitigation:** Use free tier for demo; cache responses.

### 7.3 The Ultimate Demo Script (Recommended Flow)

Here is the exact demo flow we recommend for judges, designed to hit all judging criteria:

```
PHASE 1: THE PROBLEM (30 seconds)
--------------------------------------------------
"I'm new to London and I want authentic food experiences,
 not tourist traps. But Google shows me the same 10 places
 everyone visits, and Yelp reviews are written by strangers
 who hate everything. I want recommendations from REAL people
 who actually know food -- and maybe make a friend along the way."

PHASE 2: THE CRAVING (45 seconds)
--------------------------------------------------
[Opens BlindBite map of Shoreditch]

"Let me post a craving."
[Taps '+' button]
[Speaks into mic]: "I want something spicy, maybe Middle Eastern
 or Turkish, under 15 pounds, kind of cozy vibe, I'm by myself
 so nothing too fancy"

[Screen shows]: "Got it: Spicy Middle Eastern, <GBP15, cozy, solo dining"
[Pin drops on map]: "My craving is now live. Anyone nearby can see it
 and drop a pin with their recommendation."

PHASE 3: THE AI CO-RECOMMENDER (30 seconds)
--------------------------------------------------
"But I don't have to wait. BlindBite's AI already found 3 spots
 that match my craving."
[3 AI-generated pins appear with photos + vibe summaries]
"These aren't generic recommendations. Each pin has an AI-generated
 vibe summary, dish photos, and tags -- all powered by GLM-4."

PHASE 4: HUMAN RECOMMENDATIONS ARRIVE (30 seconds)
--------------------------------------------------
"And look -- 2 real people just pinned their suggestions."
[Human pins appear with recommender names + reputation scores]
"Sarah has a 94% loved-it rate. And this green badge means she's
 my Taste Twin -- we have 89% similar palates. Her recommendation
 carries more weight for me."

PHASE 5: THE DECISION ASSISTANT (60 seconds)
--------------------------------------------------
"Now I have 5 options and I can't decide. Let me ask BlindBite."
[Taps "Help me choose"]

[AI Assistant modal opens, streams response]:
"OK, let's break this down. You said cozy + spicy + under 15 pounds.
 
 Dishoom hits the vibe perfectly -- lively but not loud, their black
 daal is legendary, and it's within budget. BUT it'll be a 40-min wait.
 
 Anteplar is your Taste Twin Sarah's top pick -- smaller, cozier,
 incredible lamb kebabs, and she says the owner remembers regulars.
 
 If you want to actually TALK to someone new today, I'd go with Anteplar
 and vibe-check Sarah's rec. Worst case, you discovered a great spot.
 Best case, you made a friend who knows food.

 Quick question -- do you care more about the BEST food or the
 coziest atmosphere?"

[Presenter types]: "Best food"
[AI responds]: "Then Dishoom for the black daal. But honestly? Go with
 Sarah's pick. The combination of great food + meeting your Taste Twin
 is worth more than the marginal food quality difference. And I looked
 at her past 20 recommendations -- 18 were hits."

PHASE 6: VIBE CHECK + CHAT UNLOCK (30 seconds)
--------------------------------------------------
"Great, let me go with Sarah's pick. I'll send her a vibe-check."
[Taps "Vibe Check" on Sarah's pin]
[Types]: "This looks amazing! Is it actually cozy or just cramped?"
[Sarah responds in real-time]: "Honestly it's tiny but magical.
 Grab the corner table and order the burnt eggplant too. Trust me."
[I tap "Confirmed -- this looks perfect!"]

[Chat unlocks]: "And just like that, we're chatting. BlindBite even
 generated an icebreaker for us -- something about both loving spicy
 food but hating cilantro debates."

PHASE 7: THE BIGGER PICTURE (30 seconds)
--------------------------------------------------
"What you just saw is the full loop:
 1. Voice craving with AI understanding
 2. Human + AI hybrid recommendations
 3. Taste Twin matching for trust weighting
 4. AI Decision Assistant when you're stuck
 5. Vibe-check quality gate before chat
 6. AI icebreaker to kickstart the friendship

 BlindBite isn't another review app. It's where cravings become
 connections. Every pin is a potential friend. Every meal is a
 story waiting to happen."

PHASE 8: TECH SUMMARY (15 seconds)
--------------------------------------------------
"Built with: Supabase for real-time data + PostGIS for spatial queries,
 Google Places API for restaurant data, GLM-4 for all AI layers
 with Claude as fallback, React + Mapbox for the frontend,
 and it's a PWA so it works everywhere -- no app store needed."
```

**Total demo time: ~5 minutes. Covers all judging criteria. Tells a memorable story.**

### 7.4 What Makes BlindBite Feel "Zymix Native"

For Track 2 "Vibe with Zymix," judges will look for:

| Zymix-Native Quality | How BlindBite Demonstrates It |
|---------------------|------------------------------|
| **AI is essential, not decorative** | Every screen uses AI. Without AI, the product literally doesn't work (no pin enrichment, no matching, no icebreaker, no decision assistant) |
| **AI feels like a character** | The Decision Assistant has personality. Icebreakers are conversational. Vibe summaries have voice |
| **Multimodal AI** | Voice input (speech-to-text), image generation (dish photos), text understanding (craving parsing), sentiment analysis (vibe checks) |
| **Real-time + social** | Supabase Realtime for live pin drops, live chat, live presence |
| **Works in the real world** | Uses real London restaurant data, real maps, solves a real problem (lonely dining in a new city) |
| **Gen Z native** | Casual tone, no star ratings, map-first mobile UX, voice over typing, social but not addictive |

---

## 8. Prioritized Roadmap

### 8.1 Pre-Hackathon (Before 6 June)

| Task | Status | Notes |
|------|--------|-------|
| Core map + craving flow | Done | Existing v2 architecture |
| Pin enrichment (GLM-Image + GLM-4) | Done | Existing AI layers 1-4 |
| Supabase + PostGIS backend | Done | Existing infrastructure |
| Google Places API integration | **DO THIS** | Replace/add to current restaurant data source |
| Seed London restaurant data | **DO THIS** | Need real data for compelling demo |
| Create 5-10 demo accounts with varied profiles | **DO THIS** | Need data for taste twin + reputation demos |

### 8.2 During Hackathon (6-7 June 2026)

#### Must-Have (do these first, in order)

| # | Feature | Effort | Wow Factor | Dependency |
|---|---------|--------|------------|------------|
| 1 | Conversational craving parser | 2 hrs | 7/10 | GLM-4 API |
| 2 | Voice craving (Web Speech API) | 2-3 hrs | 9/10 | #1 complete |
| 3 | Recommender reputation display | 1-2 hrs | 6/10 | Existing vibe-check data |
| 4 | Taste Twin badges (basic) | 2-3 hrs | 8/10 | User profile data |
| 5 | AI Decision Assistant ("Debate Mode") | 3-4 hrs | 9/10 | #1 complete |
| 6 | Google Places AI summaries on pins | 1-2 hrs | 7/10 | Places API key |
| 7 | Demo data seeding + polish | 2 hrs | Critical | All above |

#### Nice-to-Have (if time permits)

| # | Feature | Effort | Wow Factor |
|---|---------|--------|------------|
| 8 | Allergen safety badges | 2-3 hrs | 6/10 |
| 9 | Friend-of-friend connection labels | 1 hr | 5/10 |
| 10 | Time-limited craving window ("craving party") | 1 hr | 6/10 |
| 11 | Push notification mockup | 1 hr | 4/10 |
| 12 | PWA install + offline shell | 1 hr | 5/10 |

### 8.3 Post-Hackathon (Next 3 Months)

| Month | Features |
|-------|----------|
| **Month 1** | Visual/photo craving (vision model); Taste Circle grouping; Community feed launch; Basic analytics dashboard |
| **Month 2** | Sponsored pins MVP (manual, 5 restaurant partners); BlindBite+ premium beta; Resy/OpenTable reservation deep-links; iOS/Android wrapper (Capacitor or Expo) |
| **Month 3** | Group ordering integration (Uber Eats/Deliveroo API); B2B restaurant dashboard MVP; Expanded city coverage (Manchester, Bristol, Birmingham); Influencer/on-campus ambassador program |

### 8.4 Success Metrics for Hackathon

| Metric | Target | How Measured |
|--------|--------|-------------|
| Demo completes without errors | 100% | Smooth run-through |
| Judges ask follow-up questions | 3+ | Engagement indicator |
| AI response time (perceived) | <3 seconds | Demo pacing |
| Story memorability | Judge can re-tell it in 1 sentence | Qualitative |
| "I'd use this" nods | From 3+ judges | Product-market fit signal |
| Tech diversity visible | 4+ AI models demonstrated | Innovation criterion |

---

## Appendix A: Competitive Feature Matrix

| Feature | BlindBite | Corner | Beli | Seemor | MoodBite | Honeycomb | Yumi |
|---------|-----------|--------|------|--------|----------|----------|------|
| Map-first UI | YES | YES | YES | NO | NO | NO | NO |
| Social pins/recs | YES | YES (save) | YES (rank) | NO | NO | NO | YES |
| AI enrichment | YES | YES (summary) | NO | YES (deep) | YES (mood) | YES (dietary) | YES (taste) |
| Chat/unlock mechanic | **UNIQUE** | NO | NO | NO | NO | NO | NO (chat) |
| Voice input | Planned | NO | NO | NO | NO | NO | YES |
| Taste matching | Planned | Implicit | YES (score) | NO | NO | NO | YES |
| Reputation system | Planned | NO | NO | NO | NO | NO | NO |
| Dietary/allergen | Planned | NO | Tags only | NO | Filters | **DEEP** | Filters |
| Decision assistant | Planned | NO | NO | **Compare** | NO | NO | NO |
| Photo-based search | Planned | NO | NO | NO | NO | NO | NO |
| Co-recommender (AI fills gaps) | **YES** | NO | NO | NO | NO | NO | YES |
| Real-time | YES (Supabase) | Unknown | Unknown | NO | NO | NO | NO |
| Monetization clear | Roadmap | Unclear | Exploring | Unclear | Subscriptions | Lifetime | None |

## Appendix B: API Cost Estimates for Hackathon Demo

| Service | Free Tier | Hackathon Usage | Est. Cost |
|---------|-----------|-----------------|-----------|
| Google Places API (New) | $200/mo credit | ~500 calls (seed + demo) | $0 |
| GLM-4 (Zhipu) | Varies | ~100 calls (enrichment + parsing + assistant) | ~$1-5 |
| Claude (fallback) | Varies | ~20 calls | ~$1-3 |
| Supabase Free | Generous | Realtime + DB + Auth + Storage | $0 |
| Mapbox GL JS | 50K map loads/mo | ~100 loads | $0 |
| **Total** | | | **~$2-8** |

## Appendix C: Sources

- Corner: https://www.corner.inc/ | https://apps.apple.com/us/app/corner-curate-share-places/id1668282277
- Beli: https://beliapp.com/ | https://en.wikipedia.org/wiki/Beli_(app) | https://tastecooking.com/beli-invites-the-loneliest-generation-to-dine-out/
- Stanford Daily Beli review: https://stanforddaily.com/2026/01/20/from-one-beli-to-another-bringing-the-social-aspect-back-to-eating-out/
- Beli StartupSignals analysis: https://startupsignals.substack.com/p/beli-your-food-diary-and-dining-advisor
- AOL Beli feature: https://www.aol.com/beli-app-turning-dining-competitive-165033302.html
- WNUR Beli coverage: https://wnurnews.org/beli-ache-students-find-community-through-logging-restaurants-on-social-media-platform/
- Seemor: https://www.seemor.ai/
- Bonapi: https://bonapi.app/
- MoodBite: https://moodbite.ai/
- Forki: https://www.forki.ai/
- Crvyn: https://crvynai.com/
- TasteBuddy: https://tastebuddy.co/
- Flavry: https://flavry.co.uk/
- Honeycomb: https://get.honeycomb.ai/
- Menami: https://github.com/Menami-AI/menami
- NearSpotty: https://nearspotty.sk/
- Google Places API (New): https://developers.google.com/maps/documentation/places/web-service/op-overview
- Yelp Fusion API: https://docs.developer.yelp.com/docs/places-intro
- Multi-platform restaurant stack: https://godberrystudios.com/posts/multi-platform-restaurant-intelligence-stack-2026/
- Places API alternatives comparison: https://dev.to/geoapify-maps-api/google-places-api-alternatives-which-poi-api-should-you-use-in-2026-hd4
- VibeHack London 2026: https://studentsunionucl.org/whats-on/events-activities/vibehack-london-2026-0
- Hackathon winning guide: https://medium.com/@sinceai/how-to-win-an-ai-hackathon-9a1a2841c968
- Yumi (HackHarvard 3rd place): https://devpost.com/software/yumi | https://github.com/scrappydevs/Yummy
- MadisonBites (hackathon): https://github.com/pallavisharma6802/PepperHack
- Chefeze (hackathon): https://devpost.com/software/chefeze
- Food delivery monetization: https://www.ongraph.com/monetization-models-for-food-delivery-apps/

---

*Report prepared for BlindBite v2 team -- VibeHack London 2026. Good luck, and remember: judges want to see something that works, tells a clear story, and makes them say "I'd actually use this."*
