"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import type { Contact } from "@/lib/contacts/types";
import { fetchContactByIdAction } from "@/lib/contacts/actions";
import { ContactForm } from "@/components/contacts/contact-form";

const EDIT_PARAM = "edit";

export function EditContactSheet() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const editId = searchParams.get(EDIT_PARAM);
  const open = Boolean(editId);

  const [contact, setContact] = React.useState<Contact | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  const actionError = React.useMemo(() => {
    const raw = searchParams.get("error");
    if (!raw) return null;
    try { return decodeURIComponent(raw); } catch { return raw; }
  }, [searchParams]);

  const close = React.useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(EDIT_PARAM);
    next.delete("error");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  React.useEffect(() => {
    if (!editId) {
      setContact(null);
      setFetchError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    fetchContactByIdAction(editId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setContact(result.contact);
      } else {
        setFetchError(result.message);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [editId]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
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
        aria-label="Fechar painel de edição"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-contact-sheet-title"
        className="ep-sheet-panel relative z-10 flex h-[100dvh] w-full max-w-2xl flex-col border-l border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-md)]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
          <div className="min-w-0 pr-2">
            <h2
              id="edit-contact-sheet-title"
              className="text-lg font-bold tracking-tight text-[var(--color-text-primary)]"
            >
              Editar contato
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)] leading-snug">
              {contact?.name ?? "Carregando…"}
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
          {loading && (
            <p className="text-sm text-[var(--color-text-secondary)]">Carregando…</p>
          )}
          {fetchError && (
            <p className="text-sm text-[var(--color-error)]">{fetchError}</p>
          )}
          {!loading && contact && (
            <ContactForm
              contact={contact}
              layout="sheet"
              actionError={actionError}
            />
          )}
        </div>
      </aside>
    </div>
  );
}
