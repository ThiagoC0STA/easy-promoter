import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Music2,
  ShieldCheck,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";

const FEATURES = [
  {
    title: "Cooldown inteligente",
    body: "Veja quando cada pessoa foi contatada e evite chamar de novo cedo demais.",
    Icon: Clock,
  },
  {
    title: "Perfil musical completo",
    body: "Gêneros, aniversário, Instagram e WhatsApp reunidos no mesmo lugar.",
    Icon: Music2,
  },
  {
    title: "Acesso controlado",
    body: "Sem signup público. Só entra quem o super admin convidar por e-mail.",
    Icon: ShieldCheck,
  },
] as const;

type Props = {
  user: User | null;
};

export function LandingView({ user }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      <AppHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-5 sm:px-8 pt-20 sm:pt-28 pb-20">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)] border border-[var(--color-border)] mb-6">
              CRM para promoters
            </span>

            <h1
              className="text-[2.5rem] sm:text-[3.5rem] md:text-[4rem] font-semibold tracking-tight
                         leading-[1.05] text-[var(--color-text-primary)]"
            >
              Menos planilha.
              <br />
              <span className="text-[var(--color-accent)]">
                Mais ritmo.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl leading-relaxed">
              Organize contatos, respeite intervalos entre abordagens e saiba
              quem curte cada som antes de chamar pro rolê.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              {user ? (
                <Link href="/app" className="btn-primary">
                  Abrir plataforma
                  <ArrowRight size={15} strokeWidth={1.75} />
                </Link>
              ) : (
                <>
                  <Link href="/login" className="btn-primary">
                    Começar agora
                    <ArrowRight size={15} strokeWidth={1.75} />
                  </Link>
                  <Link href="/login" className="btn-secondary">
                    Já tenho acesso
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-5 sm:px-8 pb-20">
          <div className="mb-10 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              Tudo que um promoter precisa
            </h2>
            <p className="text-sm text-[var(--color-text-tertiary)] mt-2">
              Ferramentas simples pra substituir a planilha e ganhar ritmo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURES.map(({ title, body, Icon }) => (
              <div
                key={title}
                className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 flex flex-col gap-3"
              >
                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
                  <Icon size={16} strokeWidth={1.75} />
                </div>
                <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
                  {title}
                </h3>
                <p className="text-sm text-[var(--color-text-tertiary)] leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-5 sm:px-8 pb-24">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-6 py-10 sm:px-10 sm:py-12 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] mb-2">
              Pronto pra organizar sua lista?
            </h2>
            <p className="text-sm text-[var(--color-text-tertiary)] mb-6 max-w-md mx-auto">
              Peça seu convite ao admin e comece a usar agora. Zero setup.
            </p>
            <Link href="/login" className="btn-primary">
              Acessar plataforma
              <ArrowRight size={15} strokeWidth={1.75} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[var(--color-text-tertiary)]">
            © {new Date().getFullYear()} Easy Promoter
          </span>
          <div className="flex gap-5 text-xs">
            <Link
              href="/privacidade"
              className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Privacidade
            </Link>
            <Link
              href="/termos"
              className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Termos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
