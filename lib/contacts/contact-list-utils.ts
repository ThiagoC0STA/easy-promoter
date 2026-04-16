import type { Contact } from "./types";
import { COOLDOWN_DAYS } from "./types";
import { daysSinceContact, isBirthdaySoon } from "./utils";

export type ListCooldownFilter = "all" | "never" | "hot" | "warm" | "cold";
export type ChannelPresenceFilter = "all" | "yes" | "no";
export type ListSortBy = "last_contacted_at" | "name" | "birthday" | "created_at";
export type ListSortDir = "asc" | "desc";

export type ContactListFilters = {
  search: string;
  genres: string[];
  segments: string[];
  cooldown: ListCooldownFilter;
  birthdaySoon: boolean;
  whatsapp: ChannelPresenceFilter;
  instagram: ChannelPresenceFilter;
  frequency: string;
  spending: string;
  sortBy: ListSortBy;
  sortDir: ListSortDir;
};

export const DEFAULT_CONTACT_LIST_FILTERS: ContactListFilters = {
  search: "",
  genres: [],
  segments: [],
  cooldown: "all",
  birthdaySoon: false,
  whatsapp: "all",
  instagram: "all",
  frequency: "",
  spending: "",
  sortBy: "last_contacted_at",
  sortDir: "asc",
};

export const SORT_PRESET_OPTIONS: {
  value: `${ListSortBy}|${ListSortDir}`;
  label: string;
}[] = [
  {
    value: "last_contacted_at|asc",
    label: "Último contato: mais tempo sem contato primeiro",
  },
  {
    value: "last_contacted_at|desc",
    label: "Último contato: contatos recentes primeiro",
  },
  { value: "name|asc", label: "Nome: A a Z" },
  { value: "name|desc", label: "Nome: Z a A" },
  {
    value: "birthday|asc",
    label: "Aniversário: ordem no calendário (jan. a dez.)",
  },
  {
    value: "birthday|desc",
    label: "Aniversário: ordem inversa no calendário",
  },
  { value: "created_at|desc", label: "Cadastro: mais novos primeiro" },
  { value: "created_at|asc", label: "Cadastro: mais antigos primeiro" },
];

export function formatSortPreset(sortBy: ListSortBy, sortDir: ListSortDir): string {
  return `${sortBy}|${sortDir}`;
}

export function parseSortPreset(v: string): {
  sortBy: ListSortBy;
  sortDir: ListSortDir;
} {
  const [sortBy, sortDir] = v.split("|") as [ListSortBy, ListSortDir];
  if (
    sortBy !== "last_contacted_at" &&
    sortBy !== "name" &&
    sortBy !== "birthday" &&
    sortBy !== "created_at"
  ) {
    return {
      sortBy: DEFAULT_CONTACT_LIST_FILTERS.sortBy,
      sortDir: DEFAULT_CONTACT_LIST_FILTERS.sortDir,
    };
  }
  if (sortDir !== "asc" && sortDir !== "desc") {
    return {
      sortBy: DEFAULT_CONTACT_LIST_FILTERS.sortBy,
      sortDir: DEFAULT_CONTACT_LIST_FILTERS.sortDir,
    };
  }
  return { sortBy, sortDir };
}

function cooldownBucket(
  days: number | null,
): "never" | "hot" | "warm" | "cold" {
  if (days === null) return "never";
  if (days >= COOLDOWN_DAYS) return "cold";
  if (days >= COOLDOWN_DAYS / 2) return "warm";
  return "hot";
}

function matchesCooldown(c: Contact, f: ListCooldownFilter): boolean {
  if (f === "all") return true;
  const days = daysSinceContact(c.last_contacted_at);
  const bucket = cooldownBucket(days);
  if (f === "never") return bucket === "never";
  if (f === "hot") return bucket === "hot";
  if (f === "warm") return bucket === "warm";
  if (f === "cold") return bucket === "cold";
  return true;
}

function matchesSearch(c: Contact, q: string): boolean {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  if (c.name.toLowerCase().includes(t)) return true;
  const wa = (c.whatsapp ?? "").replace(/\D/g, "");
  const digits = t.replace(/\D/g, "");
  if (digits.length >= 4 && wa.includes(digits)) return true;
  const handle = (c.instagram ?? "").toLowerCase().replace(/^@/, "");
  const ht = t.replace(/^@/, "");
  if (handle && handle.includes(ht)) return true;
  return false;
}

function matchesChannel(
  val: string | null,
  f: ChannelPresenceFilter,
): boolean {
  if (f === "all") return true;
  const has = Boolean(val && val.trim().length > 0);
  if (f === "yes") return has;
  return !has;
}

export function filterContactsForList(
  contacts: Contact[],
  filters: Omit<ContactListFilters, "sortBy" | "sortDir">,
): Contact[] {
  return contacts.filter((c) => {
    if (!matchesSearch(c, filters.search)) return false;
    if (
      filters.genres.length > 0 &&
      !filters.genres.some((g) => c.genres.includes(g))
    ) {
      return false;
    }
    if (
      filters.segments.length > 0 &&
      !filters.segments.some((s) => c.segments.includes(s))
    ) {
      return false;
    }
    if (!matchesCooldown(c, filters.cooldown)) return false;
    if (filters.birthdaySoon && !isBirthdaySoon(c.birthday)) return false;
    if (!matchesChannel(c.whatsapp, filters.whatsapp)) return false;
    if (!matchesChannel(c.instagram, filters.instagram)) return false;
    if (filters.frequency && (c.frequency ?? "") !== filters.frequency) {
      return false;
    }
    if (filters.spending && (c.spending ?? "") !== filters.spending) {
      return false;
    }
    return true;
  });
}

function parseBirthdayMD(birthday: string | null): number | null {
  if (!birthday || birthday.length < 10) return null;
  const m = Number(birthday.slice(5, 7));
  const d = Number(birthday.slice(8, 10));
  if (!Number.isFinite(m) || !Number.isFinite(d)) return null;
  return m * 100 + d;
}

export function sortContactsForList(
  contacts: Contact[],
  sortBy: ListSortBy,
  sortDir: ListSortDir,
): Contact[] {
  const mul = sortDir === "asc" ? 1 : -1;
  return [...contacts].sort((a, b) => {
    if (sortBy === "name") {
      return (
        mul *
        a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
      );
    }
    if (sortBy === "created_at") {
      return mul * a.created_at.localeCompare(b.created_at);
    }
    if (sortBy === "birthday") {
      const ka = parseBirthdayMD(a.birthday);
      const kb = parseBirthdayMD(b.birthday);
      if (ka === null && kb === null) return 0;
      if (ka === null) return 1;
      if (kb === null) return -1;
      return mul * (ka - kb);
    }
    const ta = a.last_contacted_at
      ? new Date(a.last_contacted_at).getTime()
      : null;
    const tb = b.last_contacted_at
      ? new Date(b.last_contacted_at).getTime()
      : null;
    if (sortDir === "asc") {
      if (ta === null && tb === null) return 0;
      if (ta === null) return -1;
      if (tb === null) return 1;
      return ta - tb;
    }
    if (ta === null && tb === null) return 0;
    if (ta === null) return 1;
    if (tb === null) return -1;
    return tb - ta;
  });
}

export function applyContactListQuery(
  contacts: Contact[],
  filters: ContactListFilters,
): Contact[] {
  const { sortBy, sortDir, ...rest } = filters;
  const filtered = filterContactsForList(contacts, rest);
  return sortContactsForList(filtered, sortBy, sortDir);
}

export function isDefaultContactListFilters(f: ContactListFilters): boolean {
  return (
    f.search === DEFAULT_CONTACT_LIST_FILTERS.search &&
    f.genres.length === 0 &&
    f.segments.length === 0 &&
    f.cooldown === "all" &&
    !f.birthdaySoon &&
    f.whatsapp === "all" &&
    f.instagram === "all" &&
    f.frequency === "" &&
    f.spending === "" &&
    f.sortBy === DEFAULT_CONTACT_LIST_FILTERS.sortBy &&
    f.sortDir === DEFAULT_CONTACT_LIST_FILTERS.sortDir
  );
}

export function contactListFiltersBadgeCount(f: ContactListFilters): number {
  let n = f.genres.length + f.segments.length;
  if (f.search.trim()) n += 1;
  if (f.cooldown !== "all") n += 1;
  if (f.birthdaySoon) n += 1;
  if (f.whatsapp !== "all") n += 1;
  if (f.instagram !== "all") n += 1;
  if (f.frequency) n += 1;
  if (f.spending) n += 1;
  if (
    f.sortBy !== DEFAULT_CONTACT_LIST_FILTERS.sortBy ||
    f.sortDir !== DEFAULT_CONTACT_LIST_FILTERS.sortDir
  ) {
    n += 1;
  }
  return n;
}
