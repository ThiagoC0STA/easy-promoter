import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { RegisterWithInviteForm } from "@/components/auth/register-with-invite-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function CadastroPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      <AppHeader />

      <main className="flex-1 flex items-center justify-center">
        <div className="w-full px-5 sm:px-8 py-12 sm:py-20">
          <RegisterWithInviteForm />
          <p className="mt-6 text-center text-xs text-[var(--color-text-tertiary)] max-w-md mx-auto">
            Super administradores continuam podendo convidar por e-mail na área
            admin.{" "}
            <Link href="/" className="text-[var(--color-accent)] hover:underline">
              Voltar à página inicial
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
