"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Shield, Trash2, User } from "lucide-react";
import type { Profile } from "@/lib/auth/types";

type Props = {
  promoters: Profile[];
};

export function PromotersList({ promoters }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  async function handleDelete(p: Profile) {
    const label = p.display_name ?? p.id;
    if (!confirm(`Deletar "${label}"? Todos os contatos dele serão removidos. Essa ação é irreversível.`)) return;

    setDeletingId(p.id);
    try {
      const res = await fetch(`/api/admin/users/${p.id}`, { method: "DELETE" });
      const json = await res.json() as { ok: boolean; error?: string };
      if (!json.ok) {
        alert(json.error ?? "Erro ao deletar usuário.");
        return;
      }
      router.refresh();
    } catch {
      alert("Erro de rede. Tente de novo.");
    } finally {
      setDeletingId(null);
    }
  }

  if (promoters.length === 0) {
    return (
      <div className="glass-card rounded-[var(--radius-card)] p-8 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">Nenhum promoter cadastrado.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden">
      {promoters.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--color-border-subtle)] last:border-b-0 hover:bg-[var(--color-surface-secondary)]/60 transition-colors group"
        >
          <Link
            href={`/admin/promoters/${p.id}`}
            className="flex items-center gap-3 min-w-0 flex-1 no-underline"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              p.role === "super_admin"
                ? "bg-amber-500/10 text-amber-500"
                : "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
            }`}>
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
            <ChevronRight size={18} strokeWidth={1.5} className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-primary)] transition-colors shrink-0 ml-auto" />
          </Link>

          <button
            type="button"
            onClick={() => void handleDelete(p)}
            disabled={deletingId === p.id}
            title="Deletar usuário"
            className="ml-2 h-8 w-8 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)]
                       hover:text-[var(--color-error)] hover:bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)]
                       transition-colors cursor-pointer disabled:opacity-40 shrink-0"
          >
            <Trash2 size={14} strokeWidth={1.75} />
          </button>
        </div>
      ))}
    </div>
  );
}
