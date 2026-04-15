import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "@/lib/env/public-env";

export async function POST(request: NextRequest) {
  const { url: supabaseUrl, publishableKey } = getPublicSupabaseConfig();
  const origin = new URL(request.url).origin;

  const response = NextResponse.redirect(new URL("/", origin), 303);

  const supabase = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.signOut();

  return response;
}
