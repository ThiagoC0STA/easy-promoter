import { AppHeader } from "@/components/layout/app-header";

export default function AuthedShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      <AppHeader />
      <main className="flex-1 relative">
        {/* Subtle gradient blob */}
        <div
          className="absolute -top-32 right-0 w-[400px] h-[400px] rounded-full
                     bg-[radial-gradient(circle,rgba(108,92,231,0.06),transparent_65%)]
                     pointer-events-none"
        />
        <div className="relative">{children}</div>
      </main>
    </div>
  );
}
