"use client";

import * as React from "react";
import Link from "next/link";
import { Download, LayoutList, Plus, SearchX, UserX } from "lucide-react";
import type { Contact } from "@/lib/contacts/types";
import {
  applyContactListQuery,
  DEFAULT_CONTACT_LIST_FILTERS,
  isDefaultContactListFilters,
} from "@/lib/contacts/contact-list-utils";
import { downloadContactsCsv } from "@/lib/contacts/export-contacts-csv";
import { FilterBar } from "./filter-bar";
import { ContactRow } from "./contact-row";

const COMPACT_STORAGE_KEY = "ep_contacts_compact_v1";

type Props = {
  contacts: Contact[];
  readOnly?: boolean;
  showAddButton?: boolean;
};

export function ContactsTable({
  contacts,
  readOnly = false,
  showAddButton = true,
}: Props) {
  const [filters, setFilters] = React.useState({ ...DEFAULT_CONTACT_LIST_FILTERS });
  const [compact, setCompact] = React.useState(false);

  React.useEffect(() => {
    try {
      setCompact(window.localStorage.getItem(COMPACT_STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  function toggleCompact() {
    setCompact((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COMPACT_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const filtered = React.useMemo(
    () => applyContactListQuery(contacts, filters),
    [contacts, filters],
  );

  const hasActiveFilters = !isDefaultContactListFilters(filters);

  const zeroByFilter = contacts.length > 0 && filtered.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4 sm:p-5
                   flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
      >
        <div className="flex-1 min-w-0">
          <FilterBar filters={filters} onChange={setFilters} />
        </div>
        {showAddButton && !readOnly && (
          <Link
            href="/app/contacts/new"
            className="btn-primary shrink-0 self-start sm:self-center"
          >
            <Plus size={18} strokeWidth={1.75} aria-hidden />
            <span className="hidden sm:inline">Novo contato</span>
            <span className="sm:hidden">Novo</span>
          </Link>
        )}
      </div>

      {filtered.length === 0 ? (
        <div
          className="glass-card rounded-[var(--radius-card)] p-10 sm:p-14 text-center border border-[var(--color-border)]"
          role="status"
          aria-live="polite"
        >
          {zeroByFilter ? (
            <>
              <SearchX
                size={44}
                strokeWidth={1}
                className="mx-auto mb-4 text-[var(--color-text-tertiary)]"
                aria-hidden
              />
              <p className="text-base font-medium text-[var(--color-text-primary)] mb-2">
                Nenhum resultado
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-sm mx-auto">
                Nenhum contato combina com a busca ou filtros atuais. Tente limpar e buscar de novo.
              </p>
              <button
                type="button"
                onClick={() => setFilters({ ...DEFAULT_CONTACT_LIST_FILTERS })}
                className="inline-flex items-center justify-center min-h-11 px-5 rounded-xl text-sm font-semibold
                           border border-[var(--color-border)] bg-[var(--color-surface-secondary)]
                           text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]
                           transition-colors cursor-pointer"
              >
                Limpar busca e filtros
              </button>
            </>
          ) : (
            <>
              <UserX
                size={44}
                strokeWidth={1}
                className="mx-auto mb-4 text-[var(--color-text-tertiary)]"
                aria-hidden
              />
              <p className="text-base font-medium text-[var(--color-text-primary)] mb-2">
                Nenhum contato ainda
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-sm mx-auto">
                Comece cadastrando alguém da sua base. Você pode importar depois se precisar.
              </p>
              {!readOnly && (
                <Link href="/app/contacts/new" className="btn-primary">
                  <Plus size={18} strokeWidth={1.75} aria-hidden />
                  Adicionar primeiro contato
                </Link>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p
              className="text-xs text-[var(--color-text-tertiary)]"
              role="status"
              aria-live="polite"
            >
              Mostrando{" "}
              <span className="font-semibold text-[var(--color-text-secondary)]">
                {filtered.length}
              </span>{" "}
              de {contacts.length} contato{contacts.length !== 1 ? "s" : ""}
              {hasActiveFilters ? " (filtrado)" : ""}
            </p>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => downloadContactsCsv(filtered)}
                  title="CSV UTF-8 para Excel. Reflete filtros atuais. Guarde o arquivo em local seguro."
                  className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-[var(--radius-control)] text-xs font-semibold border border-[var(--color-border)]
                             bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]
                             transition-colors cursor-pointer"
                >
                  <Download size={14} strokeWidth={1.75} aria-hidden />
                  Exportar CSV
                </button>
              )}
              <button
                type="button"
                onClick={toggleCompact}
                aria-pressed={compact}
                title={compact ? "Mostrar mais espaço entre linhas" : "Mostrar mais linhas na tela"}
                className={`inline-flex items-center gap-1.5 min-h-10 px-3 rounded-[var(--radius-control)] text-xs font-semibold border transition-colors cursor-pointer
                  ${
                    compact
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]"
                  }`}
              >
                <LayoutList size={14} strokeWidth={1.75} aria-hidden />
                {compact ? "Confortável" : "Compacto"}
              </button>
            </div>
          </div>
          {filtered.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              readOnly={readOnly}
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  );
}
