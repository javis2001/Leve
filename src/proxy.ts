import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.NODE_ENV !== "production";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPrivate = pathname.startsWith("/app") || pathname.startsWith("/admin");

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (isPrivate && !DEMO) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "?erro=configuracao";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Renova a sessão (obrigatório chamar getUser aqui).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isPrivate && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/login", "/cadastro", "/acesso-pendente", "/auth/:path*"],
};
