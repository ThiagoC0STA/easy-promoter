"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Mail, Send } from "lucide-react";

export function InviteForm() {
  const [email, setEmail] = React.useState("");
  const [asSuperAdmin, setAsSuperAdmin] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          role: asSuperAdmin ? "super_admin" : "promoter",
        }),
      });

      let payload: { ok?: boolean; error?: string } = {};
      try {
        payload = (await res.json()) as { ok?: boolean; error?: string };
      } catch {
        setError(
          "Resposta inválida do servidor. Atualize a página e tente de novo.",
        );
        return;
      }

      if (!res.ok || !payload.ok) {
        setError(
          payload.error ??
            "Não foi possível enviar o convite. Tente de novo em instantes.",
        );
        return;
      }

      setMessage(
        "Convite enviado. A pessoa deve abrir o e-mail para concluir o acesso.",
      );
      setEmail("");
      setAsSuperAdmin(false);
    } catch {
      setError(
        "Sem conexão ou servidor indisponível. Verifique a internet e tente de novo.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-card rounded-[var(--radius-card)] p-7 sm:p-9">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-5"
        aria-busy={busy}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            E-mail do convidado
          </span>
          <div className="relative">
            <Mail
              size={18}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="promoter@exemplo.com"
              autoComplete="email"
              className="input-field input-with-icon min-h-11"
            />
          </div>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={asSuperAdmin}
            onChange={(ev) => setAsSuperAdmin(ev.target.checked)}
            className="w-4 h-4 rounded border-[var(--color-border)]
                       accent-[var(--color-accent)]
                       cursor-pointer"
          />
          <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
            Convidar como super admin
          </span>
        </label>

        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="min-h-0 empty:hidden"
        >
          {error ? (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-error)_25%,transparent)]">
              <AlertCircle size={18} strokeWidth={1.5} className="text-[var(--color-error)] mt-0.5 shrink-0" aria-hidden />
              <span className="text-sm text-[var(--color-error)]">{error}</span>
            </div>
          ) : null}
          {message ? (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]">
              <CheckCircle2 size={18} strokeWidth={1.5} className="text-[var(--color-success)] mt-0.5 shrink-0" aria-hidden />
              <span className="text-sm text-[var(--color-success)]">{message}</span>
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full !py-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Enviando…
            </span>
          ) : (
            <>
              Enviar convite
              <Send size={18} strokeWidth={1.75} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
