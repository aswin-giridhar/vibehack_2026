# BlindBite — Product Gap Analysis

> Generated during VibeHack London 2026 integration sprint

## Executive Summary

BlindBite has a polished, beautiful frontend and a working backend with AI enrichment. However, several critical gaps exist that affect demo-ability, user experience completeness, and judge perception. This document ranks gaps by impact and suggests prioritization for the remaining hackathon time.

---

## 🔴 Critical Gaps (Must Fix for Demo)

### Gap 1: Geolocation is Fake

**Status:** All cravings and searches use hardcoded `51.5074, -0.1278` (London center). The app never asks for the user's real location.

**Files affected:**
- `src/lib/user.ts` — `DEFAULT_LOCATION` hardcoded
- `src/lib/api.ts` — `postCraving()` and `getNearbyCravings()` use hardcoded coords

**Impact:** Judges will notice immediately. A food discovery app that doesn't know where you are feels like a mockup, not a product.

**Effort:** ~30 min — Use the browser Geolocation API with a fallback to London center.

---

### Gap 2: Recommendations Use Mock Data Only

**Status:** The `RecommendForm` only shows 6 hardcoded restaurants from `src/lib/mock-restaurants.ts`. There's no real restaurant search — no Google Places, no Yelp, no Foursquare.

**Files affected:**
- `src/components/recommendation/RecommendForm.tsx` — renders `MOCK_RESTAURANTS`
- `src/lib/mock-restaurants.ts` — 6 static entries

**Impact:** The core loop (craving → recommendation) feels fake. Judges can't recommend a real place they know.

**Effort:** ~1-2 hrs — Integrate Google Places Autocomplete API or similar.

---

### Gap 3: No Notification / Feedback Loop

**Status:** After posting a craving, the user waits with no visual feedback. There's no toast, no push notification, no inline indicator that AI is working or that someone recommended something. Polling happens every 2s but there's no visual cue when new recommendations appear.

**Files affected:**
- `src/components/recommendation/EnrichedCard.tsx` — no "new" badge
- `src/app/page.tsx` — no toast for incoming recommendations
- No toast/notification component exists

**Impact:** The core loop feels dead. Users don't know when to check back.

**Effort:** ~30 min — Add a simple toast component + "new recommendation" indicator.

---

### Gap 4: Chat Has No Optimistic UI

**Status:** Messages poll every 1.5s but sent messages don't appear until the next poll cycle. No optimistic updates, no typing indicators, no read receipts. The `sender_name` resolution is unreliable (depends on cravings table having a matching user_id).

**Files affected:**
- `src/components/chat/ChatView.tsx` — no optimistic message rendering
- `src/hooks/useBlindbite.ts` — `useMessages` polls every 1500ms
- `src/app/api/chat/[chatId]/messages/route.ts` — sender_name enrichment depends on secondary lookup

**Impact:** Chat feels sluggish. Sent messages "disappear" for up to 1.5 seconds before appearing.

**Effort:** ~20 min — Add optimistic message rendering in `ChatView`.

---

### Gap 5: AI Co-Recommend is Fragile

**Status:** The `/api/ai/co-recommend` endpoint exists but frequently falls back to demo data. GLM-4 image generation often times out, leaving recommendations with no images. The enrichment pipeline has multiple failure points.

**Files affected:**
- `src/app/api/ai/co-recommend/route.ts` — AI orchestration
- `src/app/api/recommendations/route.ts` — AI enrichment best-effort
- `src/lib/ai.ts` — `callAI()`, `callGLMImage()` wrappers

**Impact:** When AI works, it's magical. When it fails, users get bare recommendations with no vibe summary or image.

**Effort:** ~1 hr — Add better fallback images (Unsplash/placeholder), more resilient retry logic, and a loading state for in-progress enrichment.

---

### Gap 6: No Onboarding / Empty State

**Status:** A new user lands on the home page and sees nothing — no cravings, no recommendations, no tutorial, no suggested actions. The "nearby cravings" feed is empty until someone seeds data. The `/api/seed` route exists but isn't called automatically.

**Files affected:**
- `src/app/page.tsx` — no empty state UI
- `src/app/api/seed/route.ts` — exists but not auto-triggered
- `src/app/cravings/page.tsx` — empty map with no pins

**Impact:** First-time users (including judges) see a blank screen and don't know what to do.

**Effort:** ~15 min — Auto-seed on first visit + add empty-state illustrations with call-to-action.

---

### Gap 7: Auth is localStorage-Only

**Status:** No Supabase Auth integration. Sign up stores credentials in `localStorage` with base64 "encryption." The backend routes accept any `userId` — there's no session validation. A judge could impersonate any user by sending any user ID.

**Files affected:**
- `src/lib/auth.ts` — full mock auth implementation
- All API routes — accept `userId` as plain parameter
- `src/lib/user.ts` — mutable singleton, no server-side validation

**Impact:** Not a blocker for demo, but judges may note the security gap. In a real app, this is critical.

**Effort:** ~2-3 hrs for full Supabase Auth — probably not worth it for the hackathon. Consider a quick middleware check instead.

---

## 🟡 High-Priority Gaps (Should Fix)

### Gap 8: No Search / Browse Functionality

There's no way to search for restaurants, users, or cravings. The only discovery mechanism is the map view, which shows active cravings nearby. No text search, no category filtering, no sorting.

### Gap 9: No Dietary Preferences or Allergies

Users can't specify dietary restrictions (vegetarian, halal, gluten-free, etc.). AI recommendations don't consider dietary needs. This is a safety and UX issue for a food app.

### Gap 10: No Social Graph

There's no way to find friends, follow users, or see recommendations from people you know. The app relies on proximity only — there's no social layer beyond chat.

### Gap 11: No Review / Rating System

After a "vibe check," there's no way to leave a detailed review or rating. The binary loved-it/not-for-me is too coarse. No way to see what others thought of a spot.

---

## 🟢 Nice-to-Have Gaps (Polish)

### Gap 12: No Photo Upload / Carousel
Users can't upload their own food photos. Recommendations only have AI-generated images (when they work). No photo gallery or carousel component.

### Gap 13: No Collections / Saved Places
No way to bookmark a restaurant, create a wishlist, or organize saved spots into lists.

### Gap 14: No Activity Feed
No timeline showing what friends are craving, recommending, or reviewing. The home page is isolated.

### Gap 15: No Price Information
No price range for restaurants. No budget filtering for cravings.

### Gap 16: No Wait Time / Availability
No indication of whether a place is open, how busy it is, or estimated wait times.

---

## 📊 Prioritization Matrix

| Priority | Gap | Effort | Impact | Recommendation |
|----------|-----|--------|--------|----------------|
| **1** | Real geolocation | 30 min | ⭐⭐⭐⭐⭐ | **Do now** — transforms demo |
| **2** | Auto-seed / empty state | 15 min | ⭐⭐⭐⭐⭐ | **Do now** — no blank screens |
| **3** | Toast for new recs | 30 min | ⭐⭐⭐⭐ | **Do now** — loop feels alive |
| **4** | Optimistic chat | 20 min | ⭐⭐⭐⭐ | Quick win for chat UX |
| **5** | Better AI fallbacks | 1 hr | ⭐⭐⭐ | Worth it if time permits |
| **6** | Google Places search | 1-2 hrs | ⭐⭐⭐⭐⭐ | Biggest "wow" but most effort |
| **7** | Auth hardening | 2-3 hrs | ⭐⭐ | Skip for hackathon |

---

## 🎯 Judge Perception

### Judges will say "WOW" to:
- AI-powered taste matching that actually works
- Real-time social map with live craving pins
- Smart icebreakers generated from shared food interests
- Photo-first restaurant discovery with AI descriptions
- Real geolocation making it feel like a real product

### Judges will say "MEH" to:
- Hardcoded coordinates and mock restaurants
- Empty screens on first visit
- Chat that feels sluggish
- AI features that fail silently
- No visual feedback after key actions

---

## Conclusion

BlindBite's core vision is strong — social food discovery powered by AI. The UI is beautiful and the architecture is clean. The critical path to a winning demo is: **make the core loop feel real** (geolocation + real restaurants + feedback) and **make it feel alive** (notifications + optimistic UI + auto-seed). These are achievable within the remaining hackathon time.
