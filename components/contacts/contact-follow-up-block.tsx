"use client";

import * as React from "react";
import {
  FOLLOWUP_CHANGED_EVENT,
  getFollowUpDate,
  setFollowUpDate,
} from "@/lib/contacts/followup-storage";

type Props = {
  contactId: string;
};

export function ContactFollowUpBlock({ contactId }: Props) {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    setValue(getFollowUpDate(contactId) ?? "");
  }, [contactId]);

  React.useEffect(() => {
    function sync() {
      setValue(getFollowUpDate(contactId) ?? "");
    }
    window.addEventListener(FOLLOWUP_CHANGED_EVENT, sync);
    return () => window.removeEventListener(FOLLOWUP_CHANGED_EVENT, sync);
  }, [contactId]);

  function persist(next: string) {
    setValue(next);
    setFollowUpDate(contactId, next.trim() || null);
  }

  return (
    <div className="glass-card rounded-[var(--radius-card)] p-6 flex flex-col gap-2">
      <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
        Próximo contato planejado
      </h2>
      <p className="text-[11px] text-[var(--color-text-tertiary)] leading-snug">
        Opcional. Fica só neste aparelho até você limpar o armazenamento do
        navegador. Use para lembrar quando falar de novo com a pessoa.
      </p>
      <label className="flex flex-col gap-1.5 max-w-xs">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          Data alvo
        </span>
        <input
          type="date"
          value={value}
          onChange={(e) => persist(e.target.value)}
          className="input-field min-h-11"
        />
      </label>
      {value ? (
        <button
          type="button"
          onClick={() => persist("")}
          className="self-start text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-error)] cursor-pointer"
        >
          Limpar data
        </button>
      ) : null}
    </div>
  );
}
