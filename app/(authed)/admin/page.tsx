import { AdminDashboardV2 } from "@/components/admin-v2/admin-dashboard-v2";
import { getPromoterStats, getTeamActivity } from "@/lib/admin/queries";
import { getCurrentProfile } from "@/lib/auth/get-profile";

export default async function AdminHomePage() {
  const [stats, activity, currentProfile] = await Promise.all([
    getPromoterStats(),
    getTeamActivity(),
    getCurrentProfile(),
  ]);

  return (
    <AdminDashboardV2
      stats={stats}
      activity={activity}
      currentUserId={currentProfile?.id ?? ""}
    />
  );
}
