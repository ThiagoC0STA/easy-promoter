export type ColumnKey =
  | "name"
  | "tags"
  | "last_contact"
  | "birthday"
  | "frequency"
  | "spending"
  | "notes";

export type ColumnDef = {
  key: ColumnKey;
  label: string;
  defaultVisible: boolean;
  removable: boolean;
};

export const ALL_COLUMNS: ColumnDef[] = [
  { key: "name",         label: "Nome",                defaultVisible: true,  removable: false },
  { key: "tags",         label: "Gêneros",             defaultVisible: true,  removable: true },
  { key: "last_contact", label: "Último contato",      defaultVisible: true,  removable: true },
  { key: "birthday",     label: "Aniversário",         defaultVisible: false, removable: true },
  { key: "frequency",    label: "Frequência",          defaultVisible: false, removable: true },
  { key: "spending",     label: "Gasta bem",           defaultVisible: false, removable: true },
  { key: "notes",        label: "Notas",               defaultVisible: false, removable: true },
];

export const DEFAULT_VISIBLE = ALL_COLUMNS
  .filter((c) => c.defaultVisible)
  .map((c) => c.key);

/** CSS grid-template-columns used by both header and row — set as --ep-cgrid on the container. */
export function getContactGridTemplate(visibleCols: ColumnKey[]): string {
  const dataKeys = visibleCols.filter((k) => k !== "name");
  return [
    "minmax(120px,2.2fr)",
    ...dataKeys.map(() => "minmax(0,2fr)"),
    "32px", // single 3-dot actions button
  ].join(" ");
}

export function loadColumnVisibility(groupId: string | null): ColumnKey[] {
  if (typeof window === "undefined") return DEFAULT_VISIBLE;
  try {
    const key = `ep_cols_${groupId ?? "geral"}`;
    const raw = window.localStorage.getItem(key);
    if (!raw) return DEFAULT_VISIBLE;
    const parsed = JSON.parse(raw) as ColumnKey[];
    if (!parsed.includes("name")) parsed.unshift("name");
    return parsed.filter((k): k is ColumnKey =>
      ALL_COLUMNS.some((c) => c.key === k)
    );
  } catch {
    return DEFAULT_VISIBLE;
  }
}

export function saveColumnVisibility(groupId: string | null, cols: ColumnKey[]) {
  try {
    const key = `ep_cols_${groupId ?? "geral"}`;
    window.localStorage.setItem(key, JSON.stringify(cols));
  } catch {
    /* ignore */
  }
}
