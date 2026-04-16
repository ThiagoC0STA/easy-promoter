import Link from "next/link";
import { ArrowRight, Cake, LayoutDashboard, Users } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import type { Contact } from "@/lib/contacts/types";
import { COOLDOWN_DAYS } from "@/lib/contacts/types";
import { StatsCards } from "@/components/contacts/stats-cards";
import { DayQueueFreshnessBanner } from "@/components/dashboard/day-queue-freshness-banner";
import { DayQueueSection } from "@/components/dashboard/day-queue-section";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { buildSegmentInsightLines } from "@/lib/dashboard/segment-insights";
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
    .slice(0, 6);

  const birthdays = contacts
    .filter((c) => isBirthdaySoon(c.birthday))
    .sort((a, b) => {
      const da = daysUntilBirthday(a.birthday) ?? 999;
      const db = daysUntilBirthday(b.birthday) ?? 999;
      return da - db;
    })
    .slice(0, 6);

  const segmentLines = buildSegmentInsightLines(contacts);

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 sm:py-14">
      <PageHero
        eyebrow="Visão geral"
        title="Dashboard"
        description={
          <>
            Gráficos da base, ritmo de contato e atalhos. A lista completa fica em
            Contatos.
          </>
        }
        icon={
          <LayoutDashboard
            size={24}
            strokeWidth={1.5}
            className="text-[var(--color-accent)]"
          />
        }
        actions={
          <Link href="/app/contacts" className="btn-primary">
            <Users size={18} strokeWidth={1.75} />
            Abrir contatos
            <ArrowRight size={18} strokeWidth={1.75} />
          </Link>
        }
      >
        {priorityCount > 0 ? (
          <p className="text-sm font-medium text-[var(--color-accent)]">
            Há {priorityCount} contato{priorityCount === 1 ? "" : "s"} que{" "}
            {priorityCount === 1 ? "precisa" : "precisam"} de retomada. Veja a prioridade
            abaixo ou abra todos em Contatos.
          </p>
        ) : contacts.length > 0 ? (
          <p className="text-sm text-[var(--color-text-tertiary)]">
            Ninguém fora do ritmo ideal neste recorte. Bom momento para planejar próximos
            contatos.
          </p>
        ) : null}
      </PageHero>

      <div className="flex flex-col gap-10">
        <DayQueueFreshnessBanner contacts={contacts} />
        <StatsCards contacts={contacts} />

        {segmentLines.length > 0 ? (
          <section aria-label="Resumo por segmento">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] mb-3 pl-1 border-l-2 border-[var(--color-accent-muted)]">
              Resumo por segmento
            </h2>
            <ul className="flex flex-col gap-1.5">
              {segmentLines.map((line, i) => (
                <li
                  key={`segment-insight-${i}`}
                  className="text-sm text-[var(--color-text-secondary)] leading-relaxed"
                >
                  {line}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <DayQueueSection contacts={contacts} />

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] mb-3 pl-1 border-l-2 border-[var(--color-accent-muted)]">
            Gráficos
          </h2>
          <DashboardCharts contacts={contacts} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] pl-1 border-l-2 border-[var(--color-accent-muted)]">
                Prioridade (frio ou sem registro)
              </h2>
              <Link
                href="/app/contacts"
                className="text-xs font-medium text-[var(--color-accent)] hover:underline"
              >
                Ver todos
              </Link>
            </div>
            {priority.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-sm text-[var(--color-text-secondary)]">
                Nenhum contato nessa faixa. Tudo em dia ou ainda sem dados.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {priority.map((c) => {
                  const days = daysSinceContact(c.last_contacted_at);
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/app/contacts/${c.id}/edit`}
                        className="glass-card rounded-xl px-4 py-3 flex items-center justify-between gap-3 no-underline hover:border-[var(--color-accent)] transition-colors"
                      >
                        <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                          {c.name}
                        </span>
                        <span className="text-xs text-[var(--color-text-tertiary)] shrink-0">
                          {days === null ? "Nunca" : `${days}d sem contato`}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Cake size={16} strokeWidth={1.5} className="text-[var(--color-chart-rose)]" />
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)] pl-1 border-l-2 border-[color-mix(in_srgb,var(--color-chart-rose)_35%,transparent)]">
                Aniversários (7 dias)
              </h2>
            </div>
            {birthdays.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-sm text-[var(--color-text-secondary)]">
                Nenhum aniversário nesta janela.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {birthdays.map((c) => {
                  const d = daysUntilBirthday(c.birthday);
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/app/contacts/${c.id}/edit`}
                        className="glass-card rounded-xl px-4 py-3 flex items-center justify-between gap-3 no-underline hover:border-[color-mix(in_srgb,var(--color-chart-rose)_42%,var(--color-border))] transition-colors"
                      >
                        <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                          {c.name}
                        </span>
                        <span className="text-xs font-medium text-[var(--color-chart-rose)] shrink-0">
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
    </div>
  );
}
