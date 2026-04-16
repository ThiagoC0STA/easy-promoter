"use client";

import Link from "next/link";
import { ListTodo } from "lucide-react";
import type { Contact } from "@/lib/contacts/types";
import {
  daysSinceContact,
  daysUntilBirthday,
  isBirthdaySoon,
} from "@/lib/contacts/utils";
import { COOLDOWN_DAYS } from "@/lib/contacts/types";
import { useFilteredDayQueue } from "@/components/dashboard/use-filtered-day-queue";

type Props = {
  contacts: Contact[];
};

function needsAttention(contact: Contact): boolean {
  const days = daysSinceContact(contact.last_contacted_at);
  return days === null || days >= COOLDOWN_DAYS;
}

export function DayQueueSection({ contacts }: Props) {
  const queue = useFilteredDayQueue(contacts, 10);

  return (
    <section id="fila-do-dia" className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <ListTodo
            size={18}
            strokeWidth={1.75}
            className="text-[var(--color-accent)] shrink-0"
            aria-hidden
          />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
              Fila do dia
            </h2>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1 max-w-xl">
              Até 10 pessoas: aniversário em até 7 dias ou prontas para retomada (
              {COOLDOWN_DAYS}+ dias sem contato ou sem registro). Ordem: aniversário
              mais próximo, depois quem está há mais tempo sem falar.
            </p>
          </div>
        </div>
        <Link
          href="/app/contacts"
          className="text-xs font-medium text-[var(--color-accent)] hover:underline shrink-0"
        >
          Ir para contatos
        </Link>
      </div>
      {queue.length === 0 ? (
        <div className="glass-card rounded-[var(--radius-control)] p-8 text-center text-sm text-[var(--color-text-secondary)]">
          Ninguém na fila hoje com esses critérios. Quando houver, aparece aqui.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {queue.map((c) => {
            const days = daysSinceContact(c.last_contacted_at);
            const bday = isBirthdaySoon(c.birthday);
            const d = daysUntilBirthday(c.birthday);
            const attention = needsAttention(c);
            const badge = bday
              ? d === 0
                ? "Aniversário hoje"
                : `Aniversário em ${d}d`
              : attention
                ? days === null
                  ? "Sem registro de contato"
                  : `${days}d sem contato`
                : "";
            return (
              <li key={c.id}>
                <Link
                  href={`/app/contacts/${c.id}/edit`}
                  className="glass-card rounded-[var(--radius-control)] px-4 py-3 flex items-center justify-between gap-3 no-underline hover:border-[var(--color-accent)] transition-colors"
                >
                  <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {c.name}
                  </span>
                  <span className="text-xs text-[var(--color-text-tertiary)] shrink-0 max-w-[48%] text-right">
                    {badge}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
