import Link from "next/link";
import { ChevronRight, Shield, User } from "lucide-react";
import type { Profile } from "@/lib/auth/types";

type Props = {
  promoters: Profile[];
};

export function PromotersList({ promoters }: Props) {
  if (promoters.length === 0) {
    return (
      <div className="glass-card rounded-[var(--radius-card)] p-8 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Nenhum promoter cadastrado.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {promoters.map((p) => (
        <Link
          key={p.id}
          href={`/admin/promoters/${p.id}`}
          className="glass-card rounded-[var(--radius-control)] p-4 flex items-center justify-between gap-3 no-underline group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                p.role === "super_admin"
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
              }`}
            >
              {p.role === "super_admin" ? (
                <Shield size={16} strokeWidth={1.5} />
              ) : (
                <User size={16} strokeWidth={1.5} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                {p.display_name ?? "Sem nome"}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                {p.role === "super_admin" ? "Super admin" : "Promoter"}
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            strokeWidth={1.5}
            className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-primary)] transition-colors shrink-0"
          />
        </Link>
      ))}
    </div>
  );
}
