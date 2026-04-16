import Link from "next/link";
import { Activity, ScrollText, Shield, Users } from "lucide-react";
import { InviteForm } from "@/components/admin/invite-form";
import { PromotersList } from "@/components/admin/promoters-list";
import { getPromoters } from "@/lib/admin/queries";

export default async function AdminHomePage() {
  const promoters = await getPromoters();

  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-10 sm:py-14">
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[color-mix(in_srgb,var(--color-accent)_22%,transparent)] to-[color-mix(in_srgb,var(--color-accent-light)_18%,transparent)]"
        >
          <Shield size={20} strokeWidth={1.5} className="text-[var(--color-accent)]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Super admin
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Convites e visão geral dos promoters
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8 text-sm">
        <Link
          href="/admin/changelog"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-control)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
        >
          <ScrollText size={16} strokeWidth={1.5} aria-hidden />
          Changelog
        </Link>
        <Link
          href="/admin/health"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-control)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
        >
          <Activity size={16} strokeWidth={1.5} aria-hidden />
          Saúde do app
        </Link>
      </div>

      <div className="flex flex-col gap-10">
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] mb-4">
            Enviar convite
          </h2>
          <InviteForm />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} strokeWidth={1.5} className="text-[var(--color-text-tertiary)]" />
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
              Promoters ({promoters.length})
            </h2>
          </div>
          <PromotersList promoters={promoters} />
        </section>
      </div>
    </div>
  );
}
