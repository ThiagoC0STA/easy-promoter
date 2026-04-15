type Row = { label: string; value: number; color?: string };

type Props = {
  rows: Row[];
  emptyMessage?: string;
};

/**
 * Bar rows only (no outer card). Parent should wrap with ChartPanel.
 */
export function HorizontalBarChart({
  rows,
  emptyMessage = "Sem dados para exibir.",
}: Props) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const empty = rows.every((r) => r.value === 0);

  if (empty) {
    return (
      <div className="flex-1 flex items-center justify-center text-center px-2">
        <p className="text-sm text-[var(--color-text-secondary)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col flex-1 justify-evenly gap-3 min-h-0 list-none m-0 p-0">
      {rows.map((row) => (
        <li key={row.label} className="shrink-0">
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)] truncate min-w-0">
              {row.label}
            </span>
            <span className="text-xs font-bold text-[var(--color-text-primary)] tabular-nums shrink-0">
              {row.value}
            </span>
          </div>
          <div
            className="h-3 rounded-md bg-[var(--color-surface-secondary)] border border-[var(--color-border)] overflow-hidden"
            role="presentation"
          >
            <div
              className="h-full rounded-md transition-[width] duration-500 ease-out"
              style={{
                width: `${(row.value / max) * 100}%`,
                minWidth: row.value > 0 ? "4px" : undefined,
                background:
                  row.color ??
                  "linear-gradient(90deg, var(--color-accent), #a29bfe)",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
