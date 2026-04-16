import * as React from "react";

type Size = "lg" | "md";

type Props = {
  icon?: React.ReactNode;
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  size?: Size;
  className?: string;
};

const sizeClasses: Record<Size, { title: string; mb: string }> = {
  lg: { title: "text-2xl sm:text-3xl", mb: "mb-8" },
  md: { title: "text-xl sm:text-2xl", mb: "mb-6" },
};

export function PageHero({
  icon,
  eyebrow,
  title,
  description,
  children,
  actions,
  size = "lg",
  className = "",
}: Props) {
  const s = sizeClasses[size];

  return (
    <header className={`${s.mb} ${className}`.trim()}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex items-start gap-3">
          {icon ? (
            <div
              className="shrink-0 mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center
                         bg-[var(--color-surface-secondary)] border border-[var(--color-border)]
                         text-[var(--color-accent)]"
            >
              {icon}
            </div>
          ) : null}
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-tertiary)] mb-1">
                {eyebrow}
              </p>
            ) : null}
            <h1
              id="page-hero-title"
              className={`${s.title} font-semibold tracking-tight text-[var(--color-text-primary)]`}
            >
              {title}
            </h1>
            {description ? (
              <div className="text-sm text-[var(--color-text-tertiary)] mt-1 max-w-2xl leading-relaxed">
                {description}
              </div>
            ) : null}
            {children ? (
              <div className="mt-3 max-w-2xl text-sm text-[var(--color-text-tertiary)]">
                {children}
              </div>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:self-center">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
