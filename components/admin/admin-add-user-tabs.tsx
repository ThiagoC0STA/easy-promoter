"use client";

import * as React from "react";
import { Link2, UserPlus } from "lucide-react";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { InviteForm } from "@/components/admin/invite-form";

type Tab = "create" | "invite";

export function AdminAddUserTabs() {
  const [tab, setTab] = React.useState<Tab>("create");

  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label="Adicionar usuário"
        className="inline-flex self-start gap-1 p-1 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <button
          role="tab"
          type="button"
          aria-selected={tab === "create"}
          onClick={() => setTab("create")}
          className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-[calc(var(--radius-control)-4px)] transition-colors cursor-pointer ${
            tab === "create"
              ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
              : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <UserPlus size={13} strokeWidth={1.75} />
          Criar direto
        </button>
        <button
          role="tab"
          type="button"
          aria-selected={tab === "invite"}
          onClick={() => setTab("invite")}
          className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-[calc(var(--radius-control)-4px)] transition-colors cursor-pointer ${
            tab === "invite"
              ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
              : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <Link2 size={13} strokeWidth={1.75} />
          Enviar link de convite
        </button>
      </div>

      {tab === "create" ? <CreateUserForm /> : <InviteForm />}
    </div>
  );
}
