import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getPublicSupabaseConfig } from "@/lib/env/public-env";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextRaw = requestUrl.searchParams.get("next") ?? "/app";
  const nextPath = nextRaw.startsWith("/") ? nextRaw : "/app";

  const { url: supabaseUrl, publishableKey } = getPublicSupabaseConfig();

  const redirectWithCookies = (target: URL) => {
    const response = NextResponse.redirect(target);
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
    return { response, supabase };
  };

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", requestUrl.origin),
    );
  }

  const successTarget = new URL(nextPath, requestUrl.origin);
  const { response, supabase } = redirectWithCookies(successTarget);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error.message)}`,
        requestUrl.origin,
      ),
    );
  }

  return response;
}
