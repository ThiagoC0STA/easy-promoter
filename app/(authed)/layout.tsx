import { AppHeader } from "@/components/layout/app-header";

export default function AuthedShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-[var(--color-surface-elevated)] focus:text-[var(--color-text-primary)] focus:border focus:border-[var(--color-accent)] focus:shadow-lg"
      >
        Ir para o conteúdo
      </a>
      <AppHeader />
      <main id="main-content" className="flex-1 relative" tabIndex={-1}>
        <div className="relative">{children}</div>
      </main>
    </div>
  );
}
