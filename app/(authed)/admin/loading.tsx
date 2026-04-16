export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-10 sm:py-14 animate-pulse">
      <div className="h-10 w-56 rounded-lg bg-[var(--color-surface-secondary)] mb-8" />
      <div className="h-72 rounded-[var(--radius-card)] bg-[var(--color-surface-secondary)] border border-[var(--color-border)] mb-10" />
      <div className="h-8 w-40 rounded bg-[var(--color-surface-secondary)] mb-4" />
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]"
          />
        ))}
      </div>
    </div>
  );
}
