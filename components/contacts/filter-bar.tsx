"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { ContactListFilters } from "@/lib/contacts/contact-list-utils";
import {
  contactListFiltersBadgeCount,
  DEFAULT_CONTACT_LIST_FILTERS,
  isDefaultContactListFilters,
} from "@/lib/contacts/contact-list-utils";
import { FilterModal } from "./filter-modal";

type Props = {
  filters: ContactListFilters;
  onChange: (filters: ContactListFilters) => void;
};

export function FilterBar({ filters, onChange }: Props) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const badge = contactListFiltersBadgeCount(filters);
  const hasNonDefaults = !isDefaultContactListFilters(filters);

  React.useEffect(() => {
    function onDocKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) return;
      e.preventDefault();
      searchRef.current?.focus();
    }
    document.addEventListener("keydown", onDocKey);
    return () => document.removeEventListener("keydown", onDocKey);
  }, []);

  return (
    <>
      <div className="flex items-center gap-2 w-full">
        <div className="relative flex-1 min-w-0">
          <Search
            size={16}
            strokeWidth={1.75}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
          />
          <input
            ref={searchRef}
            type="search"
            enterKeyHint="search"
            placeholder="Buscar por nome, WhatsApp ou Instagram"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full h-10 pl-9 pr-8 rounded-[var(--radius-control)] text-sm
                       bg-[var(--color-surface-elevated)] border border-[var(--color-border)]
                       text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]
                       focus:border-[var(--color-accent)] focus:outline-none
                       focus:shadow-[0_0_0_3px_var(--color-accent-muted)]
                       transition-all"
            aria-label="Buscar contato"
          />
          <kbd className="hidden sm:inline absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--color-text-tertiary)] border border-[var(--color-border)] rounded px-1.5 py-0.5 bg-[var(--color-surface)] pointer-events-none">
            /
          </kbd>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Abrir filtros"
          className={`inline-flex items-center gap-1.5 h-10 px-3 rounded-[var(--radius-control)] text-sm font-medium border transition-colors cursor-pointer
            ${hasNonDefaults
              ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
              : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            }
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]`}
        >
          <SlidersHorizontal size={15} strokeWidth={1.75} aria-hidden />
          <span className="hidden sm:inline">Filtros</span>
          {badge > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
              {badge}
            </span>
          )}
        </button>

        {hasNonDefaults && (
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_CONTACT_LIST_FILTERS })}
            title="Limpar filtros"
            aria-label="Limpar filtros"
            className="inline-flex items-center justify-center h-10 w-10 rounded-[var(--radius-control)]
                       text-[var(--color-text-tertiary)] hover:text-[var(--color-error)]
                       hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer"
          >
            <X size={15} strokeWidth={1.75} />
          </button>
        )}
      </div>

      <FilterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        filters={filters}
        onChange={onChange}
      />
    </>
  );
}
