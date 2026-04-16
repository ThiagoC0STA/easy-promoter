"use client";

import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, X } from "lucide-react";

type Props = {
  message: string;
};

/**
 * Shows a server-action error passed via ?error= and clears the query on dismiss.
 */
export function ActionErrorBanner({ message }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function dismiss() {
    router.replace(pathname);
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-3 p-4 rounded-xl mb-6 border border-[color-mix(in_srgb,var(--color-error)_28%,var(--color-border))]
             bg-[color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))]"
    >
      <AlertCircle
        size={20}
        strokeWidth={1.5}
        className="text-[var(--color-error)] shrink-0 mt-0.5"
        aria-hidden
      />
      <p className="text-sm text-[var(--color-text-primary)] leading-relaxed flex-1 min-w-0">
        {message}
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 min-w-10 min-h-10 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)]
                   hover:text-[var(--color-text-primary)] hover:bg-[color-mix(in_srgb,var(--color-text-primary)_6%,transparent)]
                   transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                   focus-visible:outline-[var(--color-accent)]"
        aria-label="Fechar aviso"
      >
        <X size={18} strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}
