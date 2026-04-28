import Link from "next/link";
import { Activity, ScrollText } from "lucide-react";
import { AdminAddUserTabs } from "@/components/admin/admin-add-user-tabs";
import { PromotersList } from "@/components/admin/promoters-list";
import { PromoterStatsTable } from "@/components/admin/promoter-stats-table";
import { getPromoters, getPromoterStats } from "@/lib/admin/queries";

export default async function AdminHomePage() {
  const [promoters, stats] = await Promise.all([getPromoters(), getPromoterStats()]);

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-8 sm:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[var(--color-text-primary)]">
            Super admin
          </h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            Adicionar usuários e visão geral dos promoters
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/admin/changelog"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-control)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-tertiary)] transition-colors"
          >
            <ScrollText size={14} strokeWidth={1.75} aria-hidden />
            Changelog
          </Link>
          <Link
            href="/admin/health"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-control)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-tertiary)] transition-colors"
          >
            <Activity size={14} strokeWidth={1.75} aria-hidden />
            Saúde
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
            Adicionar usuário
          </h2>
          <AdminAddUserTabs />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
            Dashboard de performance
          </h2>
          <PromoterStatsTable stats={stats} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
            Promoters <span className="text-[var(--color-text-tertiary)] font-normal">· {promoters.length}</span>
          </h2>
          <PromotersList promoters={promoters} />
        </section>
      </div>
    </div>
  );
}
