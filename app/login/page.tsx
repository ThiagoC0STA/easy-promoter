import { AppHeader } from "@/components/layout/app-header";
import { LoginForm } from "@/app/login/login-form";
import { getAppOrigin } from "@/lib/env/site-url";

type SearchParams = { error?: string | string[] };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const rawError = params.error;
  const initialError =
    typeof rawError === "string" && rawError.length > 0
      ? decodeURIComponent(rawError)
      : null;

  const emailRedirectUrl = `${getAppOrigin()}/auth/callback?next=/app`;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      <AppHeader />

      <main className="flex-1 relative overflow-hidden flex items-center justify-center">
        <div
          className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full
                     bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-accent)_14%,transparent),transparent_65%)]
                     animate-float-slow pointer-events-none"
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full
                     bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-accent-light)_12%,transparent),transparent_65%)]
                     animate-float-slower pointer-events-none"
        />

        <div className="relative w-full px-5 sm:px-8 py-12 sm:py-20">
          <div className="flex flex-col items-center gap-8">
            <LoginForm
              initialError={initialError}
              emailRedirectUrl={emailRedirectUrl}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
