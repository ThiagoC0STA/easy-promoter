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
    try { return decodeURIComponent(raw); } catch { return raw; }
  }, [searchParams]);

  const [phase, setPhase] = React.useState<"closed" | "open" | "closing">(
    open ? "open" : "closed",
  );

  React.useEffect(() => {
    if (open) setPhase("open");
  }, [open]);

  const commitClose = React.useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(NEW_PARAM);
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
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

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
        aria-label="Fechar painel de novo contato"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-contact-sheet-title"
        className={`ps-sheet ep-sheet-panel${isClosing ? " closing" : ""}`}
      >
        <header className="ps-sheet-head">
          <div className="ps-sheet-head-text">
            <h2 id="new-contact-sheet-title" className="ps-sheet-title">
              Novo contato
            </h2>
            <p className="ps-sheet-sub">
              Preencha o que souber. Você pode editar depois.
            </p>
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
          <ContactForm
            layout="sheet"
            actionError={actionError}
            defaultGroupId={searchParams.get("group") || null}
          />
        </div>
      </aside>
    </div>
  );
}
