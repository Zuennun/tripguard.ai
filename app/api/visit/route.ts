export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/tokens";

function getDeviceType(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobile|iphone|android/.test(ua)) return "mobile";
  return "desktop";
}

function normalizePath(pathname: string) {
  if (!pathname || pathname.startsWith("/api") || pathname.startsWith("/admin")) return "";
  return pathname.slice(0, 240);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const pathname = normalizePath(String(body?.pathname || ""));
    if (!pathname) {
      return NextResponse.json({ ok: true });
    }

    const referrer = String(body?.referrer || "");
    let referrerHost = "";
    try {
      referrerHost = referrer ? new URL(referrer).hostname.slice(0, 120) : "";
    } catch {}

    const country = req.headers.get("x-vercel-ip-country")?.slice(0, 8) || null;
    const localeHeader = req.headers.get("accept-language") || "";
    const locale = localeHeader.toLowerCase().startsWith("de") ? "de" : "en";
    const userAgent = (req.headers.get("user-agent") || "").slice(0, 500);
    const title = String(body?.title || "").slice(0, 160);

    const db = getSupabaseAdmin();
    const { error } = await db.from("page_visits").insert({
      path: pathname,
      referrer_host: referrerHost || null,
      origin_country: country,
      locale,
      device_type: getDeviceType(userAgent),
      page_title: title || null,
      user_agent: userAgent || null,
    });

    if (error) {
      if (/page_visits|relation .* does not exist/i.test(error.message)) {
        return NextResponse.json({ ok: true, skipped: "page_visits table missing" }, { status: 202 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Visit tracking failed" }, { status: 500 });
  }
}
