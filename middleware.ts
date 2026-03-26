import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
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
