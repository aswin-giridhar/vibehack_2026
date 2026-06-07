// Mock-first auth. Swappable to Lovable Cloud later (one file).
// Stores accounts in localStorage. Password is base64-only — DEMO ONLY.

import { useSyncExternalStore } from "react";
import { CURRENT_USER } from "./user";

export type AuthUser = {
  id: string;
  handle: string; // lowercase, unique
  avatarUrl: string | null;
  createdAt: string;
};

type StoredAccount = AuthUser & { passhash: string };

const ACCOUNTS_KEY = "blindbite:accounts";
const SESSION_KEY = "blindbite:session";

const listeners = new Set<() => void>();
let cachedUser: AuthUser | null = null;
let hydrated = false;

function emit() {
  listeners.forEach((l) => l());
}

function readAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeAccounts(a: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a));
}

function readSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function applyToCurrentUser(u: AuthUser | null) {
  if (u) {
    CURRENT_USER.id = u.id;
    CURRENT_USER.name = u.handle;
    CURRENT_USER.avatar = "🦋";
    CURRENT_USER.avatarUrl = u.avatarUrl;
  } else {
    CURRENT_USER.id = "guest";
    CURRENT_USER.name = "you";
    CURRENT_USER.avatar = "🦋";
    CURRENT_USER.avatarUrl = null;
  }
}

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  cachedUser = readSession();
  applyToCurrentUser(cachedUser);
}

function setSession(u: AuthUser | null) {
  cachedUser = u;
  if (typeof window !== "undefined") {
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(SESSION_KEY);
  }
  applyToCurrentUser(u);
  emit();
}

const HANDLE_RE = /^[a-z0-9_]{2,20}$/;

export function validateHandle(handle: string): string | null {
  if (!HANDLE_RE.test(handle))
    return "lowercase letters, numbers, underscore. 2–20 chars.";
  return null;
}

export async function signUp(input: { handle: string; password: string }) {
  const handle = input.handle.trim().toLowerCase().replace(/^@/, "");
  const err = validateHandle(handle);
  if (err) throw new Error(err);
  if (input.password.length < 4) throw new Error("password's too short (4+).");
  const accounts = readAccounts();
  if (accounts.some((a) => a.handle === handle))
    throw new Error("that handle's taken. try another.");
  const acct: StoredAccount = {
    id: crypto.randomUUID(),
    handle,
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    passhash: btoa(input.password),
  };
  writeAccounts([...accounts, acct]);
  const { passhash, ...user } = acct;
  void passhash;
  setSession(user);
  return user;
}

export async function signIn(input: { handle: string; password: string }) {
  const handle = input.handle.trim().toLowerCase().replace(/^@/, "");
  const accounts = readAccounts();
  const acct = accounts.find((a) => a.handle === handle);
  if (!acct || acct.passhash !== btoa(input.password))
    throw new Error("no match. check the handle and the secret.");
  const { passhash, ...user } = acct;
  void passhash;
  setSession(user);
  return user;
}

export function signOut() {
  setSession(null);
}

export function updateProfile(patch: Partial<Pick<AuthUser, "avatarUrl" | "handle">>) {
  if (!cachedUser) return;
  const accounts = readAccounts();
  const idx = accounts.findIndex((a) => a.id === cachedUser!.id);
  if (idx < 0) return;
  if (patch.handle) {
    const h = patch.handle.trim().toLowerCase().replace(/^@/, "");
    const err = validateHandle(h);
    if (err) throw new Error(err);
    if (accounts.some((a) => a.handle === h && a.id !== cachedUser!.id))
      throw new Error("that handle's taken.");
    patch.handle = h;
  }
  accounts[idx] = { ...accounts[idx], ...patch };
  writeAccounts(accounts);
  const { passhash, ...user } = accounts[idx];
  void passhash;
  setSession(user);
}

function subscribe(cb: () => void) {
  hydrate();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): AuthUser | null {
  hydrate();
  return cachedUser;
}

function getServerSnapshot(): AuthUser | null {
  return null;
}

export function useAuth() {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { user, signIn, signUp, signOut, updateProfile };
}