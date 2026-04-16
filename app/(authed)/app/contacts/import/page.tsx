import Link from "next/link";
import { FileUp } from "lucide-react";
import { CsvImportForm } from "@/components/contacts/csv-import-form";

export default function ImportContactsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-10 sm:py-14">
      <Link
        href="/app/contacts"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] mb-6 transition-colors"
      >
        Voltar para contatos
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--color-accent-muted)]">
          <FileUp size={20} strokeWidth={1.5} className="text-[var(--color-accent)]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Importar CSV
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Pré-visualize e confirme antes de gravar na sua base.
          </p>
        </div>
      </div>
      <CsvImportForm />
    </div>
  );
}
