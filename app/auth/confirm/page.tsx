"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function mapHashError(code: string | null, description: string | null): string {
  const desc = description ?? "";
  if (/expired/i.test(desc) || code === "otp_expired") {
    return "Este link expirou. Peça um novo convite ou uma nova recuperação de senha.";
  }
  if (/access_denied/i.test(code ?? "")) {
    return "Link inválido ou já utilizado. Peça um novo convite.";
  }
  return desc || "Não foi possível validar o link. Tente novamente.";
}

export default function AuthConfirmPage() {
  const router = useRouter();
  const supabase = React.useMemo(() => createBrowserSupabaseClient(), []);

  React.useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);

    const hashError = params.get("error") ?? params.get("error_code");
    const hashErrorDesc = params.get("error_description");
    if (hashError) {
      const msg = mapHashError(hashError, hashErrorDesc);
      router.replace(`/login?error=${encodeURIComponent(msg)}`);
      return;
    }

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (!accessToken || !refreshToken) {
      router.replace(
        "/login?error=Link+inv%C3%A1lido+ou+expirado.+Pe%C3%A7a+um+novo+convite.",
      );
      return;
    }

    // Clear the hash so tokens don't linger in the URL bar
    try {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch {
      /* ignore */
    }

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          router.replace(`/login?error=${encodeURIComponent(error.message)}`);
          return;
        }
        const dest =
          type === "invite" || type === "recovery" ? "/bem-vindo" : "/app";
        router.replace(dest);
        router.refresh();
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
