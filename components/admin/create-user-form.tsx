"use client";

import * as React from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  MessageCircle,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";

type Status =
  | { type: "idle" }
  | {
      type: "success";
      email: string;
      password: string;
      generated: boolean;
    }
  | { type: "error"; message: string };

export function CreateUserForm() {
  const [email, setEmail] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [customPassword, setCustomPassword] = React.useState("");
  const [useCustom, setUseCustom] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState<Status>({ type: "idle" });
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [showPwd, setShowPwd] = React.useState(false);

  async function copyText(value: string, field: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* ignore */
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ type: "idle" });
    setBusy(true);

    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          displayName: displayName.trim() || undefined,
          password: useCustom ? customPassword : undefined,
        }),
      });

      let payload: {
        ok?: boolean;
        error?: string;
        email?: string;
        password?: string;
        generated?: boolean;
      } = {};
      try {
        payload = (await res.json()) as typeof payload;
      } catch {
        /* ignore */
      }

      if (!res.ok || !payload.ok || !payload.email || !payload.password) {
        setStatus({
          type: "error",
          message: payload.error ?? "Não foi possível criar o usuário.",
        });
        return;
      }

      setStatus({
        type: "success",
        email: payload.email,
        password: payload.password,
        generated: payload.generated === true,
      });
      setEmail("");
      setDisplayName("");
      setCustomPassword("");
      setUseCustom(false);
      setShowPwd(false);
    } catch {
      setStatus({
        type: "error",
        message: "Sem conexão. Verifique a internet e tente de novo.",
      });
    } finally {
      setBusy(false);
    }
  }

  function whatsappUrl(email: string, password: string) {
    const msg = `Olá! Sua conta no Easy Promoter foi criada.\n\nE-mail: ${email}\nSenha temporária: ${password}\n\nEntre em https://easy-promoter.vercel.app/login e troque a senha em seguida.`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  }

  return (
    <div className="glass-card rounded-[var(--radius-card)] p-6 sm:p-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-5" aria-busy={busy}>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            E-mail
          </span>
          <div className="relative">
            <Mail
              size={16}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(ev) => {
                setEmail(ev.target.value);
                setStatus({ type: "idle" });
              }}
              placeholder="promoter@exemplo.com"
              autoComplete="email"
              className="input-field input-with-icon min-h-11"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Nome <span className="text-[var(--color-text-tertiary)] font-normal">(opcional)</span>
          </span>
          <div className="relative">
            <User
              size={16}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
            />
            <input
              type="text"
              value={displayName}
              onChange={(ev) => setDisplayName(ev.target.value)}
              placeholder="Nome do promoter"
              className="input-field input-with-icon min-h-11"
            />
          </div>
        </label>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={useCustom}
              onChange={(ev) => setUseCustom(ev.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-accent)] cursor-pointer"
            />
            <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
              Definir senha manualmente
            </span>
          </label>
          {useCustom && (
            <div className="relative ml-6">
              <KeyRound
                size={16}
                strokeWidth={1.5}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
              />
              <input
                type={showPwd ? "text" : "password"}
                required
                minLength={8}
                value={customPassword}
                onChange={(ev) => setCustomPassword(ev.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                className="input-field input-with-icon min-h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] p-1.5"
                aria-label={showPwd ? "Esconder senha" : "Mostrar senha"}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          )}
          {!useCustom && (
            <p className="text-xs text-[var(--color-text-tertiary)] ml-6">
              Vamos gerar uma senha aleatória e mostrar pra você copiar.
            </p>
          )}
        </div>

        <div role="status" aria-live="polite" aria-atomic="true" className="empty:hidden">
          {status.type === "error" && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-error)_25%,transparent)]">
              <AlertCircle
                size={16}
                strokeWidth={1.5}
                className="text-[var(--color-error)] mt-0.5 shrink-0"
              />
              <span className="text-sm text-[var(--color-error)]">{status.message}</span>
            </div>
          )}
          {status.type === "success" && (
            <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2
                  size={16}
                  strokeWidth={1.5}
                  className="text-[var(--color-success)] mt-0.5 shrink-0"
                />
                <span className="text-sm text-[var(--color-success)]">
                  Usuário criado. Copie as credenciais abaixo — esta é a única vez que a senha aparece.
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface-2,rgba(0,0,0,0.2))] border border-[var(--color-border)]">
                  <Mail size={13} className="text-[var(--color-text-tertiary)] shrink-0" />
                  <code className="flex-1 text-xs text-[var(--color-text-secondary)] truncate font-mono">
                    {status.email}
                  </code>
                  <button
                    type="button"
                    onClick={() => void copyText(status.email, "email")}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover,var(--color-surface))] border border-[var(--color-border)] text-[var(--color-text-primary)] transition-colors cursor-pointer shrink-0"
                  >
                    {copiedField === "email" ? (
                      <>
                        <Check size={12} strokeWidth={2.25} className="text-[var(--color-success)]" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy size={12} strokeWidth={2} />
                        Copiar
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface-2,rgba(0,0,0,0.2))] border border-[var(--color-border)]">
                  <KeyRound size={13} className="text-[var(--color-text-tertiary)] shrink-0" />
                  <code className="flex-1 text-xs text-[var(--color-text-secondary)] truncate font-mono">
                    {status.password}
                  </code>
                  <button
                    type="button"
                    onClick={() => void copyText(status.password, "password")}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover,var(--color-surface))] border border-[var(--color-border)] text-[var(--color-text-primary)] transition-colors cursor-pointer shrink-0"
                  >
                    {copiedField === "password" ? (
                      <>
                        <Check size={12} strokeWidth={2.25} className="text-[var(--color-success)]" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy size={12} strokeWidth={2} />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>

              <a
                href={whatsappUrl(status.email, status.password)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] transition-colors"
              >
                <MessageCircle size={14} strokeWidth={2} />
                Enviar credenciais por WhatsApp
              </a>

              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[var(--color-accent-muted)] border border-[color-mix(in_srgb,var(--color-accent)_25%,transparent)]">
                <ShieldCheck
                  size={13}
                  strokeWidth={1.75}
                  className="text-[var(--color-accent)] shrink-0 mt-0.5"
                />
                <p className="text-xs text-[var(--color-text-secondary)] leading-snug">
                  Peça pra pessoa trocar a senha após o primeiro login.
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full !py-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Criando…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Criar usuário
              <UserPlus size={15} strokeWidth={1.75} />
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
