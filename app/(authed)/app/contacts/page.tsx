import { Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/get-profile";
import { getContacts } from "@/lib/contacts/queries";
import { ContactsTable } from "@/components/contacts/contacts-table";
import { ActionErrorBanner } from "@/components/ui/action-error-banner";

type SearchParams = { error?: string | string[] };

export default async function ContactsListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { user } = await getCurrentUser();
  const contacts = user ? await getContacts() : [];
  const params = await searchParams;
  const raw = params.error;
  const actionError =
    typeof raw === "string" && raw.length > 0 ? decodeURIComponent(raw) : null;

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 sm:py-14">
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[color-mix(in_srgb,var(--color-accent)_22%,transparent)] to-[color-mix(in_srgb,var(--color-accent-light)_18%,transparent)]"
        >
          <Users size={20} strokeWidth={1.5} className="text-[var(--color-accent)]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Contatos
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-xl">
            Gerencie a base, refine com busca e filtros, e abra WhatsApp ou Instagram
            com um toque.
          </p>
        </div>
      </div>

      {actionError ? <ActionErrorBanner message={actionError} /> : null}

      <ContactsTable contacts={contacts} />
    </div>
  );
}
