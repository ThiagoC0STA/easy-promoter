import { getCurrentUser } from "@/lib/auth/get-profile";
import { getContacts } from "@/lib/contacts/queries";
import { PromoterDashboardV2 } from "@/components/dashboard-v2/promoter-dashboard-v2";
import {
  buildBuckets,
  dailyTouchSeries,
  getInsights,
  touchStreak,
} from "@/lib/contacts/queue";
import { countContactsTouchedInRollingDays } from "@/lib/dashboard/weekly-touch-stats";

export default async function PromoterDashboardPage() {
  const { user } = await getCurrentUser();
  const contacts = user ? await getContacts() : [];
  const { all, queue, birthdays, rescue, done } = buildBuckets(contacts);
  const touches7d = countContactsTouchedInRollingDays(contacts, 7);
  const series14 = dailyTouchSeries(contacts, 14);
  const streak = touchStreak(contacts);
  const insights = getInsights({ all, queue, birthdays, rescue, done, streak });

  return (
    <PromoterDashboardV2
      queue={queue}
      birthdays={birthdays}
      rescue={rescue}
      done={done}
      contacts={contacts}
      totalContacts={contacts.length}
      touches7d={touches7d}
      series14={series14}
      streak={streak}
      insights={insights}
    />
  );
}
