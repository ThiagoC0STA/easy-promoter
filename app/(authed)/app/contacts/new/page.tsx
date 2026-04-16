import { ContactForm } from "@/components/contacts/contact-form";

type SearchParams = { error?: string | string[] };

export default async function NewContactPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const raw = params.error;
  const actionError =
    typeof raw === "string" && raw.length > 0 ? decodeURIComponent(raw) : null;

  return <ContactForm actionError={actionError} />;
}
