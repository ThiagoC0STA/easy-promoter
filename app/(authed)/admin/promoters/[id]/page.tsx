import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart2, User, Users } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getContactsByOwner } from "@/lib/contacts/queries";
import { getContactGroupsByOwner } from "@/lib/contacts/groups";
import { ContactsTable } from "@/components/contacts/contacts-table";
import { AdminPromoterDashboard } from "@/components/dashboard/admin-promoter-dashboard";
import type { Profile } from "@/lib/auth/types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string; tab?: string | string[] }>;
};

export default async function AdminPromoterPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, role, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!profile) notFound();

  const typedProfile = profile as Profile;
  const view = sp.view === "contacts" ? "contacts" : "dash";

  const tabRaw = sp.tab;
  const activeGroupId = typeof tabRaw === "string" && tabRaw.length > 0 ? tabRaw : null;

  const [contacts, groups] = await Promise.all([
    getContactsByOwner(id),
    getContactGroupsByOwner(id),
  ]);

  const filtered = activeGroupId
    ? contacts.filter((c) => c.group_id === activeGroupId)
    : contacts.filter((c) => !c.group_id);

  const base = `/admin/promoters/${id}`;

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 sm:py-14">
      {/* Back */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] mb-6 transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Voltar ao admin
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--color-accent-muted)]">
          <User size={20} strokeWidth={1.5} className="text-[var(--color-accent)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
            {typedProfile.display_name ?? "Sem nome"}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {contacts.length} contato{contacts.length !== 1 ? "s" : ""} · somente leitura
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--color-border-subtle)] mb-8">
        <Link
          href={base}
          className={`flex items-center gap-1.5 h-9 px-3 -mb-px text-sm font-medium border-b-2 transition-colors
            ${view === "dash"
              ? "border-[var(--color-accent)] text-[var(--color-text-primary)]"
              : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
        >
          <BarChart2 size={14} strokeWidth={1.75} />
          Dashboard
        </Link>
        <Link
          href={`${base}?view=contacts`}
          className={`flex items-center gap-1.5 h-9 px-3 -mb-px text-sm font-medium border-b-2 transition-colors
            ${view === "contacts"
              ? "border-[var(--color-accent)] text-[var(--color-text-primary)]"
              : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
        >
          <Users size={14} strokeWidth={1.75} />
          Contatos
        </Link>
      </div>

      {/* Content */}
      {view === "dash" ? (
        <AdminPromoterDashboard contacts={contacts} />
      ) : (
        <ContactsTable
          contacts={filtered}
          groups={groups}
          activeGroupId={activeGroupId}
          readOnly
          showAddButton={false}
        />
      )}
    </div>
  );
}
