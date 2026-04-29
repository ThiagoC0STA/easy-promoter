import { NextResponse } from "next/server";
import { mapCreateUserErrorMessage } from "@/lib/auth/register-with-invite-messages";
import {
  isAllowedSignupInviteCode,
  parseSignupInviteCodesFromEnv,
} from "@/lib/auth/signup-invite-codes";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

type Body = {
  email?: unknown;
  password?: unknown;
  inviteCode?: unknown;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const MIN_PASSWORD_LEN = 8;

export async function POST(request: Request) {
  const allowedCodes = parseSignupInviteCodesFromEnv();
  if (allowedCodes.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Cadastro com código não está disponível no momento. Peça um convite ao administrador.",
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
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
  const password = typeof body.password === "string" ? body.password : "";
  const inviteCode =
    typeof body.inviteCode === "string" ? body.inviteCode : "";

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Informe um endereço de e-mail válido." },
      { status: 400 },
    );
  }

  if (password.length < MIN_PASSWORD_LEN) {
    return NextResponse.json(
      {
        ok: false,
        error: `A senha deve ter pelo menos ${MIN_PASSWORD_LEN} caracteres.`,
      },
      { status: 400 },
    );
  }

  if (!isAllowedSignupInviteCode(inviteCode, allowedCodes)) {
    return NextResponse.json(
      { ok: false, error: "Código de convite inválido." },
      { status: 403 },
    );
  }

  let admin;
  try {
    admin = createServiceRoleSupabaseClient();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Serviço indisponível. Tente de novo mais tarde." },
      { status: 500 },
    );
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "promoter" },
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: mapCreateUserErrorMessage(error.message) },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
