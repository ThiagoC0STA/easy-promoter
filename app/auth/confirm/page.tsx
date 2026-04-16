"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function AuthConfirmPage() {
  const router = useRouter();
  const supabase = React.useMemo(() => createBrowserSupabaseClient(), []);

  React.useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (!accessToken || !refreshToken) {
      router.replace("/login?error=Link+inv%C3%A1lido+ou+expirado.");
      return;
    }

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          router.replace(`/login?error=${encodeURIComponent(error.message)}`);
          return;
        }
        const dest = type === "invite" || type === "recovery" ? "/bem-vindo" : "/app";
        router.replace(dest);
      });
  }, [supabase, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
      <div className="flex flex-col items-center gap-3">
        <span className="w-6 h-6 border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-text-tertiary)]">Verificando acesso…</p>
      </div>
    </div>
  );
}
