/**
 * One-time migration script: reads the promoter's spreadsheet and
 * inserts contacts into Supabase.
 *
 * Usage:
 *   npx tsx scripts/migrate-xlsx.ts <owner_id> [path_to_xlsx]
 *
 * Requires: tsx, xlsx (npm install -D tsx xlsx)
 * Uses SERVICE_ROLE_KEY from .env.local
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

const OWNER_ID = process.argv[2];
const XLSX_PATH =
  process.argv[3] ??
  resolve(process.cwd(), "Planilha de clientes nao mexer (1).xlsx");

if (!OWNER_ID) {
  console.error("Usage: npx tsx scripts/migrate-xlsx.ts <owner_id> [xlsx_path]");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type RawRow = Record<string, unknown>;

function normalizeWhatsapp(raw: unknown): string | null {
  if (!raw || typeof raw !== "string") return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits;
}

function normalizeInstagram(raw: unknown): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "." || trimmed.toLowerCase() === "whatsapp")
    return null;
  return trimmed;
}

function parseGenres(row: RawRow): string[] {
  const genres: string[] = [];
  for (let i = 4; i <= 8; i++) {
    const key = Object.keys(row)[i];
    if (!key) continue;
    const val = row[key];
    if (typeof val === "string" && val.trim() && val.trim() !== ".") {
      genres.push(val.trim());
    }
  }
  return [...new Set(genres)];
}

function parseDate(raw: unknown): string | null {
  if (!raw) return null;
  if (raw instanceof Date) return raw.toISOString().split("T")[0];
  if (typeof raw === "number") {
    const d = XLSX.SSF.parse_date_code(raw);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  if (typeof raw === "string" && raw.includes("-")) return raw.split("T")[0];
  return null;
}

function parseTimestamp(raw: unknown): string | null {
  const d = parseDate(raw);
  return d ? `${d}T00:00:00.000Z` : null;
}

const SHEET_SEGMENT_MAP: Record<string, string> = {
  mailing: "mailing",
  "Pessoas que postam": "posta",
  "pessoas que gastam bem": "gasta_bem",
};

async function main() {
  const buf = readFileSync(XLSX_PATH);
  const wb = XLSX.read(buf, { type: "buffer", cellDates: true });

  const contactMap = new Map<
    string,
    {
      name: string;
      whatsapp: string | null;
      instagram: string | null;
      birthday: string | null;
      genres: string[];
      segments: string[];
      last_contacted_at: string | null;
    }
  >();

  for (const sheetName of wb.SheetNames) {
    const segment = SHEET_SEGMENT_MAP[sheetName];
    if (!segment) continue;

    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<RawRow>(ws, { defval: null });

    for (const row of rows) {
      const vals = Object.values(row);
      const name = typeof vals[0] === "string" ? vals[0].trim() : null;
      if (!name || !name.length) continue;

      const nameKey = name.toLowerCase();
      const existing = contactMap.get(nameKey);

      const whatsapp = normalizeWhatsapp(vals[1]);
      const instagram = normalizeInstagram(vals[2]);
      const birthday = parseDate(vals[3]);
      const genres = parseGenres(row);
      const lastContacted = parseTimestamp(vals[9]);

      if (existing) {
        if (!existing.segments.includes(segment)) {
          existing.segments.push(segment);
        }
        for (const g of genres) {
          if (!existing.genres.includes(g)) existing.genres.push(g);
        }
        if (!existing.whatsapp && whatsapp) existing.whatsapp = whatsapp;
        if (!existing.instagram && instagram) existing.instagram = instagram;
        if (!existing.birthday && birthday) existing.birthday = birthday;
        if (!existing.last_contacted_at && lastContacted)
          existing.last_contacted_at = lastContacted;
      } else {
        contactMap.set(nameKey, {
          name,
          whatsapp,
          instagram,
          birthday,
          genres,
          segments: [segment],
          last_contacted_at: lastContacted,
        });
      }
    }
  }

  console.log(`Parsed ${contactMap.size} unique contacts`);

  const inserts = Array.from(contactMap.values()).map((c) => ({
    owner_id: OWNER_ID,
    name: c.name,
    whatsapp: c.whatsapp,
    instagram: c.instagram,
    birthday: c.birthday,
    genres: c.genres,
    segments: c.segments,
    last_contacted_at: c.last_contacted_at,
  }));

  if (inserts.length === 0) {
    console.log("Nothing to insert.");
    return;
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert(inserts)
    .select("id, name");

  if (error) {
    console.error("Insert error:", error.message);
    process.exit(1);
  }

  console.log(`Inserted ${data?.length ?? 0} contacts successfully.`);
  for (const row of data ?? []) {
    console.log(`  - ${row.name} (${row.id})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
