"use client";

import * as React from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Props = {
  initialError?: string | null;
  emailRedirectUrl: string;
};

export function LoginForm({ initialError, emailRedirectUrl }: Props) {
  const router = useRouter();
  const supabase = React.useMemo(() => createBrowserSupabaseClient(), []);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [usePassword, setUsePassword] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(
    initialError ?? null,
  );
  const [linkSent, setLinkSent] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setLinkSent(false);

    const trimmed = email.trim();

    if (usePassword) {
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password,
      });
      setBusy(false);
      if (signError) {
        setError(signError.message);
        return;
      }
      router.replace("/app");
      router.refresh();
      return;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: emailRedirectUrl },
    });
    setBusy(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setLinkSent(true);
  }

  return (
    <div className="glass-card rounded-2xl p-7 sm:p-9 w-full max-w-[420px] mx-auto">
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center
                        bg-gradient-to-br from-[#6c5ce7]/20 to-[#8b7cf6]/20"
          >
            <Lock size={20} strokeWidth={1.5} className="text-[var(--color-accent)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Entrar
          </h2>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {usePassword
            ? "Use seu e-mail e senha para acessar."
            : "Informe seu e-mail e receba um link de acesso."}
        </p>
      </div>

      {(error || initialError) && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5 bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-error)_25%,transparent)]">
          <AlertCircle size={18} strokeWidth={1.5} className="text-[var(--color-error)] mt-0.5 shrink-0" />
          <span className="text-sm text-[var(--color-error)]">{error ?? initialError}</span>
        </div>
      )}

      {linkSent && !usePassword && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5 bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]">
          <CheckCircle2 size={18} strokeWidth={1.5} className="text-[var(--color-success)] mt-0.5 shrink-0" />
          <span className="text-sm text-[var(--color-success)]">
            Pronto. Abra o e-mail neste dispositivo e toque no link para entrar.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            E-mail
          </span>
          <div className="relative">
            <Mail
              size={18}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
            />
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

        {usePassword && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              Senha
            </span>
            <div className="relative">
              <Lock
                size={18}
                strokeWidth={1.5}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
              />
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

        <button type="submit" disabled={busy} className="btn-primary w-full !py-3 disabled:opacity-60 disabled:cursor-not-allowed">
          {busy ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Aguarde…
            </span>
          ) : (
            <>
              {usePassword ? "Entrar com senha" : "Continuar"}
              <ArrowRight size={18} strokeWidth={1.75} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-[var(--color-border)] text-center">
        <button
          type="button"
          onClick={() => {
            setUsePassword((v) => !v);
            setError(null);
            setLinkSent(false);
          }}
          className="text-sm font-medium text-[var(--color-text-tertiary)]
                     hover:text-[var(--color-accent)] transition-colors duration-200 cursor-pointer"
        >
          {usePassword
            ? "Receber acesso por e-mail"
            : "Entrar com e-mail e senha"}
        </button>
      </div>
    </div>
  );
}
