"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, FileUp, X } from "lucide-react";
import { importContactsBulkAction } from "@/lib/contacts/actions";
import {
  parseFileToRows,
  detectColumnMapping,
  parseRows,
  type ImportPreviewRow,
  type ColumnMapping,
} from "@/lib/contacts/smart-import";

type Stage = "idle" | "mapping" | "preview" | "done";

const FIELD_LABELS: Record<string, string> = {
  name: "Nome *",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  birthday: "Aniversário",
  segments: "Segmentos",
  genres: "Gêneros",
  notes: "Notas",
};

export function CsvImportForm() {
  const [stage, setStage] = React.useState<Stage>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [rawRows, setRawRows] = React.useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = React.useState<ColumnMapping>({});
  const [preview, setPreview] = React.useState<ImportPreviewRow[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<{ inserted: number; errors: string[] } | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setFileName(file.name);
    const { headers: h, rawRows: r, error: e } = await parseFileToRows(file);
    if (e) { setError(e); setStage("idle"); return; }
    setHeaders(h);
    setRawRows(r);
    const detected = detectColumnMapping(h);
    setMapping(detected);
    setStage("mapping");
  }

  function applyMapping() {
    const rows = parseRows(rawRows, mapping);
    if (rows.length === 0) { setError("Nenhuma linha válida após o mapeamento."); return; }
    setPreview(rows);
    setError(null);
    setStage("preview");
  }

  async function submit() {
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.set("payload", JSON.stringify(preview));
    const res = await importContactsBulkAction(fd);
    setBusy(false);
    if (!res.ok) { setError(res.message); return; }
    setResult({ inserted: res.inserted, errors: res.errors });
    setStage("done");
  }

  function reset() {
    setStage("idle"); setError(null); setHeaders([]); setRawRows([]);
    setMapping({}); setPreview([]); setResult(null); setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* File drop */}
      {stage === "idle" && (
        <>
          <div
            className="rounded-[var(--radius-card)] border-2 border-dashed border-[var(--color-border)]
                       bg-[var(--color-surface-elevated)] p-10 text-center cursor-pointer
                       hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]/30
                       transition-colors"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) void handleFile(f);
            }}
          >
            <FileUp size={28} strokeWidth={1.25} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" />
            <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Arraste ou clique para selecionar
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Excel (.xlsx, .xls) ou CSV — até 500 linhas
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />

          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5">
            <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-2">Como funciona</p>
            <ul className="text-xs text-[var(--color-text-tertiary)] space-y-1.5 list-disc pl-4">
              <li>Aceita Excel (.xlsx) e CSV. A primeira linha deve ser o cabeçalho.</li>
              <li>O sistema detecta as colunas automaticamente — você pode ajustar antes de importar.</li>
              <li>Coluna obrigatória: <strong className="text-[var(--color-text-secondary)]">Nome</strong> (ou variações: "name", "contato", "cliente"…).</li>
              <li>Aniversários aceitos em DD/MM/AAAA, AAAA-MM-DD ou serial do Excel.</li>
            </ul>
          </div>
        </>
      )}

      {/* Column mapping */}
      {stage === "mapping" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Mapeamento de colunas
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                {fileName} · {rawRows.length} linhas detectadas
              </p>
            </div>
            <button type="button" onClick={reset}
              className="h-8 w-8 rounded-md flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer">
              <X size={15} strokeWidth={1.75} />
            </button>
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr] border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-secondary)] px-4 py-2.5">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Coluna no arquivo</span>
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Campo no sistema</span>
            </div>
            {headers.map((h) => (
              <div key={h} className="grid grid-cols-[1fr_1fr] items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border-subtle)] last:border-b-0">
                <span className="text-sm text-[var(--color-text-primary)] truncate">{h}</span>
                <select
                  className="h-8 px-2 rounded-md text-xs border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] cursor-pointer"
                  value={mapping[h] ?? ""}
                  onChange={(e) => setMapping((m) => ({ ...m, [h]: (e.target.value || null) as typeof mapping[string] }))}
                >
                  <option value="">Ignorar</option>
                  {Object.entries(FIELD_LABELS).map(([v, label]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={applyMapping} className="btn-primary h-10 px-5">
              Continuar → pré-visualizar
            </button>
            <button type="button" onClick={reset} className="h-10 px-4 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Preview */}
      {stage === "preview" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Pré-visualização
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                {preview.length} contato{preview.length !== 1 ? "s" : ""} prontos para importar
              </p>
            </div>
            <button type="button" onClick={() => setStage("mapping")}
              className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer">
              ← Ajustar colunas
            </button>
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden">
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[var(--color-surface-secondary)] border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold text-[var(--color-text-secondary)]">Nome</th>
                    <th className="px-3 py-2.5 font-semibold text-[var(--color-text-secondary)]">WhatsApp</th>
                    <th className="px-3 py-2.5 font-semibold text-[var(--color-text-secondary)]">Instagram</th>
                    <th className="px-3 py-2.5 font-semibold text-[var(--color-text-secondary)]">Aniversário</th>
                    <th className="px-3 py-2.5 font-semibold text-[var(--color-text-secondary)]">Segmentos</th>
                    <th className="px-3 py-2.5 font-semibold text-[var(--color-text-secondary)]">Gêneros</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 100).map((r, i) => (
                    <tr key={i} className="border-b border-[var(--color-border-subtle)] last:border-b-0">
                      <td className="px-3 py-2 text-[var(--color-text-primary)] font-medium">{r.name}</td>
                      <td className="px-3 py-2 text-[var(--color-text-secondary)]">{r.whatsapp ?? "—"}</td>
                      <td className="px-3 py-2 text-[var(--color-text-secondary)]">{r.instagram ? `@${r.instagram}` : "—"}</td>
                      <td className="px-3 py-2 text-[var(--color-text-secondary)]">{r.birthday ?? "—"}</td>
                      <td className="px-3 py-2 text-[var(--color-text-secondary)]">{r.segments.join(", ") || "—"}</td>
                      <td className="px-3 py-2 text-[var(--color-text-secondary)]">{r.genres.join(", ") || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.length > 100 && (
              <p className="px-3 py-2 text-xs text-[var(--color-text-tertiary)] border-t border-[var(--color-border-subtle)]">
                Mostrando 100 de {preview.length} linhas
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void submit()} disabled={busy} className="btn-primary h-10 px-5 disabled:opacity-60">
              {busy ? "Importando…" : `Importar ${preview.length} contato${preview.length !== 1 ? "s" : ""}`}
            </button>
            <button type="button" onClick={reset} disabled={busy}
              className="h-10 px-4 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer disabled:opacity-50">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Done */}
      {stage === "done" && result && (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[var(--color-success)]">
            <CheckCircle2 size={18} strokeWidth={1.5} />
            <span className="text-sm font-semibold">
              {result.inserted} contato{result.inserted !== 1 ? "s" : ""} importado{result.inserted !== 1 ? "s" : ""}
            </span>
          </div>
          {result.errors.length > 0 && (
            <ul className="text-xs text-[var(--color-error)] space-y-1 list-disc pl-4 max-h-32 overflow-y-auto">
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
          <div className="flex items-center gap-3 pt-1">
            <Link href="/app/contacts" className="btn-primary h-9 px-4 text-sm">
              Ver contatos
            </Link>
            <button type="button" onClick={reset}
              className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer">
              Importar mais
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-[color-mix(in_srgb,var(--color-error)_25%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))]">
          <AlertCircle size={16} strokeWidth={1.5} className="text-[var(--color-error)] mt-0.5 shrink-0" />
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </div>
      )}
    </div>
  );
}
