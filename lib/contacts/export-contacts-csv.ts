import type { Contact } from "@/lib/contacts/types";

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const HEADERS = [
  "id",
  "name",
  "whatsapp",
  "instagram",
  "birthday",
  "genres",
  "segments",
  "frequency",
  "spending",
  "post_type",
  "reach",
  "confirmed",
  "responded",
  "last_contacted_at",
  "notes",
  "created_at",
  "updated_at",
] as const;

/**
 * Builds CSV (UTF-8 with BOM) for Excel and PT-BR locale.
 */
export function buildContactsCsv(contacts: Contact[]): string {
  const lines: string[] = [];
  lines.push(HEADERS.join(","));

  for (const c of contacts) {
    const row = [
      c.id,
      c.name,
      c.whatsapp ?? "",
      c.instagram ?? "",
      c.birthday ?? "",
      c.genres.join(";"),
      c.segments.join(";"),
      c.frequency ?? "",
      c.spending ?? "",
      c.post_type ?? "",
      c.reach ?? "",
      c.confirmed ?? "",
      c.responded ?? "",
      c.last_contacted_at ?? "",
      c.notes ?? "",
      c.created_at,
      c.updated_at,
    ].map((v) => csvEscape(String(v)));
    lines.push(row.join(","));
  }

  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

export function downloadContactsCsv(contacts: Contact[], filenameBase = "contatos-easy-promoter") {
  const csv = buildContactsCsv(contacts);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `${filenameBase}-${stamp}.csv`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
