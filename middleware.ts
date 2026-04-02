import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin protection ──────────────────────────────────────────────────────
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = req.cookies.get("admin_session");
    if (!session || session.value !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // ── Locale detection ──────────────────────────────────────────────────────
  const acceptLanguage = req.headers.get("accept-language") || "";
  const isGerman = acceptLanguage.toLowerCase().startsWith("de");
  const locale = isGerman ? "de" : "en";

  const res = NextResponse.next();
  res.headers.set("x-locale", locale);
  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
