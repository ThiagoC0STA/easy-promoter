"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { ContactListFilters } from "@/lib/contacts/contact-list-utils";
import {
  DEFAULT_CONTACT_LIST_FILTERS,
  isDefaultContactListFilters,
} from "@/lib/contacts/contact-list-utils";
import { ContactFilterPanel } from "./contact-filter-panel";

type Props = {
  open: boolean;
  onClose: () => void;
  filters: ContactListFilters;
  onChange: (filters: ContactListFilters) => void;
};

export function FilterModal({ open, onClose, filters, onChange }: Props) {
  const [mounted, setMounted] = React.useState(false);
  const hasNonDefaults = !isDefaultContactListFilters(filters);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[color-mix(in_srgb,#0f172a_50%,transparent)] dark:bg-[color-mix(in_srgb,#000_65%,transparent)]"
        onClick={onClose}
        aria-label="Fechar filtros"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
        className="relative z-10 w-full sm:max-w-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]
                   rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] shadow-[var(--shadow-md)]
                   flex flex-col max-h-[90dvh] sm:max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-subtle)] shrink-0">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Filtros</h2>
          <div className="flex items-center gap-2">
            {hasNonDefaults && (
              <button
                type="button"
                onClick={() => onChange({ ...DEFAULT_CONTACT_LIST_FILTERS })}
                className="text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors cursor-pointer"
              >
                Limpar tudo
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-md flex items-center justify-center text-[var(--color-text-tertiary)]
                         hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer"
            >
              <X size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 p-5">
          <ContactFilterPanel filters={filters} onChange={onChange} />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--color-border-subtle)] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary w-full h-10"
          >
            Ver resultados
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
