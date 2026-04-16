import type { Contact } from "@/lib/contacts/types";
import { wasContactedWithinRollingDays } from "@/lib/contacts/utils";

/** Contacts whose `last_contacted_at` was updated within the last `days` days (rolling). */
export function countContactsTouchedInRollingDays(
  contacts: Contact[],
  days: number,
): number {
  return contacts.filter((c) => wasContactedWithinRollingDays(c.last_contacted_at, days))
    .length;
}
