/**
 * Smart import: accepts .xlsx, .xls, .csv — fuzzy-maps columns to Contact fields.
 */

export type ImportContactPayload = {
  name: string;
  whatsapp: string | null;
  instagram: string | null;
  birthday: string | null;
  segments: string[];
  genres: string[];
  notes: string | null;
};

export type ImportPreviewRow = ImportContactPayload & { _raw: Record<string, string> };

// Maps known column name variations → canonical field
const FIELD_ALIASES: Record<string, keyof ImportContactPayload> = {
  // name
  nome: "name", name: "name", contato: "name", pessoa: "name", cliente: "name",
  // whatsapp
  whatsapp: "whatsapp", zap: "whatsapp", wpp: "whatsapp", telefone: "whatsapp",
  celular: "whatsapp", fone: "whatsapp", tel: "whatsapp", phone: "whatsapp",
  número: "whatsapp", numero: "whatsapp",
  // instagram
  instagram: "instagram", insta: "instagram", ig: "instagram", "@": "instagram",
  perfil: "instagram",
  // birthday
  aniversario: "birthday", aniversário: "birthday", nascimento: "birthday",
  birthday: "birthday", nasc: "birthday", data_nasc: "birthday",
  // segments
  segmentos: "segments", segments: "segments", segmento: "segments",
  // genres
  generos: "genres", gêneros: "genres", genres: "genres", genero: "genres",
  "gênero": "genres", musica: "genres", música: "genres", estilo: "genres",
  // notes
  notas: "notes", notes: "notes", observações: "notes", observacoes: "notes",
  obs: "notes", nota: "notes",
};

const SEGMENT_ALIASES: Record<string, string> = {
  mailing: "mailing",
  posta: "posta",
  "gasta bem": "gasta_bem",
  gasta_bem: "gasta_bem",
};

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9@_]/g, "")
    .trim();
}

function mapHeader(raw: string): keyof ImportContactPayload | null {
  const norm = normalizeHeader(raw);
  return (FIELD_ALIASES[norm] as keyof ImportContactPayload) ?? null;
}

function parseDate(raw: string): string | null {
  if (!raw) return null;
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  // DD/MM/YYYY or DD/MM/YY
  const dmy = raw.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const year = y.length === 2 ? `19${y}` : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // Excel serial number
  const serial = Number(raw);
  if (!isNaN(serial) && serial > 1000) {
    const date = new Date((serial - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }
  return null;
}

function parseSegments(raw: string): string[] {
  return raw.split(/[;,]/).flatMap((s) => {
    const k = s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return SEGMENT_ALIASES[k] ? [SEGMENT_ALIASES[k]] : [];
  });
}

function parsePhone(raw: string): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return digits;
}

function parseInstagram(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Remove leading @ if present (we'll add it back later or store without)
  return trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
}

export type ColumnMapping = Record<string, keyof ImportContactPayload | null>;

export function detectColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const used = new Set<string>();
  for (const h of headers) {
    const field = mapHeader(h);
    if (field && !used.has(field)) {
      mapping[h] = field;
      used.add(field);
    } else {
      mapping[h] = null;
    }
  }
  return mapping;
}

export function parseRows(
  rawRows: Record<string, string>[],
  mapping: ColumnMapping,
): ImportPreviewRow[] {
  const results: ImportPreviewRow[] = [];

  for (const raw of rawRows) {
    const partial: Partial<ImportContactPayload> & { _raw: Record<string, string> } = { _raw: raw };

    for (const [col, field] of Object.entries(mapping)) {
      if (!field) continue;
      const val = (raw[col] ?? "").trim();
      if (!val) continue;

      switch (field) {
        case "name": partial.name = partial.name ?? val; break;
        case "whatsapp": partial.whatsapp = parsePhone(val); break;
        case "instagram": partial.instagram = parseInstagram(val); break;
        case "birthday": partial.birthday = parseDate(val); break;
        case "segments": partial.segments = parseSegments(val); break;
        case "genres": partial.genres = val.split(/[;,]/).map((g) => g.trim()).filter(Boolean); break;
        case "notes": partial.notes = val; break;
      }
    }

    const name = (partial.name ?? "").trim();
    if (!name) continue;

    results.push({
      name,
      whatsapp: partial.whatsapp ?? null,
      instagram: partial.instagram ?? null,
      birthday: partial.birthday ?? null,
      segments: partial.segments ?? [],
      genres: partial.genres ?? [],
      notes: partial.notes ?? null,
      _raw: raw,
    });
  }

  return results;
}

export async function parseFileToRows(file: File): Promise<{
  headers: string[];
  rawRows: Record<string, string>[];
  error?: string;
}> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();

  let wb: ReturnType<typeof XLSX.read>;
  try {
    wb = XLSX.read(buffer, { type: "array", cellDates: false, raw: false });
  } catch {
    return { headers: [], rawRows: [], error: "Arquivo inválido ou corrompido." };
  }

  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return { headers: [], rawRows: [], error: "Planilha vazia." };

  const raw = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" });
  if (raw.length < 2) {
    return { headers: [], rawRows: [], error: "Arquivo precisa ter cabeçalho e pelo menos uma linha de dados." };
  }

  const headers = (raw[0] as string[]).map((h) => String(h ?? "").trim());
  const nameFound = headers.some((h) => {
    const n = normalizeHeader(h);
    return n === "name" || n === "nome" || FIELD_ALIASES[n] === "name";
  });

  if (!nameFound) {
    return {
      headers,
      rawRows: [],
      error: `Coluna de nome não encontrada. Cabeçalhos detectados: ${headers.slice(0, 6).join(", ")}`,
    };
  }

  const rawRows: Record<string, string>[] = [];
  for (let i = 1; i < raw.length; i++) {
    const cells = raw[i] as string[];
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = String(cells[j] ?? "").trim();
    });
    if (headers.some((h) => (row[h] ?? "").trim())) {
      rawRows.push(row);
    }
  }

  return { headers, rawRows };
}
