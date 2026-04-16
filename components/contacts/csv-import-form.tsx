"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { importContactsBulkAction } from "@/lib/contacts/actions";
import {
  parseContactsCsv,
  parsedRowToImportPayload,
  type ImportContactPayload,
} from "@/lib/contacts/csv-import";

export function CsvImportForm() {
  const [raw, setRaw] = React.useState("");
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<ImportContactPayload[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<{
    inserted: number;
    errors: string[];
  } | null>(null);

  function runParse(text: string) {
    setResult(null);
    const { rows: parsed, error } = parseContactsCsv(text);
    if (error) {
      setParseError(error);
      setRows([]);
      return;
    }
    setParseError(null);
    const payloads = parsed.map((r) => parsedRowToImportPayload(r));
    setRows(payloads);
  }

  React.useEffect(() => {
    if (!raw.trim()) {
      setRows([]);
      setParseError(null);
      return;
    }
    runParse(raw);
  }, [raw]);

  async function submit() {
    if (rows.length === 0) return;
    setBusy(true);
    setResult(null);
    const fd = new FormData();
    fd.set("payload", JSON.stringify(rows));
    const res = await importContactsBulkAction(fd);
    setBusy(false);
    if (!res.ok) {
      setParseError(res.message);
      return;
    }
    setParseError(null);
    setResult({ inserted: res.inserted, errors: res.errors });
    if (res.inserted > 0 && res.errors.length === 0) {
      setRaw("");
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="glass-card rounded-[var(--radius-card)] p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          Como importar
        </h2>
        <ul className="text-sm text-[var(--color-text-secondary)] space-y-2 list-disc pl-5">
          <li>
            Primeira linha com cabeçalhos. Coluna obrigatória:{" "}
            <code className="text-xs bg-[var(--color-surface-secondary)] px-1 rounded">name</code>{" "}
            ou{" "}
            <code className="text-xs bg-[var(--color-surface-secondary)] px-1 rounded">nome</code>.
          </li>
          <li>Opcional: whatsapp, instagram, birthday (AAAA-MM-DD), segments (mailing;posta).</li>
          <li>Até 200 linhas por envio. Revise a pré-visualização antes de confirmar.</li>
        </ul>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          Cole o CSV ou carregue um arquivo .csv
        </span>
        <textarea
          className="input-field min-h-[180px] font-mono text-xs"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={`name,whatsapp,instagram\nJoão,5541999999999,@joao`}
          spellCheck={false}
        />
        <input
          type="file"
          accept=".csv,text/csv"
          className="text-xs text-[var(--color-text-secondary)]"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = () => {
              setRaw(String(reader.result ?? ""));
            };
            reader.readAsText(f, "UTF-8");
            e.target.value = "";
          }}
        />
      </label>

      {parseError ? (
        <div className="flex items-start gap-2 p-3 rounded-xl border border-[color-mix(in_srgb,var(--color-error)_28%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))]">
          <AlertCircle className="text-[var(--color-error)] shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-[var(--color-error)]">{parseError}</p>
        </div>
      ) : null}

      {rows.length > 0 && !parseError ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Pré-visualização: <strong>{rows.length}</strong> contato
            {rows.length !== 1 ? "s" : ""} pronto
            {rows.length !== 1 ? "s" : ""} para importar.
          </p>
          <div className="overflow-x-auto rounded-[var(--radius-control)] border border-[var(--color-border)] max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-[var(--color-surface-secondary)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="p-2 font-semibold">Nome</th>
                  <th className="p-2 font-semibold">WhatsApp</th>
                  <th className="p-2 font-semibold">Instagram</th>
                  <th className="p-2 font-semibold">Nasc.</th>
                  <th className="p-2 font-semibold">Segmentos</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((r, i) => (
                  <tr key={i} className="border-b border-[var(--color-border-subtle)]">
                    <td className="p-2 text-[var(--color-text-primary)]">{r.name}</td>
                    <td className="p-2 text-[var(--color-text-secondary)]">{r.whatsapp ?? "-"}</td>
                    <td className="p-2 text-[var(--color-text-secondary)]">{r.instagram ?? "-"}</td>
                    <td className="p-2 text-[var(--color-text-secondary)]">{r.birthday ?? "-"}</td>
                    <td className="p-2 text-[var(--color-text-secondary)]">
                      {r.segments.join(", ") || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 50 ? (
              <p className="text-xs text-[var(--color-text-tertiary)] p-2">
                Mostrando 50 de {rows.length} linhas na tabela.
              </p>
            ) : null}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className="btn-primary self-start disabled:opacity-60"
          >
            {busy ? "Importando…" : `Importar ${rows.length} contato${rows.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      ) : null}

      {result ? (
        <div className="flex flex-col gap-2 p-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
          <div className="flex items-center gap-2 text-sm text-[var(--color-success)]">
            <CheckCircle2 size={18} strokeWidth={1.5} aria-hidden />
            <span>
              Inseridos com sucesso: <strong>{result.inserted}</strong>
            </span>
          </div>
          {result.errors.length > 0 ? (
            <ul className="text-xs text-[var(--color-error)] space-y-1 list-disc pl-5 max-h-40 overflow-y-auto">
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : null}
          <Link href="/app/contacts" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
            Ver lista de contatos
          </Link>
        </div>
      ) : null}
    </div>
  );
}
