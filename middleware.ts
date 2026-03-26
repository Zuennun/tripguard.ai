import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const acceptLanguage = req.headers.get("accept-language") || "";

  // DE if: urlaubswächter domain OR browser language is German (DACH region)
  const isDeDomain = host.includes("urlaubsw");
  const isDeLanguage = acceptLanguage.toLowerCase().startsWith("de");

  const locale = isDeDomain || isDeLanguage ? "de" : "en";

  const res = NextResponse.next();
  res.headers.set("x-locale", locale);
  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
