export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function isAdmin() {
  return cookies().get("admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const hotel = searchParams.get("hotel") ?? "";
  const city = searchParams.get("city") ?? "";
  const checkin = searchParams.get("checkin") ?? "";
  const checkout = searchParams.get("checkout") ?? "";
  const currency = searchParams.get("currency") ?? "EUR";
  const tripadvisorUrl = searchParams.get("tripadvisorUrl") ?? "";

  const SCRAPER_URL = process.env.SCRAPER_URL;
  const SCRAPER_TOKEN = process.env.SCRAPER_TOKEN ?? "";
  if (!SCRAPER_URL) {
    return NextResponse.json({ error: "SCRAPER_URL not set" }, { status: 500 });
  }

  const params = new URLSearchParams({ hotel, city, checkin, checkout, currency });
  if (tripadvisorUrl) {
    params.set("tripadvisorUrl", tripadvisorUrl);
  }
  const res = await fetch(`${SCRAPER_URL}/multi-debug?${params}`, {
    headers: { "x-scraper-token": SCRAPER_TOKEN },
    signal: AbortSignal.timeout(120000),
  });
  const data = await res.json();
  return NextResponse.json(data);
}
