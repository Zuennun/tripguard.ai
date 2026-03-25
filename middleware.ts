import { NextRequest, NextResponse } from "next/server";

const DE_DOMAINS = ["urlaubswächter.de", "xn--urlaubswchter-mlb.de", "urlaubswaechter.de"];

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const isDe = DE_DOMAINS.some(d => host.includes(d)) || host.includes("urlaubsw");

  const locale = isDe ? "de" : "en";

  const res = NextResponse.next();
  res.headers.set("x-locale", locale);
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
