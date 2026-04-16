"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Contact } from "@/lib/contacts/types";
import { useFilteredDayQueue } from "@/components/dashboard/use-filtered-day-queue";

const STORAGE_KEY = "ep_day_queue_seen_sig_v1";

type Props = {
  contacts: Contact[];
};

export function DayQueueFreshnessBanner({ contacts }: Props) {
  const queue = useFilteredDayQueue(contacts, 10);
  const signature = queue.map((c) => c.id).join("|");
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!signature) {
      setVisible(false);
      return;
    }
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      setVisible(seen !== signature);
    } catch {
      setVisible(false);
    }
  }, [signature]);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, signature);
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible || !signature) return null;

  return (
    <div
      className="rounded-[var(--radius-card)] border border-[var(--color-accent)]/30 bg-[var(--color-accent-muted)] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      role="status"
    >
      <div className="flex items-start gap-2 min-w-0">
        <Sparkles
          size={18}
          strokeWidth={1.75}
          className="text-[var(--color-accent)] shrink-0 mt-0.5"
          aria-hidden
        />
        <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
          A fila do dia mudou desde a última vez que você olhou por aqui. Vale
          conferir quem entrou ou saiu da lista.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Link
          href="/app#fila-do-dia"
          className="btn-primary text-sm py-2 px-3 min-h-10"
        >
          Ver fila
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="text-sm font-medium min-h-10 px-3 py-2 rounded-xl border border-[var(--color-border)]
                     text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated)] hover:opacity-90 cursor-pointer"
        >
          Marcar como visto
        </button>
      </div>
    </div>
  );
}
