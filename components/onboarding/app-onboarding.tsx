"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Phone, Users, X } from "lucide-react";

const STORAGE_KEY = "ep_onboarding_v1_done";

const STEPS = [
  {
    title: "Dashboard",
    body: "Veja totais, gráficos e a fila do dia. Tudo reflete a sua base de contatos.",
    Icon: LayoutDashboard,
  },
  {
    title: "Contatos",
    body: "Use busca e filtros. Na lista, tecle / para focar a busca e Esc para fechar filtros.",
    Icon: Users,
  },
  {
    title: "Registrar contato",
    body: "Abra WhatsApp ou Instagram pelo ícone e confirme no modal quando já tiver falado com a pessoa.",
    Icon: Phone,
  },
] as const;

export function AppOnboarding() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!pathname.startsWith("/app")) return;
    if (pathname.startsWith("/app/contacts/") && pathname.includes("/edit")) {
      return;
    }
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      return;
    }
    setOpen(true);
  }, [pathname]);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.Icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="absolute inset-0 bg-[#00000033]" />
      <div
        className="relative w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-xl p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 min-w-10 min-h-10 rounded-lg flex items-center justify-center text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-secondary)] cursor-pointer"
          aria-label="Fechar e não mostrar de novo"
        >
          <X size={20} strokeWidth={1.5} />
        </button>
        <div className="w-12 h-12 rounded-[var(--radius-control)] bg-[var(--color-accent-muted)] flex items-center justify-center mb-4">
          <Icon size={24} strokeWidth={1.5} className="text-[var(--color-accent)]" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-1">
          Passo {step + 1} de {STEPS.length}
        </p>
        <h2
          id="onboarding-title"
          className="text-xl font-bold text-[var(--color-text-primary)] mb-2"
        >
          {current.title}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6">
          {current.body}
        </p>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="min-h-11 px-4 rounded-[var(--radius-control)] text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] cursor-pointer"
          >
            Não mostrar de novo
          </button>
          {!isLast ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="btn-primary min-h-11 justify-center"
            >
              Próximo
            </button>
          ) : (
            <Link href="/app/contacts" className="btn-primary min-h-11 justify-center" onClick={dismiss}>
              Ir para contatos
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
