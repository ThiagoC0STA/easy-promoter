import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Music2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";

const FEATURES = [
  {
    title: "Cooldown inteligente",
    body: "Veja quando cada pessoa foi contatada e evite chamar de novo cedo demais.",
    Icon: Clock,
    gradient: "from-violet-500/20 to-blue-500/20",
    iconColor: "text-violet-500",
  },
  {
    title: "Perfil musical completo",
    body: "Gêneros, aniversário, Instagram e WhatsApp reunidos no mesmo lugar.",
    Icon: Music2,
    gradient: "from-pink-500/20 to-orange-500/20",
    iconColor: "text-pink-500",
  },
  {
    title: "Acesso controlado",
    body: "Sem signup público. Só entra quem o super admin convidar por e-mail.",
    Icon: ShieldCheck,
    gradient: "from-emerald-500/20 to-cyan-500/20",
    iconColor: "text-emerald-500",
  },
] as const;

const STATS = [
  { value: "0s", label: "Tempo de setup" },
  { value: "100%", label: "Sem planilha" },
  { value: "24/7", label: "Disponível" },
] as const;

type Props = {
  user: User | null;
};

export function LandingView({ user }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      <AppHeader />

      <main className="flex-1 relative overflow-hidden">
        {/* Gradient orbs */}
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full
                     bg-[radial-gradient(circle,rgba(108,92,231,0.15),transparent_65%)]
                     animate-float-slow pointer-events-none"
        />
        <div
          className="absolute top-20 -right-32 w-[500px] h-[500px] rounded-full
                     bg-[radial-gradient(circle,rgba(139,124,246,0.12),transparent_65%)]
                     animate-float-slower pointer-events-none"
        />
        <div
          className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full
                     bg-[radial-gradient(circle,rgba(108,92,231,0.08),transparent_60%)]
                     animate-float-slow pointer-events-none"
        />

        {/* Hero */}
        <section className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-16 sm:pt-24 pb-20">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="badge-accent animate-fade-in-up mb-6">
              <Sparkles size={14} strokeWidth={2} aria-hidden />
              CRM para promoters
            </div>

            <h1
              className="text-[2.75rem] sm:text-6xl md:text-7xl font-extrabold tracking-tight
                         leading-[1.05] text-[var(--color-text-primary)]
                         animate-fade-in-up-delay-1"
            >
              Menos planilha.
              <br />
              <span className="bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] bg-clip-text text-transparent">
                Mais ritmo.
              </span>
            </h1>

            <p
              className="mt-6 text-lg sm:text-xl text-[var(--color-text-secondary)]
                         max-w-xl leading-relaxed animate-fade-in-up-delay-2"
            >
              Organize contatos, respeite intervalos entre abordagens e saiba
              quem curte cada som antes de chamar pro rolê.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up-delay-3">
              {user ? (
                <Link href="/app" className="btn-primary">
                  Abrir plataforma
                  <ArrowRight size={18} strokeWidth={1.75} />
                </Link>
              ) : (
                <>
                  <Link href="/login" className="btn-primary">
                    Começar agora
                    <ArrowRight size={18} strokeWidth={1.75} />
                  </Link>
                  <Link href="/login" className="btn-secondary">
                    Já tenho acesso
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 flex justify-center">
            <div
              className="glass-card rounded-2xl px-8 py-5 grid grid-cols-3 divide-x
                         divide-[var(--color-border)] w-full max-w-md"
            >
              {STATS.map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center px-4">
                  <span className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {value}
                  </span>
                  <span className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="relative mx-auto max-w-6xl px-5 sm:px-8 pb-24">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3">
              Funcionalidades
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Tudo que um promoter precisa
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {FEATURES.map(({ title, body, Icon, gradient, iconColor }) => (
              <div key={title} className="glass-card rounded-2xl p-6 flex flex-col gap-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient}
                              flex items-center justify-center`}
                >
                  <Icon size={22} strokeWidth={1.5} className={iconColor} />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative mx-auto max-w-6xl px-5 sm:px-8 pb-24">
          <div
            className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden
                       bg-gradient-to-br from-[#6c5ce7] to-[#8b7cf6]"
          >
            <div
              className="absolute -top-20 -right-20 w-72 h-72 rounded-full
                         bg-white/10 blur-3xl pointer-events-none"
            />
            <div
              className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full
                         bg-white/10 blur-3xl pointer-events-none"
            />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Pronto pra organizar sua lista?
              </h2>
              <p className="text-white/80 mb-8 max-w-md mx-auto">
                Peça seu convite ao admin e comece a usar agora. Zero setup, zero
                planilha.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold
                           text-[#6c5ce7] bg-white shadow-lg
                           hover:shadow-xl hover:translate-y-[-1px]
                           transition-all duration-200"
              >
                Acessar plataforma
                <ArrowRight size={18} strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-[var(--color-text-tertiary)]">
            © {new Date().getFullYear()} Easy Promoter
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            Feito para promoters e casas noturnas
          </span>
        </div>
      </footer>
    </div>
  );
}
