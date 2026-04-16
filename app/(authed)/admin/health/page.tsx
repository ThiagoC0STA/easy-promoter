import Link from "next/link";
import { Activity } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CHANNEL_URLS_MAINTAINER_DOC } from "@/lib/contacts/channel-urls-doc";
import packageJson from "../../../../package.json";

export default async function AdminHealthPage() {
  let dbOk = false;
  let dbMessage = "Não testado";
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);
    dbOk = !error;
    dbMessage = error ? error.message : "Consulta simples ok";
  } catch (e) {
    dbMessage = e instanceof Error ? e.message : "Erro desconhecido";
  }

  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-10 sm:py-14">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] mb-6 transition-colors"
      >
        Voltar ao admin
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--color-accent-muted)]">
          <Activity size={20} strokeWidth={1.5} className="text-[var(--color-accent)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Saúde do app
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Versão publicada e teste leve de conexão com o Supabase.
          </p>
        </div>
      </div>

      <dl className="glass-card rounded-[var(--radius-card)] p-6 space-y-4 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
            Versão npm
          </dt>
          <dd className="text-[var(--color-text-primary)] font-mono mt-1">
            {packageJson.version}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
            Ambiente Node
          </dt>
          <dd className="text-[var(--color-text-primary)] font-mono mt-1">
            {process.env.NODE_ENV}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
            Supabase (leitura)
          </dt>
          <dd
            className={
              dbOk
                ? "text-[var(--color-success)] mt-1"
                : "text-[var(--color-error)] mt-1"
            }
          >
            {dbOk ? "OK" : "Falhou"}: {dbMessage}
          </dd>
        </div>
      </dl>

      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-tertiary)] mb-2">
          URLs de canal (manutenção)
        </h2>
        <pre className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-[var(--radius-control)] p-4 max-h-64 overflow-y-auto font-mono leading-relaxed">
          {CHANNEL_URLS_MAINTAINER_DOC}
        </pre>
      </section>
    </div>
  );
}
