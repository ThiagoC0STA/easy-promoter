"use client";

import * as React from "react";
import Link from "next/link";
import { Columns3, Download, Plus, SearchX, Upload, UserX } from "lucide-react";
import type { Contact } from "@/lib/contacts/types";
import type { ContactGroup } from "@/lib/contacts/groups";
import {
  applyContactListQuery,
  DEFAULT_CONTACT_LIST_FILTERS,
  isDefaultContactListFilters,
} from "@/lib/contacts/contact-list-utils";
import { downloadContactsXlsx } from "@/lib/contacts/export-xlsx";
import {
  ALL_COLUMNS,
  DEFAULT_VISIBLE,
  loadColumnVisibility,
  saveColumnVisibility,
  getContactGridTemplate,
  type ColumnKey,
} from "@/lib/contacts/column-config";
import { FilterBar } from "./filter-bar";
import { ContactRow } from "./contact-row";
import { ContactGroupsTabs } from "./contact-groups-tabs";

type Props = {
  contacts: Contact[];
  groups: ContactGroup[];
  activeGroupId: string | null;
  readOnly?: boolean;
  showAddButton?: boolean;
};

export function ContactsTable({
  contacts,
  groups,
  activeGroupId,
  readOnly = false,
  showAddButton = true,
}: Props) {
  const [filters, setFilters] = React.useState({ ...DEFAULT_CONTACT_LIST_FILTERS });
  const [visibleCols, setVisibleCols] = React.useState<ColumnKey[]>(DEFAULT_VISIBLE);
  const [colPickerOpen, setColPickerOpen] = React.useState(false);
  const colPickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setVisibleCols(loadColumnVisibility(null));
  }, []);

  React.useEffect(() => {
    function onDown(e: MouseEvent) {
      if (colPickerRef.current && !colPickerRef.current.contains(e.target as Node)) {
        setColPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function toggleCol(key: ColumnKey) {
    setVisibleCols((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      saveColumnVisibility(null, next);
      return next;
    });
  }

  const filtered = React.useMemo(
    () => applyContactListQuery(contacts, filters),
    [contacts, filters],
  );

  const hasActiveFilters = !isDefaultContactListFilters(filters);
  const zeroByFilter = contacts.length > 0 && filtered.length === 0;

  const newContactHref = activeGroupId
    ? `/app/contacts?tab=${activeGroupId}&novo=1&group=${activeGroupId}`
    : "/app/contacts?novo=1";

  return (
    <div className="flex flex-col gap-0">
      {/* Tabs */}
      <div className="mb-4 border-b border-[var(--color-border-subtle)] pb-3">
        <ContactGroupsTabs groups={groups} activeGroupId={activeGroupId} readOnly={readOnly} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-start gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <FilterBar filters={filters} onChange={setFilters} />
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/app/contacts/import"
              className="inline-flex items-center gap-1.5 h-10 px-3 rounded-[var(--radius-control)] text-sm font-medium
                         border border-[var(--color-border)] bg-[var(--color-surface-elevated)]
                         text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                         hover:border-[var(--color-text-tertiary)] transition-colors"
            >
              <Upload size={15} strokeWidth={1.75} aria-hidden />
              <span className="hidden sm:inline">Importar</span>
            </Link>
            {showAddButton && (
              <Link
                href={newContactHref}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[var(--radius-control)] text-sm font-semibold
                           bg-[var(--color-accent)] text-white shadow-[var(--shadow-xs)]
                           hover:brightness-110 active:brightness-95 transition-all"
              >
                <Plus size={16} strokeWidth={2} aria-hidden />
                <span className="hidden sm:inline">Novo contato</span>
                <span className="sm:hidden">Novo</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* List surface */}
      {filtered.length === 0 ? (
        <div
          className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-10 sm:p-14 text-center"
          role="status" aria-live="polite"
        >
          {zeroByFilter ? (
            <>
              <SearchX size={28} strokeWidth={1.25} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" aria-hidden />
              <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">Nenhum resultado</p>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-5 max-w-sm mx-auto">Nenhum contato combina com a busca ou filtros.</p>
              <button type="button" onClick={() => setFilters({ ...DEFAULT_CONTACT_LIST_FILTERS })}
                className="inline-flex items-center justify-center h-9 px-4 rounded-[var(--radius-control)] text-sm font-medium
                           border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]
                           hover:border-[var(--color-text-tertiary)] transition-colors cursor-pointer">
                Limpar filtros
              </button>
            </>
          ) : (
            <>
              <UserX size={28} strokeWidth={1.25} className="mx-auto mb-3 text-[var(--color-text-tertiary)]" aria-hidden />
              <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">Nenhum contato ainda</p>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-5 max-w-sm mx-auto">Comece cadastrando alguém nesta lista.</p>
              {!readOnly && (
                <Link href={newContactHref}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-control)] text-sm font-semibold
                             bg-[var(--color-accent)] text-white hover:brightness-110 transition-all cursor-pointer">
                  <Plus size={16} strokeWidth={2} aria-hidden />
                  Adicionar contato
                </Link>
              )}
            </>
          )}
        </div>
      ) : (
        <div
          className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden"
          style={{ "--ep-cgrid": getContactGridTemplate(visibleCols) } as React.CSSProperties}
        >
          {/* Secondary toolbar */}
          <div className="flex items-center justify-between gap-3 px-3 sm:px-4 h-11 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-secondary)]/40">
            <p className="text-xs text-[var(--color-text-tertiary)] tabular-nums" role="status" aria-live="polite">
              <span className="font-semibold text-[var(--color-text-secondary)]">{filtered.length}</span>
              <span className="hidden sm:inline"> de {contacts.length}</span>
              {hasActiveFilters && <span className="ml-1">(filtrado)</span>}
            </p>
            <div className="flex items-center gap-1">
              {!readOnly && (
                <button type="button" onClick={() => void downloadContactsXlsx(filtered)}
                  title="Exportar Excel"
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer">
                  <Download size={13} strokeWidth={1.75} aria-hidden />
                  <span className="hidden sm:inline">Exportar</span>
                </button>
              )}

              {/* Column picker */}
              <div className="relative" ref={colPickerRef}>
                <button type="button" onClick={() => setColPickerOpen((v) => !v)}
                  title="Colunas visíveis"
                  className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer
                    ${colPickerOpen ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"}`}>
                  <Columns3 size={13} strokeWidth={1.75} aria-hidden />
                  <span className="hidden sm:inline">Colunas</span>
                </button>
                {colPickerOpen && (
                  <div className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-md)] overflow-hidden">
                    <div className="px-3 py-2 border-b border-[var(--color-border-subtle)]">
                      <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Colunas visíveis</p>
                    </div>
                    {ALL_COLUMNS.map((col) => {
                      const isVisible = visibleCols.includes(col.key);
                      return (
                        <label key={col.key} className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors
                          ${col.removable ? "hover:bg-[var(--color-surface-secondary)]" : "opacity-50 cursor-default"}`}>
                          <input
                            type="checkbox"
                            checked={isVisible}
                            disabled={!col.removable}
                            onChange={() => col.removable && toggleCol(col.key)}
                            className="rounded border-[var(--color-border)] text-[var(--color-accent)] cursor-pointer"
                          />
                          <span className="text-[var(--color-text-primary)]">{col.label}</span>
                        </label>
                      );
                    })}
                    <div className="px-3 py-2 border-t border-[var(--color-border-subtle)]">
                      <button type="button" onClick={() => { setVisibleCols(DEFAULT_VISIBLE); saveColumnVisibility(null, DEFAULT_VISIBLE); }}
                        className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors cursor-pointer">
                        Restaurar padrão
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column headers */}
          <TableHeader visibleCols={visibleCols} />

          {/* Rows */}
          <div>
            {filtered.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                readOnly={readOnly}
                visibleCols={visibleCols}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const COL_LABELS: Record<ColumnKey, string> = {
  name: "Nome",
  tags: "Gêneros",
  last_contact: "Último contato",
  birthday: "Aniversário",
  frequency: "Frequência",
  spending: "Gasta bem",
  notes: "Notas",
};

function TableHeader({ visibleCols }: { visibleCols: ColumnKey[] }) {
  const dataColKeys = visibleCols.filter((k) => k !== "name");

  return (
    <div className="ep-contact-header-grid hidden sm:grid items-center h-9 px-3 sm:px-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-secondary)]/30">
      <div className="min-w-0 flex items-center">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Nome</span>
      </div>
      {dataColKeys.map((key) => (
        <div key={key} className="min-w-0 flex items-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
            {COL_LABELS[key]}
          </span>
        </div>
      ))}
      <div className="flex justify-end">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">Ações</span>
      </div>
    </div>
  );
}
