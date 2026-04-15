import { NextResponse } from "next/server";
import type { ProfileRole } from "@/lib/auth/types";
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (profile.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: InviteBody;
  try {
    body = (await request.json()) as InviteBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  let invitedRole: ProfileRole = "promoter";
  if (body.role === "super_admin") {
    invitedRole = "super_admin";
  }

  const admin = createServiceRoleSupabaseClient();
  const redirectTo = `${getAppOrigin()}/auth/callback?next=/app`;

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: {
      role: invitedRole,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    userId: data.user?.id ?? null,
  });
}
