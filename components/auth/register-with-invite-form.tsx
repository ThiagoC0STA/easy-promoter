"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, KeyRound, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function RegisterWithInviteForm() {
  const router = useRouter();
  const supabase = React.useMemo(() => createBrowserSupabaseClient(), []);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [inviteCode, setInviteCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const trimmedEmail = email.trim();

    try {
      const res = await fetch("/api/auth/register-with-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          inviteCode,
        }),
      });

      let payload: { ok?: boolean; error?: string } = {};
      try {
        payload = (await res.json()) as typeof payload;
      } catch {
        /* ignore */
      }

      if (!res.ok || !payload.ok) {
        setError(payload.error ?? "Não foi possível criar a conta.");
        setBusy(false);
        return;
      }

      const { error: signError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signError) {
        setError(
          "Conta criada, mas o login automático falhou. Entre manualmente na tela de login.",
        );
        setBusy(false);
        return;
      }

      router.replace("/app");
      router.refresh();
    } catch {
      setError("Sem conexão. Verifique a internet e tente de novo.");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-7 sm:p-8 w-full max-w-[400px] mx-auto shadow-[var(--shadow-sm)]">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Criar conta
        </h2>
        <p className="text-sm text-[var(--color-text-tertiary)] mt-1.5">
          Use o código de convite que o administrador enviou. Não é preciso
          abrir o link do e-mail.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5 bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-error)_25%,transparent)]">
          <AlertCircle
            size={18}
            strokeWidth={1.5}
            className="text-[var(--color-error)] mt-0.5 shrink-0"
          />
          <span className="text-sm text-[var(--color-error)]">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Código de convite
          </span>
          <div className="relative">
            <KeyRound
              size={18}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
            />
            <input
              type="text"
              autoComplete="off"
              required
              value={inviteCode}
              onChange={(ev) => setInviteCode(ev.target.value)}
              placeholder="Cole o código aqui"
              className="input-field input-with-icon"
            />
          </div>
        </label>

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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className="input-field input-with-icon"
            />
          </div>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            Mínimo de 8 caracteres.
          </span>
        </label>

        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full !h-11 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Aguarde…
            </span>
          ) : (
            <>
              Criar conta e entrar
              <ArrowRight size={18} strokeWidth={1.75} />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-text-tertiary)]">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--color-accent)] hover:underline"
        >
          Entrar
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-[var(--color-text-tertiary)] flex flex-wrap justify-center gap-x-4 gap-y-1">
        <Link
          href="/privacidade"
          className="hover:text-[var(--color-accent)] transition-colors"
        >
          Política de privacidade
        </Link>
        <Link
          href="/termos"
          className="hover:text-[var(--color-accent)] transition-colors"
        >
          Termos de uso
        </Link>
      </p>
    </div>
  );
}
