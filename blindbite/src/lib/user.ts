// Mutable singleton — kept in sync by the auth store (src/lib/auth.ts).
// Components & the api shim import this directly; mutating its properties
// (not the reference) means new cravings/recs/messages always attribute
// to whoever is currently signed in.
export const CURRENT_USER: {
  id: string;
  name: string;
  avatar: string;
  avatarUrl: string | null;
} = {
  id: "guest",
  name: "you",
  avatar: "🦋",
  avatarUrl: null,
};

// London center as the demo fallback location
export const DEFAULT_LOCATION = {
  latitude: 51.5074,
  longitude: -0.1278,
};