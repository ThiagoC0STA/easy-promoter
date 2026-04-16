import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SetPasswordForm } from "@/app/bem-vindo/set-password-form";

export default async function WelcomePage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect("/login?error=Sess%C3%A3o%20expirada.%20Abra%20o%20convite%20novamente.");
  }

  const invitedAsSuperAdmin =
    (user.user_metadata as { role?: string } | null)?.role === "super_admin";

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full px-5 sm:px-8 py-12 sm:py-20">
          <SetPasswordForm
            email={user.email ?? ""}
            invitedAsSuperAdmin={invitedAsSuperAdmin}
          />
        </div>
      </main>
    </div>
  );
}
