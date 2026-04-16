"use client";

import * as React from "react";
import { Keyboard, X } from "lucide-react";

const ROWS: { keys: string; description: string }[] = [
  {
    keys: "/",
    description:
      "Na lista de contatos, foca a busca (exceto quando você já está digitando em um campo).",
  },
  {
    keys: "Esc",
    description:
      "Na lista de contatos, fecha o painel de filtros e devolve o foco ao botão Filtros.",
  },
  {
    keys: "?",
    description:
      "Abre esta lista (fora de campos de texto). O mesmo que o botão de atalhos no topo.",
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function KeyboardShortcutsModal({ open, onClose }: Props) {
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-text-primary)_55%,transparent)] cursor-default"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-xl p-6"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Keyboard
              className="text-[var(--color-accent)] shrink-0"
              size={22}
              strokeWidth={1.5}
              aria-hidden
            />
            <h2
              id="shortcuts-title"
              className="text-lg font-semibold text-[var(--color-text-primary)]"
            >
              Atalhos de teclado
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-10 min-h-10 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-secondary)] cursor-pointer
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            aria-label="Fechar"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        <ul className="flex flex-col gap-3 text-sm text-[var(--color-text-secondary)]">
          {ROWS.map((row) => (
            <li key={row.keys} className="flex gap-3">
              <kbd className="shrink-0 min-w-[2.25rem] text-center px-2 py-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-xs font-semibold text-[var(--color-text-primary)]">
                {row.keys}
              </kbd>
              <span className="leading-relaxed">{row.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function useGlobalShortcutHelp(onOpen: () => void, enabled: boolean) {
  React.useEffect(() => {
    if (!enabled) return;
    function onDocKey(e: KeyboardEvent) {
      if (e.key !== "?" || e.ctrlKey || e.metaKey || e.altKey) return;
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
      onOpen();
    }
    document.addEventListener("keydown", onDocKey);
    return () => document.removeEventListener("keydown", onDocKey);
  }, [onOpen, enabled]);
}
