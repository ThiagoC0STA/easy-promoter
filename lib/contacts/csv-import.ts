/**
 * Minimal CSV parser (comma, double-quote). First row = headers.
 */

function parseRow(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur.trim());
  return cells;
}

export type ParsedImportRow = Record<string, string>;

export function parseContactsCsv(text: string): {
  headers: string[];
  rows: ParsedImportRow[];
  error?: string;
} {
  const normalized = text.replace(/^\uFEFF/, "").trim();
  if (!normalized) {
    return { headers: [], rows: [], error: "Arquivo vazio." };
  }

  const lines = normalized.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      headers: [],
      rows: [],
      error: "Precisa de cabeçalho e pelo menos uma linha de dados.",
    };
  }

  const headers = parseRow(lines[0]).map((h) => h.toLowerCase().trim());
  if (!headers.includes("name") && !headers.includes("nome")) {
    return {
      headers,
      rows: [],
      error: 'Coluna obrigatória: use "name" ou "nome" no cabeçalho.',
    };
  }

  const nameKey = headers.includes("name") ? "name" : "nome";
  const rows: ParsedImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseRow(lines[i]);
    if (cells.every((c) => c === "")) continue;
    const row: ParsedImportRow = {};
    headers.forEach((h, j) => {
      row[h] = cells[j] ?? "";
    });
    const nm = (row[nameKey] ?? "").trim();
    if (!nm) continue;
    rows.push(row);
  }

  return { headers, rows };
}

const SEGMENT_ALIASES: Record<string, string> = {
  mailing: "mailing",
  posta: "posta",
  "gasta bem": "gasta_bem",
  gasta_bem: "gasta_bem",
};

export type ImportContactPayload = {
  name: string;
  whatsapp: string | null;
  instagram: string | null;
  birthday: string | null;
  segments: string[];
};

export function parsedRowToImportPayload(row: ParsedImportRow): ImportContactPayload {
  const name = (row.name ?? row.nome ?? "").trim();
  const whats = (row.whatsapp ?? row.telefone ?? "").trim() || null;
  const insta = (row.instagram ?? row.ig ?? "").trim() || null;
  const bday = (row.birthday ?? row.aniversario ?? row.nascimento ?? "").trim() || null;
  const segRaw = (row.segments ?? row.segmentos ?? "").trim();
  const segments: string[] = [];
  if (segRaw) {
    for (const part of segRaw.split(/[;,]/)) {
      const k = part.trim().toLowerCase();
      const mapped = SEGMENT_ALIASES[k];
      if (mapped && !segments.includes(mapped)) segments.push(mapped);
    }
  }
  return {
    name,
    whatsapp: whats,
    instagram: insta,
    birthday: bday,
    segments,
  };
}
