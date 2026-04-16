const STORAGE_KEY = "ep_followup_date_v1";

export const FOLLOWUP_CHANGED_EVENT = "ep-followup-date-changed";

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FOLLOWUP_CHANGED_EVENT));
}

function readMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
  emit();
}

/** Next planned contact date YYYY-MM-DD, or null. */
export function getFollowUpDate(contactId: string): string | null {
  const map = readMap();
  return map[contactId] ?? null;
}

export function setFollowUpDate(contactId: string, date: string | null): void {
  const map = readMap();
  if (!date || !date.trim()) {
    if (!(contactId in map)) return;
    delete map[contactId];
    writeMap(map);
    return;
  }
  map[contactId] = date.trim();
  writeMap(map);
}
