import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getContactsByOwner } from "@/lib/contacts/queries";
import { ContactsTable } from "@/components/contacts/contacts-table";
import type { Profile } from "@/lib/auth/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminPromoterContactsPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, role, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const typedProfile = profile as Profile;
  const contacts = await getContactsByOwner(id);

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 sm:py-14">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] mb-6 transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Voltar ao admin
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--color-accent-muted)]">
          <User size={20} strokeWidth={1.5} className="text-[var(--color-accent)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
            {typedProfile.display_name ?? "Sem nome"}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {contacts.length} contato{contacts.length !== 1 ? "s" : ""} (somente leitura)
          </p>
        </div>
      </div>

      <ContactsTable contacts={contacts} readOnly showAddButton={false} />
    </div>
  );
}
