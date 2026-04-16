"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

type Variant = "primary" | "danger" | "ghost";

type Props = Omit<React.ComponentProps<"button">, "type"> & {
  variant?: Variant;
  pendingLabel?: string;
};

export function FormPendingButton({
  variant = "primary",
  pendingLabel = "Enviando…",
  className = "",
  disabled,
  children,
  ...rest
}: Props) {
  const { pending } = useFormStatus();
  const isDisabled = pending || Boolean(disabled);

  if (variant === "primary") {
    return (
      <button
        type="submit"
        disabled={isDisabled}
        aria-busy={pending}
        className={`btn-primary disabled:opacity-55 disabled:cursor-not-allowed ${className}`}
        {...rest}
      >
        {pending ? (
          <span className="flex items-center gap-2">
            <span
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0"
              aria-hidden
            />
            {pendingLabel}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }

  const styles =
    variant === "danger"
      ? "min-h-11 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-error)] hover:opacity-95"
      : "min-h-11 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] border border-[var(--color-border)]";

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-busy={pending}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer ${styles} ${className}`}
      {...rest}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <span
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0"
            aria-hidden
          />
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
