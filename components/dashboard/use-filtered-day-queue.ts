"use client";

import * as React from "react";
import type { Contact } from "@/lib/contacts/types";
import { getDayQueue } from "@/lib/dashboard/day-queue";

/** Top N contacts for the day queue (same rules as server `getDayQueue`). */
export function useFilteredDayQueue(
  contacts: Contact[],
  limit: number,
): Contact[] {
  return React.useMemo(
    () => getDayQueue(contacts, limit),
    [contacts, limit],
  );
}
