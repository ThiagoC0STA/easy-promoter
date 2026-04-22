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
  const redirectTo = `${getAppOrigin()}/auth/confirm`;

  const inviteResult = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      redirectTo,
      data: {
        role: invitedRole,
      },
    },
  });

  let actionLink = inviteResult.data.properties?.action_link ?? null;
  let userId = inviteResult.data.user?.id ?? null;
  let regenerated = false;

  if (inviteResult.error) {
    const msg = inviteResult.error.message.toLowerCase();
    const alreadyExists =
      msg.includes("already") &&
      (msg.includes("registered") ||
        msg.includes("exists") ||
        msg.includes("user"));

    if (!alreadyExists) {
      return NextResponse.json(
        { ok: false, error: mapInviteUserErrorMessage(inviteResult.error.message) },
        { status: 400 },
      );
    }

    // Usuário já existe (aba fechada antes de criar senha, ou reenvio).
    // Gera um recovery link — funciona pra user existente e cai no /bem-vindo.
    const recoveryResult = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    if (recoveryResult.error) {
      return NextResponse.json(
        { ok: false, error: mapInviteUserErrorMessage(recoveryResult.error.message) },
        { status: 400 },
      );
    }

    actionLink = recoveryResult.data.properties?.action_link ?? null;
    userId = recoveryResult.data.user?.id ?? null;
    regenerated = true;
  }

  if (!actionLink) {
    return NextResponse.json(
      {
        ok: false,
        error: "Convite criado, mas o link não foi retornado. Tente novamente.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    userId,
    inviteLink: actionLink,
    email,
    regenerated,
  });
}
