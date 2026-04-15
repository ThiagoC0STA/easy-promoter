"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, UserX } from "lucide-react";
import type { Contact } from "@/lib/contacts/types";
import { FilterBar } from "./filter-bar";
import { ContactRow } from "./contact-row";

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
  const [filters, setFilters] = React.useState({
    search: "",
    genres: [] as string[],
    segments: [] as string[],
  });

  const filtered = React.useMemo(() => {
    let result = contacts;

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    if (filters.genres.length > 0) {
      result = result.filter((c) =>
        filters.genres.some((g) => c.genres.includes(g)),
      );
    }

    if (filters.segments.length > 0) {
      result = result.filter((c) =>
        filters.segments.some((s) => c.segments.includes(s)),
      );
    }

    return result;
  }, [contacts, filters]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <FilterBar filters={filters} onChange={setFilters} />
        </div>
        {showAddButton && !readOnly && (
          <Link href="/app/contacts/new" className="btn-primary shrink-0">
            <Plus size={18} strokeWidth={1.75} />
            <span className="hidden sm:inline">Novo contato</span>
          </Link>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <UserX
            size={48}
            strokeWidth={1}
            className="mx-auto mb-4 text-[var(--color-text-tertiary)]"
          />
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">
            {contacts.length === 0
              ? "Nenhum contato cadastrado ainda."
              : "Nenhum contato corresponde aos filtros."}
          </p>
          {contacts.length === 0 && !readOnly && (
            <Link
              href="/app/contacts/new"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              <Plus size={16} strokeWidth={1.75} />
              Adicionar primeiro contato
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[var(--color-text-tertiary)]">
            {filtered.length} contato{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== contacts.length &&
              ` de ${contacts.length} no total`}
          </p>
          {filtered.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}
