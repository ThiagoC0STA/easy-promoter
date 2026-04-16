import { notFound } from "next/navigation";
import { getContactById } from "@/lib/contacts/queries";
import { ContactForm } from "@/components/contacts/contact-form";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function EditContactPage({ params, searchParams }: Props) {
  const { id } = await params;
  const contact = await getContactById(id);

  if (!contact) {
    notFound();
  }

  const sp = await searchParams;
  const raw = sp.error;
  const actionError =
    typeof raw === "string" && raw.length > 0 ? decodeURIComponent(raw) : null;

  return <ContactForm contact={contact} actionError={actionError} />;
}
