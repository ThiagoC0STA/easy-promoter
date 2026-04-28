import { NextResponse } from "next/server";
import { mapInviteUserErrorMessage } from "@/lib/admin/invite-user-messages";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";

type CreateBody = {
  email?: unknown;
  password?: unknown;
  displayName?: unknown;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generatePassword(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json(
      { ok: false, error: "Faça login para criar usuários." },
      { status: 401 },
    );
  }
  if (profile.role !== "super_admin") {
    return NextResponse.json(
      { ok: false, error: "Somente super admins podem criar usuários." },
      { status: 403 },
    );
  }

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Dados inválidos. Atualize a página e tente de novo." },
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

  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim() : "";

  let password =
    typeof body.password === "string" ? body.password.trim() : "";
  if (password && password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "A senha precisa ter pelo menos 8 caracteres." },
      { status: 400 },
    );
  }
  const generated = !password;
  if (generated) password = generatePassword();

  const admin = createServiceRoleSupabaseClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "promoter",
      password_set: false,
      ...(displayName ? { display_name: displayName } : {}),
    },
  });

  if (error || !data.user) {
    return NextResponse.json(
      { ok: false, error: mapInviteUserErrorMessage(error?.message ?? "") },
      { status: 400 },
    );
  }

  const userId = data.user.id;

  if (displayName) {
    await admin
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", userId);
  }

  return NextResponse.json({
    ok: true,
    userId,
    email,
    password,
    generated,
  });
}
