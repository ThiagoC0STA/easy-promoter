import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/get-profile";

export default async function AdminAreaLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }
  if (profile.role !== "super_admin") {
    redirect("/app");
  }

  return (
    <>
      <div
        role="status"
        className="border-b border-[color-mix(in_srgb,var(--color-accent)_22%,var(--color-border))]
                   bg-[color-mix(in_srgb,var(--color-accent)_7%,var(--color-surface-secondary))]"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-2.5 flex items-start gap-2.5 text-xs font-medium text-[var(--color-text-secondary)]">
          <Shield
            className="shrink-0 text-[var(--color-accent)] mt-0.5"
            size={15}
            strokeWidth={1.5}
            aria-hidden
          />
          <span>
            Área administrativa: mudanças aqui afetam convites e a lista de promoters.
          </span>
        </div>
      </div>
      {children}
    </>
  );
}
