"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, LayoutDashboard, LogOut, Shield, Users } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  KeyboardShortcutsModal,
  useGlobalShortcutHelp,
} from "@/components/layout/keyboard-shortcuts-modal";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { ProfileRole } from "@/lib/auth/types";

export function AppHeader() {
  const pathname = usePathname();
  const supabase = React.useMemo(() => createBrowserSupabaseClient(), []);
  const [email, setEmail] = React.useState<string | null>(null);
  const [role, setRole] = React.useState<ProfileRole | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);

  const showAppHelp =
    Boolean(email) &&
    (pathname.startsWith("/app") || pathname.startsWith("/admin"));

  const dashboardActive =
    pathname === "/app" || pathname === "/app/";
  const contactsActive = pathname.startsWith("/app/contacts");
  const adminActive = pathname.startsWith("/admin");

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      setEmail(user?.email ?? null);

      if (!user) {
        setRole(null);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;
      setRole((data?.role as ProfileRole | undefined) ?? null);
    }

    void load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  useGlobalShortcutHelp(
    () => setShortcutsOpen(true),
    showAppHelp && !shortcutsOpen,
  );

  return (
    <header className="sticky top-0 z-50 glass border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 no-underline group"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center
                            bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)]
                            shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--color-accent)_40%,transparent)]
                            group-hover:shadow-[0_2px_12px_-2px_color-mix(in_srgb,var(--color-accent)_52%,transparent)]
                            transition-shadow duration-200"
              >
                <span className="text-white text-sm font-bold leading-none">
                  E
                </span>
              </div>
              <span className="text-[var(--color-text-primary)] font-semibold text-base tracking-tight hidden sm:inline">
                Easy Promoter
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                href="/app"
                active={dashboardActive}
                icon={<LayoutDashboard size={15} strokeWidth={1.5} />}
              >
                Dashboard
              </NavLink>
              <NavLink
                href="/app/contacts"
                active={contactsActive}
                icon={<Users size={15} strokeWidth={1.5} />}
              >
                Contatos
              </NavLink>
              {role === "super_admin" && (
                <NavLink
                  href="/admin"
                  active={adminActive}
                  icon={<Shield size={15} strokeWidth={1.5} />}
                >
                  Admin
                </NavLink>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {showAppHelp ? (
              <button
                type="button"
                onClick={() => setShortcutsOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-full
                           text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]
                           hover:bg-[var(--color-accent-muted)] transition-all duration-200 cursor-pointer
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                title="Atalhos de teclado"
                aria-label="Abrir lista de atalhos de teclado"
              >
                <HelpCircle size={18} strokeWidth={1.5} />
              </button>
            ) : null}
            {email ? (
              <div className="flex items-center gap-3">
                <span
                  className="hidden sm:inline text-sm text-[var(--color-text-tertiary)] max-w-[180px] truncate"
                  title={email}
                >
                  {email}
                </span>
                <form action="/api/auth/signout" method="post">
                  <button
                    type="submit"
                    className="flex items-center justify-center w-9 h-9 rounded-full
                               text-[var(--color-text-secondary)]
                               hover:text-[var(--color-error)]
                               hover:bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)]
                               transition-all duration-200 cursor-pointer"
                    title="Sair"
                    aria-label="Sair da conta"
                  >
                    <LogOut size={18} strokeWidth={1.5} />
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/login" className="btn-primary !py-2 !px-5 text-sm">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-[var(--color-border)] px-5 py-2 flex gap-2 flex-wrap">
        <MobileNavLink href="/app" active={dashboardActive}>
          Dashboard
        </MobileNavLink>
        <MobileNavLink href="/app/contacts" active={contactsActive}>
          Contatos
        </MobileNavLink>
        {role === "super_admin" && (
          <MobileNavLink href="/admin" active={adminActive}>
            Admin
          </MobileNavLink>
        )}
      </div>

      <KeyboardShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </header>
  );
}

function NavLink({
  href,
  children,
  icon,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium no-underline transition-all duration-200
        ${
          active
            ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)] border border-[color-mix(in_srgb,var(--color-accent)_28%,transparent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent-muted)] border border-transparent"
        }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex-1 min-w-[100px] text-center py-2.5 rounded-xl text-sm font-semibold no-underline transition-all duration-200
        ${
          active
            ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)] border border-[color-mix(in_srgb,var(--color-accent)_28%,transparent)]"
            : "text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)] border border-transparent hover:bg-[var(--color-accent-muted)] hover:text-[var(--color-text-primary)]"
        }`}
    >
      {children}
    </Link>
  );
}
