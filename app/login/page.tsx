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

  const resetRedirectUrl = `${getAppOrigin()}/auth/confirm`;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      <AppHeader />

      <main className="flex-1 flex items-center justify-center">
        <div className="w-full px-5 sm:px-8 py-12 sm:py-20">
          <LoginForm
            initialError={initialError}
            resetRedirectUrl={resetRedirectUrl}
          />
        </div>
      </main>
    </div>
  );
}
