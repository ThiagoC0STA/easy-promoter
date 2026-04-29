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

export type TeamActivity = {
  daily30: number[];
  recent: Array<{
    contact_name: string;
    promoter_name: string;
    when: string;
    days_ago: number;
  }>;
  segmentBreakdown: Array<{ key: string; label: string; count: number }>;
  rescueCount: number;
  newCount: number;
};

const SEGMENT_LABELS: Record<string, string> = {
  mailing: "Mailing",
  posta: "Posta",
  gasta_bem: "Gasta bem",
};

export async function getTeamActivity(): Promise<TeamActivity> {
  const supabase = await createServerSupabaseClient();

  const [profilesRes, contactsRes] = await Promise.all([
    supabase.from("profiles").select("id, display_name"),
    supabase
      .from("contacts")
      .select("owner_id, name, last_contacted_at, segments"),
  ]);

  if (profilesRes.error) throw profilesRes.error;
  if (contactsRes.error) throw contactsRes.error;

  const nameById = new Map<string, string>();
  for (const p of profilesRes.data ?? []) {
    nameById.set(p.id as string, (p.display_name as string | null) ?? "—");
  }

  const contacts = (contactsRes.data ?? []) as Array<{
    owner_id: string;
    name: string;
    last_contacted_at: string | null;
    segments: string[] | null;
  }>;

  const today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();
  const day = 24 * 60 * 60 * 1000;
  const daily30 = new Array(30).fill(0) as number[];

  const recentRaw: Array<{
    contact_name: string;
    promoter_name: string;
    when: string;
    days_ago: number;
    ts: number;
  }> = [];

  const segmentCounts = new Map<string, number>();
  let rescueCount = 0;
  let newCount = 0;

  for (const c of contacts) {
    if (!c.last_contacted_at) {
      newCount += 1;
    } else {
      const d = new Date(c.last_contacted_at);
      d.setHours(0, 0, 0, 0);
      const offset = Math.floor((today - d.getTime()) / day);
      if (offset >= 0 && offset < 30) {
        daily30[29 - offset] += 1;
      }
      if (offset >= 30) rescueCount += 1;
      const ts = new Date(c.last_contacted_at).getTime();
      recentRaw.push({
        contact_name: c.name,
        promoter_name: nameById.get(c.owner_id) ?? "—",
        when: c.last_contacted_at,
        days_ago: offset,
        ts,
      });
    }
    for (const s of c.segments ?? []) {
      segmentCounts.set(s, (segmentCounts.get(s) ?? 0) + 1);
    }
  }

  recentRaw.sort((a, b) => b.ts - a.ts);
  const recent = recentRaw.slice(0, 10).map(({ ts: _ts, ...r }) => r);

  const segmentBreakdown = Array.from(segmentCounts.entries())
    .map(([key, count]) => ({
      key,
      label: SEGMENT_LABELS[key] ?? key,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return { daily30, recent, segmentBreakdown, rescueCount, newCount };
}
