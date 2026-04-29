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
  const [phase, setPhase] = React.useState<"closed" | "open" | "closing">(
    open ? "open" : "closed",
  );

  React.useEffect(() => {
    if (open) setPhase("open");
  }, [open]);

  const actionError = React.useMemo(() => {
    const raw = searchParams.get("error");
    if (!raw) return null;
    try { return decodeURIComponent(raw); } catch { return raw; }
  }, [searchParams]);

  const commitClose = React.useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(EDIT_PARAM);
    next.delete("error");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setPhase("closed");
  }, [pathname, router, searchParams]);

  const close = React.useCallback(() => {
    setPhase("closing");
  }, []);

  React.useEffect(() => {
    if (phase !== "closing") return;
    const t = setTimeout(commitClose, 280);
    return () => clearTimeout(t);
  }, [phase, commitClose]);

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
    if (phase !== "open") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [phase]);

  React.useEffect(() => {
    if (phase !== "open") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, close]);

  if (phase === "closed") return null;
  const isClosing = phase === "closing";

  return (
    <div className="ps-sheet-overlay">
      <button
        type="button"
        className={`ps-sheet-backdrop${isClosing ? " closing" : ""}`}
        onClick={close}
        aria-label="Fechar painel de edição"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-contact-sheet-title"
        className={`ps-sheet ep-sheet-panel${isClosing ? " closing" : ""}`}
      >
        <header className="ps-sheet-head">
          <div className="ps-sheet-head-text">
            <h2 id="edit-contact-sheet-title" className="ps-sheet-title">
              Editar contato
            </h2>
            <p className="ps-sheet-sub">{contact?.name ?? "Carregando…"}</p>
          </div>
          <button
            type="button"
            onClick={close}
            className="ps-sheet-close"
            aria-label="Fechar"
          >
            <X size={18} strokeWidth={1.6} aria-hidden />
          </button>
        </header>
        <div className="ps-sheet-body">
          {loading && <SheetSkeleton />}
          {fetchError && <div className="ps-sheet-error">{fetchError}</div>}
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

function SheetSkeleton() {
  return (
    <div className="ps-skeleton-wrap">
      <div className="ps-skeleton-row">
        <div className="ps-skeleton-label" />
        <div className="ps-skeleton-field" />
      </div>
      <div className="ps-skeleton-row">
        <div className="ps-skeleton-label" />
        <div className="ps-skeleton-field" />
      </div>
      <div className="ps-skeleton-grid">
        <div className="ps-skeleton-row">
          <div className="ps-skeleton-label" />
          <div className="ps-skeleton-field" />
        </div>
        <div className="ps-skeleton-row">
          <div className="ps-skeleton-label" />
          <div className="ps-skeleton-field" />
        </div>
      </div>
      <div className="ps-skeleton-row">
        <div className="ps-skeleton-label" />
        <div className="ps-skeleton-field tall" />
      </div>
    </div>
  );
}
