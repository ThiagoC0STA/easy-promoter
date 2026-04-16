import Link from "next/link";
import { ScrollText } from "lucide-react";
import { CHANGELOG } from "@/lib/admin/changelog";

export default function AdminChangelogPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-10 sm:py-14">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] mb-6 transition-colors"
      >
        Voltar ao admin
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--color-accent-muted)]">
          <ScrollText size={20} strokeWidth={1.5} className="text-[var(--color-accent)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Changelog
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Novidades entregues no produto. Edite a lista em lib/admin/changelog.ts.
          </p>
        </div>
      </div>
      <ol className="flex flex-col gap-8">
        {CHANGELOG.map((entry) => (
          <li key={entry.version}>
            <div className="flex flex-wrap items-baseline gap-2 mb-2">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {entry.version}
              </h2>
              <span className="text-xs text-[var(--color-text-tertiary)]">{entry.date}</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-[var(--color-text-secondary)]">
              {entry.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
