import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/get-profile";

export default async function ProfilePage() {
  const [{ user }, profile] = await Promise.all([
    getCurrentUser(),
    getCurrentProfile(),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-8 sm:py-10">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[var(--color-text-primary)]">
          Meu perfil
        </h1>
        <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
          Atualizar nome e senha de acesso.
        </p>
      </header>

      <ProfileForm
        email={user.email ?? ""}
        initialDisplayName={profile?.display_name ?? ""}
      />
    </div>
  );
}
