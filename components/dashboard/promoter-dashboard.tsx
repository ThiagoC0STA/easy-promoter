import Link from "next/link";
import { AlertTriangle, ArrowRight, Cake, Clock, Users } from "lucide-react";

import type { Contact } from "@/lib/contacts/types";
import { COOLDOWN_DAYS } from "@/lib/contacts/types";
import { StatsCards } from "@/components/contacts/stats-cards";
import { DayQueueFreshnessBanner } from "@/components/dashboard/day-queue-freshness-banner";
import { DayQueueSection } from "@/components/dashboard/day-queue-section";
import { MonthlyTouchesChart } from "@/components/dashboard/monthly-touches-chart";
import {
  daysSinceContact,
  isBirthdaySoon,
  daysUntilBirthday,
} from "@/lib/contacts/utils";

type Props = {
  contacts: Contact[];
};

function needsAttention(contact: Contact): boolean {
  const days = daysSinceContact(contact.last_contacted_at);
  return days === null || days >= COOLDOWN_DAYS;
}

export function PromoterDashboard({ contacts }: Props) {
  const priorityAll = contacts.filter(needsAttention);
  const priorityCount = priorityAll.length;

  const priority = [...priorityAll]
    .sort((a, b) => {
      const da = daysSinceContact(a.last_contacted_at);
      const db = daysSinceContact(b.last_contacted_at);
      if (da === null && db === null) return 0;
      if (da === null) return -1;
      if (db === null) return 1;
      return db - da;
    })
    .slice(0, 8);

  const birthdays = contacts
    .filter((c) => isBirthdaySoon(c.birthday))
    .sort((a, b) => {
      const da = daysUntilBirthday(a.birthday) ?? 999;
      const db = daysUntilBirthday(b.birthday) ?? 999;
      return da - db;
    })
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-8 sm:py-10 flex flex-col gap-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[var(--color-text-primary)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            Visão geral da base, ritmo de contato e atalhos.
          </p>
          {priorityCount > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                            bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
              <AlertTriangle size={12} strokeWidth={2} />
              {priorityCount} ação{priorityCount !== 1 ? "ões" : ""} urgente{priorityCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>
        <Link
          href="/app/contacts"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[var(--radius-control)] text-sm font-semibold
                     bg-[var(--color-accent)] text-white hover:brightness-110 transition-all"
        >
          <Users size={15} strokeWidth={2} />
          Contatos
          <ArrowRight size={14} strokeWidth={2} />
        </Link>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <DayQueueFreshnessBanner contacts={contacts} />
      <StatsCards contacts={contacts} />

      {/* ── Gráfico mensal ─────────────────────────────────────────────── */}
      <MonthlyTouchesChart contacts={contacts} />

      {/* ── Fila do dia ────────────────────────────────────────────────── */}
      <DayQueueSection contacts={contacts} />

      {/* ── Priority + Birthdays ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority contacts */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
                <Clock size={13} strokeWidth={1.75} className="text-red-400" />
              </div>
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Prioridade
              </h2>
            </div>
            <Link
              href="/app/contacts"
              className="text-xs font-medium text-[var(--color-accent)] hover:underline"
            >
              Ver todos
            </Link>
          </div>
          {priority.length === 0 ? (
            <div className="glass-card rounded-[var(--radius-card)] p-8 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Tudo em dia. Bom momento para planejar próximos contatos.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {priority.map((c) => {
                const days = daysSinceContact(c.last_contacted_at);
                return (
                  <li key={c.id}>
                    <Link
                      href={`/app/contacts?edit=${c.id}`}
                      className="glass-card rounded-[var(--radius-control)] px-4 py-3 flex items-center justify-between gap-3 no-underline hover:border-[var(--color-accent)]/40 transition-colors"
                    >
                      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {c.name}
                      </span>
                      <span className="text-xs text-red-400 shrink-0 font-medium">
                        {days === null ? "Nunca" : `${days}d sem contato`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Birthdays */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-pink-500/15 flex items-center justify-center">
              <Cake size={13} strokeWidth={1.75} className="text-pink-400" />
            </div>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Aniversários (7 dias)
            </h2>
          </div>
          {birthdays.length === 0 ? (
            <div className="glass-card rounded-[var(--radius-card)] p-8 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Nenhum aniversário nesta janela.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {birthdays.map((c) => {
                const d = daysUntilBirthday(c.birthday);
                return (
                  <li key={c.id}>
                    <Link
                      href={`/app/contacts?edit=${c.id}`}
                      className="glass-card rounded-[var(--radius-control)] px-4 py-3 flex items-center justify-between gap-3 no-underline hover:border-pink-500/30 transition-colors"
                    >
                      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {c.name}
                      </span>
                      <span className={`text-xs font-semibold shrink-0 ${d === 0 ? "text-pink-400" : "text-[var(--color-text-tertiary)]"}`}>
                        {d === 0 ? "Hoje" : `Em ${d}d`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

    </div>
  );
}
