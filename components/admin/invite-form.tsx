"use client";

import * as React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Mail, RefreshCw, Send, ShieldAlert } from "lucide-react";

type Status =
  | { type: "idle" }
  | { type: "success"; email: string }
  | { type: "error"; message: string; canResend?: boolean; email?: string }
  | { type: "resent"; email: string };

export function InviteForm() {
  const [email, setEmail] = React.useState("");
  const [asSuperAdmin, setAsSuperAdmin] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState<Status>({ type: "idle" });

  async function send(emailToSend: string, role: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSend.trim(), role }),
      });
      let payload: { ok?: boolean; error?: string } = {};
      try { payload = (await res.json()) as typeof payload; } catch { /* ignore */ }

      if (!res.ok || !payload.ok) {
        const msg = payload.error ?? "Não foi possível enviar o convite.";
        const canResend = msg.includes("convite pendente");
        setStatus({ type: "error", message: msg, canResend, email: emailToSend });
        return;
      }
      return true;
    } catch {
      setStatus({ type: "error", message: "Sem conexão. Verifique a internet e tente de novo." });
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ type: "idle" });
    const ok = await send(email, asSuperAdmin ? "super_admin" : "promoter");
    if (ok) {
      setStatus({ type: "success", email });
      setEmail("");
      setAsSuperAdmin(false);
    }
  }

  async function onResend() {
    if (status.type !== "error" || !status.email) return;
    const savedEmail = status.email;
    setStatus({ type: "idle" });
    const ok = await send(savedEmail, asSuperAdmin ? "super_admin" : "promoter");
    if (ok) setStatus({ type: "resent", email: savedEmail });
  }

  return (
    <div className="glass-card rounded-[var(--radius-card)] p-6 sm:p-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-5" aria-busy={busy}>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            E-mail do convidado
          </span>
          <div className="relative">
            <Mail size={16} strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(ev) => { setEmail(ev.target.value); setStatus({ type: "idle" }); }}
              placeholder="promoter@exemplo.com"
              autoComplete="email"
              className="input-field input-with-icon min-h-11"
            />
          </div>
        </label>

        {/* Super admin toggle */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={asSuperAdmin}
              onChange={(ev) => setAsSuperAdmin(ev.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-accent)] cursor-pointer"
            />
            <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
              Convidar como super admin
            </span>
          </label>
          {asSuperAdmin && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 ml-6">
              <ShieldAlert size={14} strokeWidth={1.75} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-400 leading-snug">
                Super admins têm acesso total ao painel, incluindo convidar e deletar usuários.
              </p>
            </div>
          )}
        </div>

        {/* Feedback */}
        <div role="status" aria-live="polite" aria-atomic="true" className="empty:hidden">
          {status.type === "error" && (
            <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-error)_25%,transparent)]">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={16} strokeWidth={1.5} className="text-[var(--color-error)] mt-0.5 shrink-0" />
                <span className="text-sm text-[var(--color-error)]">{status.message}</span>
              </div>
              {status.canResend && (
                <button type="button" onClick={() => void onResend()} disabled={busy}
                  className="self-start flex items-center gap-1.5 text-xs font-medium text-[var(--color-error)] underline underline-offset-2 hover:opacity-70 transition-opacity cursor-pointer disabled:opacity-40">
                  <RefreshCw size={11} strokeWidth={2} />
                  Reenviar convite mesmo assim
                </button>
              )}
            </div>
          )}
          {(status.type === "success" || status.type === "resent") && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]">
              <CheckCircle2 size={16} strokeWidth={1.5} className="text-[var(--color-success)] mt-0.5 shrink-0" />
              <span className="text-sm text-[var(--color-success)]">
                {status.type === "resent" ? "Convite reenviado para " : "Convite enviado para "}
                <strong>{status.email}</strong>. A pessoa precisa abrir o e-mail para ativar o acesso.
              </span>
            </div>
          )}
        </div>

        <button type="submit" disabled={busy}
          className="btn-primary w-full !py-3 disabled:opacity-60 disabled:cursor-not-allowed">
          {busy ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Enviando…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Enviar convite
              <Send size={15} strokeWidth={1.75} />
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
