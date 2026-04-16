import Link from "next/link";
import type { PromoterStat } from "@/lib/admin/queries";

type Props = {
  stats: PromoterStat[];
};

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 rounded-full bg-[var(--color-surface-secondary)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--color-accent)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-[var(--color-text-secondary)] w-6 text-right shrink-0">
        {value}
      </span>
    </div>
  );
}

export function PromoterStatsTable({ stats }: Props) {
  const maxContacts = Math.max(...stats.map((s) => s.total_contacts), 1);
  const maxTouched = Math.max(...stats.map((s) => s.touched_last_30d), 1);

  if (stats.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 text-center">
        <p className="text-sm text-[var(--color-text-tertiary)]">Nenhum dado ainda.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_minmax(120px,1fr)_minmax(120px,1fr)_60px_60px] gap-3 px-4 py-2.5
                      border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-secondary)]">
        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Promoter</span>
        <span className="text-xs font-semibold text-[var(--color-text-secondary)] hidden sm:block">Total contatos</span>
        <span className="text-xs font-semibold text-[var(--color-text-secondary)] hidden sm:block">Ativos (30d)</span>
        <span className="text-xs font-semibold text-[var(--color-text-secondary)] text-center hidden sm:block">WA</span>
        <span className="text-xs font-semibold text-[var(--color-text-secondary)] text-center hidden sm:block">IG</span>
      </div>

      {stats.map((s, i) => (
        <Link
          key={s.promoter_id}
          href={`/admin/promoters/${s.promoter_id}`}
          className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_minmax(120px,1fr)_minmax(120px,1fr)_60px_60px] gap-3 items-center
                     px-4 py-3 no-underline border-b border-[var(--color-border-subtle)] last:border-b-0
                     hover:bg-[var(--color-surface-secondary)]/60 transition-colors"
        >
          {/* Name + rank */}
          <div className="min-w-0 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[var(--color-text-tertiary)] tabular-nums w-4 shrink-0">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                {s.display_name ?? "Sem nome"}
              </p>
              <p className="text-[11px] text-[var(--color-text-tertiary)] sm:hidden">
                {s.total_contacts} contatos · {s.touched_last_30d} ativos
              </p>
            </div>
          </div>

          {/* Total contacts bar */}
          <div className="hidden sm:block min-w-0">
            <Bar value={s.total_contacts} max={maxContacts} />
          </div>

          {/* Active 30d bar */}
          <div className="hidden sm:block min-w-0">
            <Bar value={s.touched_last_30d} max={maxTouched} />
          </div>

          {/* WA count */}
          <div className="hidden sm:flex items-center justify-center">
            <span className="text-xs tabular-nums text-[var(--color-text-secondary)]">
              {s.contacts_with_whatsapp}
            </span>
          </div>

          {/* IG count */}
          <div className="hidden sm:flex items-center justify-center">
            <span className="text-xs tabular-nums text-[var(--color-text-secondary)]">
              {s.contacts_with_instagram}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
