"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";
import { touchContactByIdAction } from "@/lib/contacts/actions";

export type ContactChannel = "whatsapp" | "instagram";

type Props = {
  channel: ContactChannel;
  href: string;
  contactId: string;
  contactName: string;
};

const COPY: Record<
  ContactChannel,
  { appLabel: string; dismiss: string; ariaOpen: string }
> = {
  whatsapp: {
    appLabel: "WhatsApp",
    dismiss: "Não, só abri o WhatsApp",
    ariaOpen: "Abrir WhatsApp",
  },
  instagram: {
    appLabel: "Instagram",
    dismiss: "Não, só abri o Instagram",
    ariaOpen: "Abrir Instagram",
  },
};

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChannelTouchLauncher({
  channel,
  href,
  contactId,
  contactName,
}: Props) {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [touchError, setTouchError] = React.useState<string | null>(null);
  const t = COPY[channel];
  const titleId = `channel-touch-${channel}-${contactId}`;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) setOpen(false);
    }
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, busy]);

  function handleOpen() {
    setTouchError(null);
    window.open(href, "_blank", "noopener,noreferrer");
    setOpen(true);
  }

  async function handleConfirmTouch() {
    setBusy(true);
    setTouchError(null);
    try {
      const result = await touchContactByIdAction(contactId);
      if (!result.ok) {
        setTouchError(result.message);
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const btnClass =
    channel === "whatsapp"
      ? "min-w-11 min-h-11 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-emerald-500 hover:bg-emerald-500/10 transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
      : "min-w-11 min-h-11 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-pink-500 hover:bg-pink-500/10 transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500";

  const modal =
    open && mounted ? (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
        style={{ isolation: "isolate" }}
      >
        {/* Solid overlay: no backdrop-blur (avoids GPU flicker inside glass-card ancestors) */}
        <button
          type="button"
          className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-text-primary)_72%,transparent)] cursor-default"
          style={{ WebkitTapHighlightColor: "transparent" }}
          aria-label="Fechar"
          onClick={() => !busy && setOpen(false)}
        />
        <div
          className="relative z-10 w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.45)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <h2
            id={titleId}
            className="text-lg font-semibold text-[var(--color-text-primary)] mb-2"
          >
            Contato feito hoje?
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6">
            O {t.appLabel} abriu em outra aba. Se você já falou com{" "}
            <span className="font-medium text-[var(--color-text-primary)]">
              {contactName}
            </span>
            , confirme para marcar o último contato como hoje.
          </p>
          {touchError ? (
            <p
              role="alert"
              className="text-sm text-[var(--color-error)] mb-4 leading-relaxed"
            >
              {touchError}
            </p>
          ) : null}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--color-border)]
                         text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)] hover:opacity-90
                         transition-opacity cursor-pointer disabled:opacity-50"
            >
              {t.dismiss}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleConfirmTouch}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                         bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer disabled:opacity-60"
            >
              {busy ? "Salvando…" : "Sim, contato feito hoje"}
            </button>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        title={t.ariaOpen}
        aria-label={`${t.ariaOpen} de ${contactName}`}
        className={btnClass}
      >
        {channel === "whatsapp" ? (
          <Phone size={16} strokeWidth={1.5} aria-hidden />
        ) : (
          <InstagramGlyph />
        )}
      </button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
