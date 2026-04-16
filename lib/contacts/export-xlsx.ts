import type { Contact } from "./types";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function formatLastContact(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export async function downloadContactsXlsx(
  contacts: Contact[],
  filenameBase = "contatos-easy-promoter",
) {
  const XLSX = await import("xlsx");

  const rows = contacts.map((c) => ({
    Nome: c.name,
    WhatsApp: c.whatsapp ?? "",
    Instagram: c.instagram ?? "",
    Aniversário: formatDate(c.birthday),
    Gêneros: c.genres.join(", "),
    Segmentos: c.segments.join(", "),
    "Último contato": formatLastContact(c.last_contacted_at),
    Frequência: c.frequency ?? "",
    "Gasta bem": c.spending ?? "",
    "Tipo de post": c.post_type ?? "",
    Alcance: c.reach ?? "",
    Confirmado: c.confirmed ?? "",
    Respondeu: c.responded ?? "",
    Notas: c.notes ?? "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto column widths
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => {
    const max = Math.max(
      key.length,
      ...rows.map((r) => String(r[key as keyof typeof r] ?? "").length),
    );
    return { wch: Math.min(max + 2, 40) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Contatos");

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filenameBase}-${stamp}.xlsx`);
}
