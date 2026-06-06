"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";

export function AvatarUploader({
  avatarUrl,
  handle,
  onChange,
  size = 132,
}: {
  avatarUrl: string | null;
  handle: string;
  onChange: (dataUrl: string) => void;
  size?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.readAsDataURL(f);
  }

  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      className="group relative rounded-full"
      style={{ width: size, height: size }}
      aria-label="change photo"
    >
      <div
        className="overflow-hidden rounded-full bg-[var(--cream)] ring-4 ring-[var(--ink)] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.4)]"
        style={{ width: size, height: size }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={handle}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display)", fontSize: size * 0.42 }}
          >
            {handle.slice(0, 1)}
          </div>
        )}
      </div>
      <span className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--ink)] shadow-md transition group-hover:scale-105">
        <Camera className="h-4 w-4" strokeWidth={2.2} />
      </span>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        onChange={onFile}
        className="hidden"
      />
    </button>
  );
}