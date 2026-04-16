import { getCurrentUser } from "@/lib/auth/get-profile";
import { getContacts } from "@/lib/contacts/queries";
import { PromoterDashboard } from "@/components/dashboard/promoter-dashboard";

export default async function PromoterDashboardPage() {
  const { user } = await getCurrentUser();
  const contacts = user ? await getContacts() : [];

  return <PromoterDashboard contacts={contacts} />;
}
