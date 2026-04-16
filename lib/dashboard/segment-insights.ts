import type { Contact } from "@/lib/contacts/types";
import { daysSinceContact } from "@/lib/contacts/utils";

const SEGMENT_LABELS: Record<string, string> = {
  mailing: "Mailing",
  posta: "Posta",
  gasta_bem: "Gasta bem",
};

const STALE_DAYS = 14;

/**
 * One-line insights per segment: share with no touch in 14+ days (or never).
 */
export function buildSegmentInsightLines(contacts: Contact[]): string[] {
  const lines: string[] = [];
  if (contacts.length === 0) return lines;

  for (const key of ["mailing", "posta", "gasta_bem"] as const) {
    const label = SEGMENT_LABELS[key];
    const inSeg = contacts.filter((c) => c.segments.includes(key));
    if (inSeg.length === 0) continue;

    const stale = inSeg.filter((c) => {
      const d = daysSinceContact(c.last_contacted_at);
      return d === null || d >= STALE_DAYS;
    });
    const pct = Math.round((stale.length / inSeg.length) * 100);
    lines.push(
      `${label}: ${pct}% (${stale.length}/${inSeg.length}) sem contato há ${STALE_DAYS}+ dias ou sem registro.`,
    );
  }

  return lines;
}
