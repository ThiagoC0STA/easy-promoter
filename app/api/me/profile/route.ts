import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-profile";

type Body = {
  displayName?: unknown;
};

export async function PATCH(request: Request) {
  const { user, supabase } = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Faça login para editar seu perfil." },
      { status: 401 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Dados inválidos." },
      { status: 400 },
    );
  }

  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim() : null;

  if (displayName !== null && displayName.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Informe um nome." },
      { status: 400 },
    );
  }
  if (displayName !== null && displayName.length > 80) {
    return NextResponse.json(
      { ok: false, error: "O nome pode ter no máximo 80 caracteres." },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { ok: false, error: "Não foi possível atualizar o perfil." },
      { status: 400 },
    );
  }

  if (displayName !== null) {
    await supabase.auth.updateUser({ data: { display_name: displayName } });
  }

  return NextResponse.json({ ok: true, displayName });
}
