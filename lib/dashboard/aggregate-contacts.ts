import type { Contact } from "@/lib/contacts/types";
import { COOLDOWN_DAYS } from "@/lib/contacts/types";
import {
  daysSinceContact,
  getCooldownStatus,
  type CooldownStatus,
} from "@/lib/contacts/utils";

export type CooldownCounts = Record<CooldownStatus, number>;

export type RecencyBucket = "never" | "0_4" | "5_9" | "10_plus";

export type RecencyCounts = Record<RecencyBucket, number>;

const SEGMENT_KEYS = ["mailing", "posta", "gasta_bem"] as const;

export type SegmentKey = (typeof SEGMENT_KEYS)[number];

export function countByCooldown(contacts: Contact[]): CooldownCounts {
  const out: CooldownCounts = { cold: 0, warm: 0, hot: 0 };
  for (const c of contacts) {
    out[getCooldownStatus(c.last_contacted_at)]++;
  }
  return out;
}

export function countByRecencyBucket(contacts: Contact[]): RecencyCounts {
  const out: RecencyCounts = {
    never: 0,
    "0_4": 0,
    "5_9": 0,
    "10_plus": 0,
  };
  for (const c of contacts) {
    const days = daysSinceContact(c.last_contacted_at);
    if (days === null) {
      out.never++;
      continue;
    }
    if (days <= 4) out["0_4"]++;
    else if (days <= 9) out["5_9"]++;
    else out["10_plus"]++;
  }
  return out;
}

export function countBySegment(contacts: Contact[]): Record<SegmentKey, number> {
  const out: Record<SegmentKey, number> = {
    mailing: 0,
    posta: 0,
    gasta_bem: 0,
  };
  for (const c of contacts) {
    for (const key of SEGMENT_KEYS) {
      if (c.segments.includes(key)) out[key]++;
    }
  }
  return out;
}

export type GenreCount = { genre: string; count: number };

export function topGenres(contacts: Contact[], limit = 10): GenreCount[] {
  const map = new Map<string, number>();
  for (const c of contacts) {
    for (const g of c.genres) {
      const k = g.trim();
      if (!k) continue;
      map.set(k, (map.get(k) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function contactsWithWhatsapp(contacts: Contact[]): number {
  return contacts.filter((c) => c.whatsapp?.trim()).length;
}

export function contactsWithInstagram(contacts: Contact[]): number {
  return contacts.filter((c) => c.instagram?.trim()).length;
}

export { COOLDOWN_DAYS };
