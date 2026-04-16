"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Props = {
  initialError?: string | null;
  resetRedirectUrl: string;
};

type Mode = "signin" | "forgot";

export function LoginForm({ initialError, resetRedirectUrl }: Props) {
  const router = useRouter();
  const supabase = React.useMemo(() => createBrowserSupabaseClient(), []);

  const [mode, setMode] = React.useState<Mode>("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(initialError ?? null);
  const [resetSent, setResetSent] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResetSent(false);

    const trimmed = email.trim();

    if (mode === "forgot") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: resetRedirectUrl,
      });
      setBusy(false);
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setResetSent(true);
      return;
    }

    const { error: signError } = await supabase.auth.signInWithPassword({
      email: trimmed,
      password,
    });
    setBusy(false);
    if (signError) {
      setError("E-mail ou senha incorretos.");
      return;
    }
    router.replace("/app");
    router.refresh();
  }

  const isForgot = mode === "forgot";

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-7 sm:p-8 w-full max-w-[400px] mx-auto shadow-[var(--shadow-sm)]">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          {isForgot ? "Recuperar senha" : "Entrar"}
        </h2>
        <p className="text-sm text-[var(--color-text-tertiary)] mt-1.5">
          {isForgot
            ? "Informe seu e-mail e enviaremos um link para definir uma nova senha."
            : "Use seu e-mail e senha para acessar o painel."}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5 bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-error)_25%,transparent)]">
          <AlertCircle size={18} strokeWidth={1.5} className="text-[var(--color-error)] mt-0.5 shrink-0" />
          <span className="text-sm text-[var(--color-error)]">{error}</span>
        </div>
      )}

      {resetSent && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5 bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]">
          <CheckCircle2 size={18} strokeWidth={1.5} className="text-[var(--color-success)] mt-0.5 shrink-0" />
          <span className="text-sm text-[var(--color-success)]">
            Se o e-mail existir na nossa base, você vai receber um link para criar uma nova senha.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">E-mail</span>
          <div className="relative">
            <Mail size={18} strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" />
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="voce@exemplo.com"
              className="input-field input-with-icon"
            />
          </div>
        </label>

        {!isForgot && (
          <label className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Senha</span>
              <button
                type="button"
                onClick={() => { setMode("forgot"); setError(null); setResetSent(false); }}
                className="text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
              >
                Esqueci a senha
              </button>
            </div>
            <div className="relative">
              <Lock size={18} strokeWidth={1.5}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" />
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                className="input-field input-with-icon"
              />
            </div>
          </label>
        )}

        <button type="submit" disabled={busy}
          className="btn-primary w-full !h-11 disabled:opacity-60 disabled:cursor-not-allowed">
          {busy ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Aguarde…
            </span>
          ) : (
            <>
              {isForgot ? "Enviar link de recuperação" : "Entrar"}
              <ArrowRight size={18} strokeWidth={1.75} />
            </>
          )}
        </button>
      </form>

      {isForgot && (
        <div className="mt-6 pt-5 border-t border-[var(--color-border)] text-center">
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(null); setResetSent(false); }}
            className="text-sm font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
          >
            Voltar para entrar
          </button>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-[var(--color-text-tertiary)] flex flex-wrap justify-center gap-x-4 gap-y-1">
        <Link href="/privacidade" className="hover:text-[var(--color-accent)] transition-colors">
          Política de privacidade
        </Link>
        <Link href="/termos" className="hover:text-[var(--color-accent)] transition-colors">
          Termos de uso
        </Link>
      </p>
    </div>
  );
}
