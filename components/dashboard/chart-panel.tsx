import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

/**
 * Shared shell for dashboard charts: fixed rhythm header + stretch body so grid rows align.
 */
export function ChartPanel({ title, subtitle, children }: Props) {
  return (
    <article className="dash-chart-card rounded-2xl p-5 sm:p-6 flex flex-col h-full min-h-[300px] lg:min-h-[320px]">
      <header className="shrink-0 mb-4 pb-4 border-b border-[var(--color-border-subtle)]">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
          {title}
        </h3>
        {subtitle ? (
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2 leading-relaxed max-w-prose">
            {subtitle}
          </p>
        ) : null}
      </header>
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
    </article>
  );
}
