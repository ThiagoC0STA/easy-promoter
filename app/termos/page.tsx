import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";

export const metadata: Metadata = {
  title: "Termos de uso | Easy Promoter",
  description: "Termos de uso do Easy Promoter.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      <AppHeader />
      <main className="flex-1 mx-auto max-w-2xl px-5 sm:px-8 py-10 sm:py-14 w-full">
        <p className="text-xs text-[var(--color-text-tertiary)] mb-4">
          <Link href="/" className="text-[var(--color-accent)] hover:underline">
            Voltar ao início
          </Link>
        </p>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
          Termos de uso
        </h1>
        <div className="text-[var(--color-text-secondary)] space-y-4 leading-relaxed text-sm">
          <p>
            Este texto é um <strong>stub</strong>. Substitua por termos validados com a sua
            empresa ou cliente antes de exigir aceite formal na UI.
          </p>
          <p>
            O acesso ao Easy Promoter é por convite. Você concorda em usar o sistema de
            forma lícita, respeitando LGPD e políticas da casa ou produtora que operar a
            base.
          </p>
          <p>
            Funcionalidades e disponibilidade podem mudar com evoluções do produto. Para
            ambientes críticos, combine SLA e suporte por escrito.
          </p>
        </div>
      </main>
    </div>
  );
}
