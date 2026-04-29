import { redirect } from "next/navigation";
import { OnlineStatusBanner } from "@/components/layout/online-status-banner";
import { AppOnboarding } from "@/components/onboarding/app-onboarding";
import { PromoterShell } from "@/components/promoter-shell/promoter-shell";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/get-profile";
import { getContacts } from "@/lib/contacts/queries";
import { buildBuckets } from "@/lib/contacts/queue";

function initialsOf(name: string | null, email: string) {
  const source = (name && name.trim()) || email.split("@")[0] || "";
  return source
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AuthedShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ user }, profile] = await Promise.all([
    getCurrentUser(),
    getCurrentProfile(),
  ]);
  if (!user) {
    redirect("/login");
  }

  const contacts = await getContacts();
  const { all, queue, birthdays, rescue } = buildBuckets(contacts);

  const email = user.email ?? "";
  const displayName = profile?.display_name ?? "";
  const initials = initialsOf(displayName, email);

  return (
    <PromoterShell
      email={email}
      displayName={displayName}
      initials={initials}
      role={profile?.role ?? null}
      queueCount={queue.length}
      birthdaysCount={birthdays.length}
      rescueCount={rescue.length}
      contactsCount={contacts.length}
      focusQueue={queue}
      focusBirthdays={birthdays}
      focusRescue={rescue}
      focusAll={all}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-[var(--color-surface-elevated)] focus:text-[var(--color-text-primary)] focus:border focus:border-[var(--color-accent)] focus:shadow-lg"
      >
        Ir para o conteúdo
      </a>
      <OnlineStatusBanner />
      <div id="main-content">{children}</div>
      <AppOnboarding />
    </PromoterShell>
  );
}
