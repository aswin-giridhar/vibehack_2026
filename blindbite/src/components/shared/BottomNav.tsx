"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Sparkles, MessageCircle, User } from "lucide-react";
import { useAuth } from "../../lib/auth";

const items = [
  { to: "/", label: "home", icon: Home },
  { to: "/map", label: "map", icon: Map },
  { to: "/cravings", label: "cravings", icon: Sparkles },
  { to: "/chat/requests", label: "chats", icon: MessageCircle },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (pathname === "/auth") return null;

  return (
    <nav className="fixed bottom-3 left-1/2 z-[1000] -translate-x-1/2">
      <ul className="flex items-center gap-1 rounded-full bg-[oklch(0.16_0_0)] px-2 py-2 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.35)]">
        {items.map(({ to, label, icon: Icon }) => {
          const active =
            to === "/"
              ? pathname === "/"
              : pathname === to || pathname.startsWith(to + "/");
          return (
            <li key={to}>
              <Link
                href={to}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-all ${
                  active
                    ? "bg-[var(--lime)] text-[var(--ink)]"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            href={user ? "/profile" : "/auth"}
            className={`flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-medium transition-all ${
              pathname === "/profile"
                ? "bg-[var(--lime)] text-[var(--ink)]"
                : "text-white/70 hover:text-white"
            }`}
            aria-label="you"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                <User className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            )}
          </Link>
        </li>
      </ul>
    </nav>
  );
}