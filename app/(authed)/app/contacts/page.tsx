import { Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/get-profile";
import { getContacts } from "@/lib/contacts/queries";
import { ContactsTable } from "@/components/contacts/contacts-table";

export default async function ContactsListPage() {
  const { user } = await getCurrentUser();
  const contacts = user ? await getContacts() : [];

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10 sm:py-14">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#6c5ce7]/20 to-[#8b7cf6]/20">
          <Users size={20} strokeWidth={1.5} className="text-[var(--color-accent)]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Contatos
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {user?.email}
          </p>
        </div>
      </div>

      <ContactsTable contacts={contacts} />
    </div>
  );
}
