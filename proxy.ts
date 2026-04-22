import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url?.trim() || !publishableKey?.trim()) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url.trim(), publishableKey.trim(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname === "/login";
  const isWelcomePage = pathname === "/bem-vindo";
  const isProtectedPage =
    pathname.startsWith("/app") || pathname.startsWith("/admin");

  if (!user && isProtectedPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (user) {
    const metadata = (user.user_metadata ?? {}) as { password_set?: boolean };
    const needsPassword = metadata.password_set !== true;

    if (needsPassword && !isWelcomePage) {
      const welcomeUrl = request.nextUrl.clone();
      welcomeUrl.pathname = "/bem-vindo";
      welcomeUrl.search = "";
      return NextResponse.redirect(welcomeUrl);
    }

    if (!needsPassword && isAuthPage) {
      const appUrl = request.nextUrl.clone();
      appUrl.pathname = "/app";
      return NextResponse.redirect(appUrl);
    }

    if (!needsPassword && isWelcomePage) {
      const appUrl = request.nextUrl.clone();
      appUrl.pathname = "/app";
      return NextResponse.redirect(appUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
