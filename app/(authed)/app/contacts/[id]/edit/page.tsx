import { notFound } from "next/navigation";
import { getContactById } from "@/lib/contacts/queries";
import { ContactForm } from "@/components/contacts/contact-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditContactPage({ params }: Props) {
  const { id } = await params;
  const contact = await getContactById(id);

  if (!contact) {
    notFound();
  }

  return <ContactForm contact={contact} />;
}
