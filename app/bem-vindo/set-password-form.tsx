"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Lock, ShieldAlert, Sparkles } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Props = {
  email: string;
  invitedAsSuperAdmin: boolean;
  isRecovery?: boolean;
};

export function SetPasswordForm({ email, invitedAsSuperAdmin, isRecovery = false }: Props) {
  const router = useRouter();
  const supabase = React.useMemo(() => createBrowserSupabaseClient(), []);

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { password_set: true },
    });
    setBusy(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.replace("/app");
    router.refresh();
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-7 sm:p-8 w-full max-w-[420px] mx-auto shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-muted)] flex items-center justify-center">
          <Sparkles size={15} strokeWidth={1.75} className="text-[var(--color-accent)]" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          {isRecovery ? "Definir nova senha" : "Bem-vindo ao Easy Promoter"}
        </h2>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
        {isRecovery ? (
          <>
            Escolha uma nova senha para{" "}
            <strong className="text-[var(--color-text-primary)] font-medium">{email}</strong>.
          </>
        ) : (
          <>
            Defina uma senha para acessar sua conta. Você vai usar ela junto com{" "}
            <strong className="text-[var(--color-text-primary)] font-medium">{email}</strong>{" "}
            nos próximos logins.
          </>
        )}
      </p>

      {invitedAsSuperAdmin && (
        <div className="flex items-start gap-2 px-3 py-2.5 mt-5 rounded-lg bg-amber-500/10 border border-amber-500/25">
          <ShieldAlert size={14} strokeWidth={1.75} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400 leading-snug">
            Você foi convidado como <strong>super admin</strong>. Você terá acesso total
            ao painel, incluindo convidar e remover usuários.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl mt-5 bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-error)_25%,transparent)]">
          <AlertCircle size={18} strokeWidth={1.5} className="text-[var(--color-error)] mt-0.5 shrink-0" />
          <span className="text-sm text-[var(--color-error)]">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Nova senha
          </span>
          <div className="relative">
            <Lock size={18} strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" />
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="input-field input-with-icon"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Confirme a senha
          </span>
          <div className="relative">
            <Lock size={18} strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" />
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(ev) => setConfirm(ev.target.value)}
              className="input-field input-with-icon"
            />
          </div>
        </label>

        <button type="submit" disabled={busy}
          className="btn-primary w-full !h-11 disabled:opacity-60 disabled:cursor-not-allowed">
          {busy ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando…
            </span>
          ) : (
            <>
              <CheckCircle2 size={17} strokeWidth={1.75} />
              Criar senha e entrar
              <ArrowRight size={17} strokeWidth={1.75} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
