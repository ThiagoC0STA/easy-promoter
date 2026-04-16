import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/auth/types";

export async function getPromoters(): Promise<Profile[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, role, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Profile[];
}

export type PromoterStat = {
  promoter_id: string;
  display_name: string | null;
  role: string;
  total_contacts: number;
  touched_last_30d: number;
  contacts_with_whatsapp: number;
  contacts_with_instagram: number;
  created_at: string;
};

export async function getPromoterStats(): Promise<PromoterStat[]> {
  const supabase = await createServerSupabaseClient();

  const [profilesRes, contactsRes] = await Promise.all([
    supabase.from("profiles").select("id, display_name, role, created_at").order("created_at", { ascending: true }),
    supabase.from("contacts").select("owner_id, last_contacted_at, whatsapp, instagram"),
  ]);

  if (profilesRes.error) throw profilesRes.error;
  if (contactsRes.error) throw contactsRes.error;

  const profiles = profilesRes.data ?? [];
  const contacts = contactsRes.data ?? [];

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const statsMap = new Map<string, Omit<PromoterStat, "display_name" | "role" | "created_at">>();
  for (const c of contacts) {
    const oid: string = c.owner_id;
    if (!statsMap.has(oid)) {
      statsMap.set(oid, { promoter_id: oid, total_contacts: 0, touched_last_30d: 0, contacts_with_whatsapp: 0, contacts_with_instagram: 0 });
    }
    const s = statsMap.get(oid)!;
    s.total_contacts++;
    if (c.last_contacted_at && c.last_contacted_at >= cutoff) s.touched_last_30d++;
    if (c.whatsapp) s.contacts_with_whatsapp++;
    if (c.instagram) s.contacts_with_instagram++;
  }

  return profiles.map((p) => {
    const s = statsMap.get(p.id) ?? { promoter_id: p.id, total_contacts: 0, touched_last_30d: 0, contacts_with_whatsapp: 0, contacts_with_instagram: 0 };
    return {
      ...s,
      display_name: p.display_name,
      role: p.role,
      created_at: p.created_at,
    };
  }).sort((a, b) => b.total_contacts - a.total_contacts);
}
