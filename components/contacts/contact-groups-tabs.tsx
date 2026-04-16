"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Check, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import type { ContactGroup } from "@/lib/contacts/groups";
import {
  createGroupAction,
  renameGroupAction,
  deleteGroupAction,
} from "@/lib/contacts/actions";

type Props = {
  groups: ContactGroup[];
  activeGroupId: string | null;
  readOnly?: boolean;
};

export function ContactGroupsTabs({ groups, activeGroupId, readOnly = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = React.useState(false);

  // Inline rename state
  const [renaming, setRenaming] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");

  // Dropdown open
  const [menuOpen, setMenuOpen] = React.useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu on outside click
  React.useEffect(() => {
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function navigate(groupId: string | null) {
    const base = pathname;
    const url = groupId ? `${base}?tab=${groupId}` : base;
    router.push(url);
  }

  async function handleCreate() {
    setBusy(true);
    const res = await createGroupAction("Nova lista");
    setBusy(false);
    if (res.ok && res.id) {
      navigate(res.id);
      // Start rename immediately
      setRenaming(res.id);
      setRenameValue("Nova lista");
    }
  }

  async function handleRename(id: string) {
    const trimmed = renameValue.trim();
    if (!trimmed) { setRenaming(null); return; }
    setBusy(true);
    await renameGroupAction(id, trimmed);
    setBusy(false);
    setRenaming(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Deletar esta lista? Os contatos dela voltam para Geral.")) return;
    setBusy(true);
    await deleteGroupAction(id);
    setBusy(false);
    setMenuOpen(null);
    navigate(null);
  }

  const tabs: { id: string | null; name: string }[] = [
    { id: null, name: "Geral" },
    ...groups.map((g) => ({ id: g.id, name: g.name })),
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-px" style={{ scrollbarWidth: "none" }}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeGroupId;
        const isRenaming = renaming === tab.id;

        return (
          <div key={tab.id ?? "__geral"} className="relative flex items-center shrink-0">
            {isRenaming && tab.id ? (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent-muted)]">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleRename(tab.id!);
                    if (e.key === "Escape") { setRenaming(null); }
                  }}
                  className="text-sm font-medium bg-transparent border-none outline-none text-[var(--color-text-primary)] w-28 min-w-0"
                />
                <button type="button" onClick={() => void handleRename(tab.id!)} disabled={busy}
                  className="text-[var(--color-accent)] hover:opacity-70 cursor-pointer shrink-0">
                  <Check size={13} strokeWidth={2} />
                </button>
                <button type="button" onClick={() => setRenaming(null)}
                  className="text-[var(--color-text-tertiary)] hover:opacity-70 cursor-pointer shrink-0">
                  <X size={13} strokeWidth={2} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate(tab.id)}
                className={`flex items-center gap-1 h-8 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer
                  ${isActive
                    ? "bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]"
                  }`}
              >
                {tab.name}
                {/* Options menu trigger — only for custom groups in editable mode */}
                {tab.id && isActive && !readOnly && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === tab.id ? null : tab.id); }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); setMenuOpen(menuOpen === tab.id ? null : tab.id); } }}
                    className="ml-0.5 -mr-1 h-5 w-5 rounded flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] transition-colors"
                  >
                    <MoreHorizontal size={12} strokeWidth={2} />
                  </span>
                )}
              </button>
            )}

            {/* Dropdown menu */}
            {menuOpen === tab.id && tab.id && (
              <div
                ref={menuRef}
                className="absolute top-full left-0 mt-1 z-50 w-40 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-md)] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => { setMenuOpen(null); setRenaming(tab.id); setRenameValue(tab.name); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer"
                >
                  <Pencil size={13} strokeWidth={1.75} />
                  Renomear
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(tab.id!)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-error)] hover:bg-[color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] transition-colors cursor-pointer"
                >
                  <Trash2 size={13} strokeWidth={1.75} />
                  Deletar lista
                </button>
              </div>
            )}
          </div>
        );
      })}

      {!readOnly && (
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={busy}
          title="Nova lista"
          className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--color-text-tertiary)]
                     hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Plus size={15} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}
