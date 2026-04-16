/**
 * Lightweight loading placeholders for authed routes (perceived performance).
 */
export function DashboardPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-14 animate-pulse">
      <div className="h-40 rounded-3xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] mb-10" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-[var(--radius-card)] bg-[var(--color-surface-secondary)] border border-[var(--color-border)]"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-72 rounded-[var(--radius-card)] bg-[var(--color-surface-secondary)] border border-[var(--color-border)]"
          />
        ))}
      </div>
    </div>
  );
}

export function ContactsListSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 sm:py-14 animate-pulse">
      <div className="h-12 w-64 rounded-lg bg-[var(--color-surface-secondary)] mb-8" />
      <div className="h-12 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] mb-6" />
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]"
          />
        ))}
      </div>
    </div>
  );
}
