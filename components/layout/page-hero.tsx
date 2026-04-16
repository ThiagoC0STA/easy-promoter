import * as React from "react";

type Size = "lg" | "md";

type Props = {
  icon: React.ReactNode;
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  size?: Size;
  className?: string;
};

const sizeClasses: Record<
  Size,
  { root: string; title: string; iconWrap: string }
> = {
  lg: {
    root: "p-6 sm:p-10 mb-10",
    title: "text-3xl sm:text-4xl",
    iconWrap: "w-12 h-12 rounded-[var(--radius-card)]",
  },
  md: {
    root: "p-5 sm:p-8 mb-8",
    title: "text-2xl sm:text-3xl",
    iconWrap: "w-11 h-11 rounded-xl",
  },
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
    <div className={`surface-hero ${s.root} ${className}`.trim()}>
      <div
        className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        aria-labelledby="page-hero-title"
      >
        <div className="flex items-start gap-4 min-w-0">
          <div
            className={`${s.iconWrap} flex items-center justify-center shrink-0
                        bg-[var(--color-surface-secondary)] border border-[var(--color-border)]
                        shadow-[var(--shadow-icon)]`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                {eyebrow}
              </p>
            ) : null}
            <h1
              id="page-hero-title"
              className={`${s.title} font-bold text-[var(--color-text-primary)] tracking-tight`}
            >
              {title}
            </h1>
            {description ? (
              <div className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-xl leading-relaxed">
                {description}
              </div>
            ) : null}
            {children ? <div className="mt-3 max-w-xl space-y-2">{children}</div> : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap gap-3 self-start sm:self-auto">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
