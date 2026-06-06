"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  prefix?: string;
};

export const AuthInput = forwardRef<HTMLInputElement, Props>(
  ({ label, prefix, className = "", ...rest }, ref) => {
    return (
      <label className="flex flex-col gap-1.5">
        <span
          className="text-[11px] italic text-[var(--ink-soft)]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {label}
        </span>
        <div className="flex items-center gap-1 border-b border-[var(--ink)]/25 pb-2 focus-within:border-[var(--ink)]">
          {prefix && (
            <span className="text-base text-[var(--ink)]/60">{prefix}</span>
          )}
          <input
            ref={ref}
            {...rest}
            className={`w-full bg-transparent text-base text-[var(--ink)] outline-none placeholder:text-[var(--ink-soft)]/60 ${className}`}
          />
        </div>
      </label>
    );
  },
);
AuthInput.displayName = "AuthInput";