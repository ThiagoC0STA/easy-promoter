import type { Contact } from "@/lib/contacts/types";
import { COOLDOWN_DAYS } from "@/lib/contacts/types";
import {
  daysSinceContact,
  daysUntilBirthday,
  isBirthdaySoon,
} from "@/lib/contacts/utils";

function needsAttention(contact: Contact): boolean {
  const days = daysSinceContact(contact.last_contacted_at);
  return days === null || days >= COOLDOWN_DAYS;
}

/**
 * Day queue rule (single source of truth for ordering):
 * 1. Include contacts that need attention (never contacted or cooldown elapsed)
 *    OR have a birthday within the next 7 days.
 * 2. Sort: birthday today first, then sooner birthdays, then longer time since contact
 *    (null "never" before larger day counts among attention-needed only when not bday-priority).
 * 3. Cap at `limit` (default 10).
 */
export function getDayQueue(contacts: Contact[], limit = 10): Contact[] {
  const candidates = contacts.filter(
    (c) => needsAttention(c) || isBirthdaySoon(c.birthday),
  );

  const scored = candidates.map((c) => {
    const bdaySoon = isBirthdaySoon(c.birthday);
    const dBirth = daysUntilBirthday(c.birthday);
    const days = daysSinceContact(c.last_contacted_at);
    const bdayScore =
      bdaySoon && dBirth !== null
        ? dBirth === 0
          ? 0
          : dBirth + 1
        : 999;
    const idleScore =
      days === null ? 10000 : Math.min(days, 9999);
    return { c, bdayScore, idleScore };
  });

  scored.sort((a, b) => {
    if (a.bdayScore !== b.bdayScore) return a.bdayScore - b.bdayScore;
    return b.idleScore - a.idleScore;
  });

  return scored.slice(0, limit).map((s) => s.c);
}
