import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";

export const metadata: Metadata = {
  title: "Política de privacidade | Easy Promoter",
  description: "Como tratamos dados no Easy Promoter.",
};

export default function PrivacyPage() {
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
          Política de privacidade
        </h1>
        <div className="text-[var(--color-text-secondary)] space-y-4 leading-relaxed text-sm">
          <p>
            Este texto é um <strong>stub</strong> para você substituir por uma política
            revisada por assessoria jurídica. Enquanto isso, descrevemos de forma simples o
            que o produto costuma fazer.
          </p>
          <p>
            O Easy Promoter armazena dados de contatos e perfis de usuários convidados,
            hospedados no Supabase, com acesso controlado por login e regras de segurança
            no banco (RLS).
          </p>
          <p>
            Não vendemos a sua lista de contatos. O uso dos dados segue o que for combinado
            com o responsável legal da sua operação (contrato ou termo específico).
          </p>
          <p>
            Para solicitar correção, exportação ou exclusão de dados pessoais, use o canal
            oficial que a sua organização definir com o suporte do produto.
          </p>
        </div>
      </main>
    </div>
  );
}
