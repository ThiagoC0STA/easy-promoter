"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";
import { touchContactByIdAction } from "@/lib/contacts/actions";

type Props = {
  href: string;
  contactId: string;
  contactName: string;
};

export function WhatsAppTouchLauncher({ href, contactId, contactName }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  function handleOpenWhatsApp() {
    window.open(href, "_blank", "noopener,noreferrer");
    setOpen(true);
  }

  async function handleConfirmTouch() {
    setBusy(true);
    try {
      await touchContactByIdAction(contactId);
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpenWhatsApp}
        title="WhatsApp"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)]
                   hover:text-emerald-500 hover:bg-emerald-500/10 transition-all cursor-pointer"
      >
        <Phone size={16} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
            aria-label="Fechar"
            onClick={() => !busy && setOpen(false)}
          />
          <div
            className="relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wa-touch-title"
          >
            <h2
              id="wa-touch-title"
              className="text-lg font-semibold text-[var(--color-text-primary)] mb-2"
            >
              Registrar contato?
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6">
              O WhatsApp abriu em outra aba. Se você falou com{" "}
              <span className="font-medium text-[var(--color-text-primary)]">
                {contactName}
              </span>
              , confirme para salvar a data de hoje como último contato.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--color-border)]
                           text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]
                           transition-colors cursor-pointer disabled:opacity-50"
              >
                Não, só abri o chat
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleConfirmTouch}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                           bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer disabled:opacity-60"
              >
                {busy ? "Salvando…" : "Sim, contatei hoje"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
