"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Save,
  User,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Props = {
  email: string;
  initialDisplayName: string;
};

type Toast = { kind: "success" | "error"; text: string } | null;

export function ProfileForm({ email, initialDisplayName }: Props) {
  const router = useRouter();
  const supabase = React.useMemo(() => createBrowserSupabaseClient(), []);

  const [displayName, setDisplayName] = React.useState(initialDisplayName);
  const [savingName, setSavingName] = React.useState(false);
  const [nameToast, setNameToast] = React.useState<Toast>(null);

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPwd, setShowPwd] = React.useState(false);
  const [savingPwd, setSavingPwd] = React.useState(false);
  const [pwdToast, setPwdToast] = React.useState<Toast>(null);

  async function onSaveName(e: React.FormEvent) {
    e.preventDefault();
    setNameToast(null);
    const trimmed = displayName.trim();
    if (!trimmed) {
      setNameToast({ kind: "error", text: "Informe um nome." });
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: trimmed }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setNameToast({
          kind: "error",
          text: json.error ?? "Não foi possível salvar.",
        });
        return;
      }
      setNameToast({ kind: "success", text: "Nome atualizado." });
      router.refresh();
    } catch {
      setNameToast({ kind: "error", text: "Sem conexão." });
    } finally {
      setSavingName(false);
    }
  }

  async function onSavePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdToast(null);
    if (password.length < 8) {
      setPwdToast({
        kind: "error",
        text: "A senha precisa ter pelo menos 8 caracteres.",
      });
      return;
    }
    if (password !== confirm) {
      setPwdToast({ kind: "error", text: "As senhas não coincidem." });
      return;
    }
    setSavingPwd(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
        data: { password_set: true },
      });
      if (error) {
        setPwdToast({ kind: "error", text: error.message });
        return;
      }
      setPassword("");
      setConfirm("");
      setShowPwd(false);
      setPwdToast({ kind: "success", text: "Senha trocada com sucesso." });
    } catch {
      setPwdToast({ kind: "error", text: "Erro ao trocar senha." });
    } finally {
      setSavingPwd(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="glass-card rounded-[var(--radius-card)] p-6 sm:p-7">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
          Identidade
        </h2>
        <p className="text-sm text-[var(--color-text-tertiary)] mb-5">
          Como você aparece no painel.
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">E-mail</span>
            <div className="relative">
              <Mail
                size={16}
                strokeWidth={1.5}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
              />
              <input
                type="email"
                value={email}
                disabled
                className="input-field input-with-icon min-h-11 opacity-70 cursor-not-allowed"
              />
            </div>
            <span className="text-xs text-[var(--color-text-tertiary)]">
              O e-mail não pode ser alterado por aqui.
            </span>
          </label>

          <form onSubmit={onSaveName} className="flex flex-col gap-3" aria-busy={savingName}>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">Nome</span>
              <div className="relative">
                <User
                  size={16}
                  strokeWidth={1.5}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
                />
                <input
                  type="text"
                  value={displayName}
                  onChange={(ev) => {
                    setDisplayName(ev.target.value);
                    setNameToast(null);
                  }}
                  placeholder="Seu nome"
                  maxLength={80}
                  className="input-field input-with-icon min-h-11"
                />
              </div>
            </label>

            {nameToast && <ToastLine toast={nameToast} />}

            <button
              type="submit"
              disabled={savingName || displayName.trim() === initialDisplayName.trim()}
              className="btn-primary self-start !py-2 !px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingName ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={14} strokeWidth={1.75} />
                  Salvar nome
                </span>
              )}
            </button>
          </form>
        </div>
      </section>

      <section className="glass-card rounded-[var(--radius-card)] p-6 sm:p-7">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
          Senha
        </h2>
        <p className="text-sm text-[var(--color-text-tertiary)] mb-5">
          Trocar a senha de acesso. Mínimo 8 caracteres.
        </p>

        <form onSubmit={onSavePassword} className="flex flex-col gap-4" aria-busy={savingPwd}>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Nova senha</span>
            <div className="relative">
              <KeyRound
                size={16}
                strokeWidth={1.5}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
              />
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(ev) => {
                  setPassword(ev.target.value);
                  setPwdToast(null);
                }}
                autoComplete="new-password"
                minLength={8}
                placeholder="Mínimo 8 caracteres"
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
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Confirmar senha</span>
            <div className="relative">
              <KeyRound
                size={16}
                strokeWidth={1.5}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
              />
              <input
                type={showPwd ? "text" : "password"}
                value={confirm}
                onChange={(ev) => {
                  setConfirm(ev.target.value);
                  setPwdToast(null);
                }}
                autoComplete="new-password"
                minLength={8}
                className="input-field input-with-icon min-h-11"
              />
            </div>
          </label>

          {pwdToast && <ToastLine toast={pwdToast} />}

          <button
            type="submit"
            disabled={savingPwd || password.length === 0}
            className="btn-primary self-start !py-2 !px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingPwd ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save size={14} strokeWidth={1.75} />
                Trocar senha
              </span>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}

function ToastLine({ toast }: { toast: NonNullable<Toast> }) {
  if (toast.kind === "success") {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--color-success)]">
        <CheckCircle2 size={14} strokeWidth={1.75} />
        {toast.text}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--color-error)]">
      <AlertCircle size={14} strokeWidth={1.75} />
      {toast.text}
    </div>
  );
}
