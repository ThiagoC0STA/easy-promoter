"use client";

import * as React from "react";
import type {
  TouchHistoryEntry,
  TouchHistoryKind,
} from "@/lib/contacts/touch-history-storage";
import {
  getTouchHistory,
  TOUCH_HISTORY_CHANGED_EVENT,
} from "@/lib/contacts/touch-history-storage";

type Props = {
  contactId: string;
};

function kindLabel(kind: TouchHistoryKind): string {
  switch (kind) {
    case "whatsapp_opened":
      return "Abriu o WhatsApp";
    case "instagram_opened":
      return "Abriu o Instagram";
    case "touch_confirmed":
      return "Registrou contato (hoje)";
    default:
      return "Evento";
  }
}

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ContactTouchHistoryPanel({ contactId }: Props) {
  const [entries, setEntries] = React.useState<TouchHistoryEntry[]>([]);

  const refresh = React.useCallback(() => {
    setEntries(getTouchHistory(contactId));
  }, [contactId]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  React.useEffect(() => {
    function onHistory() {
      refresh();
    }
    window.addEventListener(TOUCH_HISTORY_CHANGED_EVENT, onHistory);
    window.addEventListener("storage", onHistory);
    return () => {
      window.removeEventListener(TOUCH_HISTORY_CHANGED_EVENT, onHistory);
      window.removeEventListener("storage", onHistory);
    };
  }, [refresh]);

  return (
    <div className="glass-card rounded-[var(--radius-card)] p-6 flex flex-col gap-2">
      <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
        Histórico de ritmo (neste aparelho)
      </h2>
      <p className="text-[11px] text-[var(--color-text-tertiary)] leading-snug mb-1">
        Aberturas de canal e confirmações de contato feito que você faz por aqui.
        Não substitui backup da base no servidor.
      </p>
      {entries.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          Ainda não há eventos registrados para este contato neste navegador.
        </p>
      ) : (
        <ul className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
          {entries.map((e, i) => (
            <li
              key={`${e.at}-${i}`}
              className="text-sm border-b border-[var(--color-border-subtle)] pb-2 last:border-0 last:pb-0"
            >
              <span className="text-[var(--color-text-tertiary)] text-xs block">
                {formatWhen(e.at)}
              </span>
              <span className="text-[var(--color-text-primary)] font-medium">
                {kindLabel(e.kind)}
              </span>
              {e.note && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-snug">
                  {e.note}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
