import { NextResponse } from "next/server";
import type { ProfileRole } from "@/lib/auth/types";
import { mapInviteUserErrorMessage } from "@/lib/admin/invite-user-messages";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getAppOrigin } from "@/lib/env/site-url";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

type InviteBody = {
  email?: unknown;
  role?: unknown;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json(
      { ok: false, error: "Faça login para enviar convites." },
      { status: 401 },
    );
  }
  if (profile.role !== "super_admin") {
    return NextResponse.json(
      { ok: false, error: "Somente super admins podem enviar convites." },
      { status: 403 },
    );
  }

  let body: InviteBody;
  try {
    body = (await request.json()) as InviteBody;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Dados inválidos na requisição. Atualize a página e tente de novo.",
      },
      { status: 400 },
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Informe um endereço de e-mail válido." },
      { status: 400 },
    );
  }

  let invitedRole: ProfileRole = "promoter";
  if (body.role === "super_admin") {
    invitedRole = "super_admin";
  }

  const admin = createServiceRoleSupabaseClient();
  const redirectTo = `${getAppOrigin()}/auth/callback?next=/bem-vindo`;

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: {
      role: invitedRole,
    },
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: mapInviteUserErrorMessage(error.message) },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    userId: data.user?.id ?? null,
  });
}
