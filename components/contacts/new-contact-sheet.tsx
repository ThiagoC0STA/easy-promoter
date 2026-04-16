"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { ContactForm } from "@/components/contacts/contact-form";

const NEW_PARAM = "novo";

function isSheetOpen(params: URLSearchParams): boolean {
  const v = params.get(NEW_PARAM);
  return v === "1" || v === "true";
}

export function NewContactSheet() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const open = isSheetOpen(searchParams);

  const actionError = React.useMemo(() => {
    const raw = searchParams.get("error");
    if (!raw || typeof raw !== "string") return null;
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }, [searchParams]);

  const close = React.useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(NEW_PARAM);
    next.delete("error");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default border-0 bg-[color-mix(in_srgb,#0f172a_48%,transparent)] p-0 transition-opacity dark:bg-[color-mix(in_srgb,#000_58%,transparent)]"
        onClick={close}
        aria-label="Fechar painel de novo contato"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-contact-sheet-title"
        className="ep-sheet-panel relative z-10 flex h-[100dvh] w-full max-w-2xl flex-col border-l border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-md)]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
          <div className="min-w-0 pr-2">
            <h2
              id="new-contact-sheet-title"
              className="text-lg font-bold tracking-tight text-[var(--color-text-primary)]"
            >
              Novo contato
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)] leading-snug">
              Preencha o que souber. Você pode editar depois.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-transparent text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            aria-label="Fechar"
          >
            <X size={20} strokeWidth={1.5} aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
          <ContactForm layout="sheet" actionError={actionError} />
        </div>
      </aside>
    </div>
  );
}
