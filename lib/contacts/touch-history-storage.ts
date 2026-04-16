export type TouchHistoryKind =
  | "whatsapp_opened"
  | "instagram_opened"
  | "touch_confirmed";

export type TouchHistoryEntry = {
  at: string;
  kind: TouchHistoryKind;
};

const STORAGE_KEY = "ep_touch_history_v1";
const MAX_PER_CONTACT = 40;

export const TOUCH_HISTORY_CHANGED_EVENT = "ep-touch-history-changed";

function emitChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOUCH_HISTORY_CHANGED_EVENT));
}

function readAll(): Record<string, TouchHistoryEntry[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, TouchHistoryEntry[]>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, TouchHistoryEntry[]>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}

export function appendTouchHistoryEntry(
  contactId: string,
  kind: TouchHistoryKind,
): void {
  const all = readAll();
  const prev = Array.isArray(all[contactId]) ? [...all[contactId]] : [];
  const entry: TouchHistoryEntry = {
    at: new Date().toISOString(),
    kind,
  };
  const next = [entry, ...prev].slice(0, MAX_PER_CONTACT);
  all[contactId] = next;
  writeAll(all);
  emitChanged();
}

export function getTouchHistory(contactId: string): TouchHistoryEntry[] {
  const all = readAll();
  const list = all[contactId];
  return Array.isArray(list) ? list : [];
}
