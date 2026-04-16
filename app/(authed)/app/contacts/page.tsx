import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/get-profile";
import { getContacts } from "@/lib/contacts/queries";
import { getContactGroups } from "@/lib/contacts/groups";
import { ContactsTable } from "@/components/contacts/contacts-table";
import { NewContactSheet } from "@/components/contacts/new-contact-sheet";
import { EditContactSheet } from "@/components/contacts/edit-contact-sheet";
import { ActionErrorBanner } from "@/components/ui/action-error-banner";

type SearchParams = {
  error?: string | string[];
  novo?: string | string[];
  tab?: string | string[];
  group?: string | string[];
};

export default async function ContactsListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { user } = await getCurrentUser();
  const params = await searchParams;

  const tabRaw = params.tab;
  const activeGroupId = typeof tabRaw === "string" && tabRaw.length > 0 ? tabRaw : null;

  const [contacts, groups] = user
    ? await Promise.all([
        getContacts({ groupId: activeGroupId }),
        getContactGroups(),
      ])
    : [[], []];

  const raw = params.error;
  const actionError =
    typeof raw === "string" && raw.length > 0 ? decodeURIComponent(raw) : null;

  const novoRaw = params.novo;
  const novo = Array.isArray(novoRaw) ? novoRaw[0] : novoRaw;
  const newSheetOpen = novo === "1" || novo === "true";

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-8 sm:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[var(--color-text-primary)]">
            Contatos
          </h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            {contacts.length} {contacts.length === 1 ? "contato" : "contatos"} na base
          </p>
        </div>
      </header>

      {actionError && !newSheetOpen ? (
        <ActionErrorBanner message={actionError} />
      ) : null}

      <ContactsTable
        contacts={contacts}
        groups={groups}
        activeGroupId={activeGroupId}
      />

      <Suspense fallback={null}>
        <NewContactSheet />
      </Suspense>
      <Suspense fallback={null}>
        <EditContactSheet />
      </Suspense>
    </div>
  );
}
