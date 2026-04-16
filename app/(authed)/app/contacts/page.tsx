import Link from "next/link";
import { Suspense } from "react";
import { Users } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { getCurrentUser } from "@/lib/auth/get-profile";
import { getContacts } from "@/lib/contacts/queries";
import { ContactsTable } from "@/components/contacts/contacts-table";
import { NewContactSheet } from "@/components/contacts/new-contact-sheet";
import { ActionErrorBanner } from "@/components/ui/action-error-banner";

type SearchParams = { error?: string | string[]; novo?: string | string[] };

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
  const novoRaw = params.novo;
  const novo = Array.isArray(novoRaw) ? novoRaw[0] : novoRaw;
  const newSheetOpen = novo === "1" || novo === "true";

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 sm:py-14">
      <PageHero
        size="md"
        title="Contatos"
        description={
          <>
            Gerencie a base, refine com busca e filtros, e abra WhatsApp ou Instagram com
            um toque.
          </>
        }
        icon={
          <Users size={22} strokeWidth={1.5} className="text-[var(--color-accent)]" />
        }
      >
        <p className="text-xs text-[var(--color-text-tertiary)]">
          <Link
            href="/app/contacts/import"
            className="font-medium text-[var(--color-accent)] hover:underline"
          >
            Importar CSV
          </Link>
          {" · "}
          Export disponível na lista após carregar os contatos.
        </p>
      </PageHero>

      {actionError && !newSheetOpen ? (
        <ActionErrorBanner message={actionError} />
      ) : null}

      <ContactsTable contacts={contacts} />

      <Suspense fallback={null}>
        <NewContactSheet />
      </Suspense>
    </div>
  );
}
