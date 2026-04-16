import type { CooldownStatus } from "@/lib/contacts/utils";

const CONFIG: Record<CooldownStatus, { dot: string; label: string }> = {
  cold: { dot: "bg-emerald-500", label: "Disponível" },
  warm: { dot: "bg-amber-500", label: "Recente" },
  hot: { dot: "bg-rose-500", label: "Aguardar" },
};

type Props = {
  status: CooldownStatus;
  days: number | null;
  /** Hide the descriptive label; show only dot + days. */
  minimal?: boolean;
};

export function CooldownBadge({ status, days, minimal = false }: Props) {
  const { dot, label } = CONFIG[status];
  const daysText = days === null ? "Nunca contatado" : days === 0 ? "Hoje" : `${days}d atrás`;

  return (
    <span
      className="inline-flex items-center gap-2 text-xs text-[var(--color-text-secondary)]"
      title={minimal ? `${label} · ${daysText}` : undefined}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`}
        aria-hidden
      />
      <span className="tabular-nums">{daysText}</span>
      {!minimal && (
        <span className="hidden lg:inline text-[var(--color-text-tertiary)]">· {label}</span>
      )}
    </span>
  );
}
