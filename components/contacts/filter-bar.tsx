"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { ContactListFilters } from "@/lib/contacts/contact-list-utils";
import {
  contactListFiltersBadgeCount,
  DEFAULT_CONTACT_LIST_FILTERS,
  isDefaultContactListFilters,
} from "@/lib/contacts/contact-list-utils";
import { ContactFilterPanel } from "./contact-filter-panel";

type Props = {
  filters: ContactListFilters;
  onChange: (filters: ContactListFilters) => void;
};

export function FilterBar({ filters, onChange }: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const badge = contactListFiltersBadgeCount(filters);
  const hasNonDefaults = !isDefaultContactListFilters(filters);

  React.useEffect(() => {
    function onDocKey(e: KeyboardEvent) {
      if (e.key === "Escape" && expanded) {
        e.preventDefault();
        setExpanded(false);
        document.getElementById("filter-panel-toggle")?.focus();
        return;
      }

      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      e.preventDefault();
      searchRef.current?.focus();
    }

    document.addEventListener("keydown", onDocKey);
    return () => document.removeEventListener("keydown", onDocKey);
  }, [expanded]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            strokeWidth={1.5}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
          />
          <input
            ref={searchRef}
            type="search"
            enterKeyHint="search"
            placeholder="Nome, WhatsApp ou Instagram... (/ foca aqui)"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="input-field input-with-icon min-h-11"
            aria-label="Buscar contato por nome, WhatsApp ou Instagram"
          />
        </div>
        <button
          type="button"
          id="filter-panel-toggle"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls="contact-filters-panel"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer min-h-11
            ${hasNonDefaults ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]"}
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]`}
        >
          <SlidersHorizontal size={16} strokeWidth={1.5} aria-hidden />
          Filtros
          {badge > 0 && (
            <span className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-xs flex items-center justify-center">
              {badge}
            </span>
          )}
        </button>
        {hasNonDefaults && (
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_CONTACT_LIST_FILTERS })}
            className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-tertiary)]
                       hover:text-[var(--color-error)] transition-colors cursor-pointer"
          >
            <X size={14} strokeWidth={1.5} />
            Limpar
          </button>
        )}
      </div>

      <p className="text-xs text-[var(--color-text-tertiary)]">
        Canais e segmentos ficam em{" "}
        <span className="text-[var(--color-text-secondary)] font-medium">Filtros</span>
        . Tecla Esc fecha o painel de filtros.
      </p>

      {expanded && (
        <ContactFilterPanel filters={filters} onChange={onChange} />
      )}
    </div>
  );
}
