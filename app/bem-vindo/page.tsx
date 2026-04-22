import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SetPasswordForm } from "@/app/bem-vindo/set-password-form";

export default async function WelcomePage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect("/login?error=Sess%C3%A3o%20expirada.%20Abra%20o%20convite%20novamente.");
  }

  const metadata = (user.user_metadata ?? {}) as {
    role?: string;
    password_set?: boolean;
  };
  if (metadata.password_set === true) {
    redirect("/app");
  }
  const invitedAsSuperAdmin = metadata.role === "super_admin";

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
      <div className="w-full px-5 sm:px-8 py-12 sm:py-20">
        <SetPasswordForm
          email={user.email ?? ""}
          invitedAsSuperAdmin={invitedAsSuperAdmin}
        />
      </div>
    </main>
  );
}
