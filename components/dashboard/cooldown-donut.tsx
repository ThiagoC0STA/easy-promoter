import type { CooldownCounts } from "@/lib/dashboard/aggregate-contacts";

const COLORS = {
  cold: "#10b981",
  warm: "#f59e0b",
  hot: "#ef4444",
} as const;

type Props = {
  counts: CooldownCounts;
  labels?: { cold: string; warm: string; hot: string };
};

export function CooldownDonut({
  counts,
  labels = {
    cold: "Disponível (10+ d)",
    warm: "Recente (5–9 d)",
    hot: "Aguardar (0–4 d)",
  },
}: Props) {
  const total = counts.cold + counts.warm + counts.hot;
  const pct = (n: number) => (total === 0 ? 0 : (n / total) * 100);
  const pCold = pct(counts.cold);
  const pWarm = pct(counts.warm);
  const pHot = pct(counts.hot);
  const a = pCold;
  const b = a + pWarm;
  const gradient =
    total === 0
      ? "conic-gradient(var(--color-border) 0deg 360deg)"
      : `conic-gradient(
          ${COLORS.cold} 0% ${a}%,
          ${COLORS.warm} ${a}% ${b}%,
          ${COLORS.hot} ${b}% 100%
        )`;

  return (
    <div className="flex flex-1 flex-col sm:flex-row items-stretch justify-between gap-6 sm:gap-8 w-full min-h-0">
      <div className="flex justify-center sm:justify-start shrink-0">
        <div
          className="relative w-[140px] h-[140px] sm:w-[152px] sm:h-[152px] rounded-full"
          style={{ background: gradient }}
          role="img"
          aria-label={`Distribuição por cooldown: frio ${counts.cold}, morno ${counts.warm}, quente ${counts.hot}`}
        >
          <div
            className="absolute inset-[20%] rounded-full flex flex-col items-center justify-center text-center px-2
                       bg-[var(--color-surface-elevated)] border border-[var(--color-border)]"
          >
            <span className="text-2xl font-bold text-[var(--color-text-primary)] tabular-nums leading-none">
              {total}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-[var(--color-text-tertiary)] mt-1">
              contatos
            </span>
          </div>
        </div>
      </div>
      <ul className="flex flex-col flex-1 justify-evenly gap-2 sm:gap-1 text-sm min-w-0 py-1">
        {(
          [
            ["cold", counts.cold, COLORS.cold, labels.cold],
            ["warm", counts.warm, COLORS.warm, labels.warm],
            ["hot", counts.hot, COLORS.hot, labels.hot],
          ] as const
        ).map(([key, n, color, label]) => (
          <li
            key={key}
            className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 sm:py-2.5 bg-[var(--color-surface-secondary)]/60 border border-[var(--color-border)]/80"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white/10"
                style={{ backgroundColor: color }}
              />
              <span className="text-[12px] sm:text-sm text-[var(--color-text-secondary)] truncate">
                {label}
              </span>
            </span>
            <span className="font-semibold text-[var(--color-text-primary)] tabular-nums shrink-0 text-sm">
              {n}
              <span className="text-[var(--color-text-tertiary)] font-normal text-xs ml-1.5">
                {total ? Math.round((n / total) * 100) : 0}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
