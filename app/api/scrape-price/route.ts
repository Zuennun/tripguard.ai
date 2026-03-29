import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

// If SCRAPER_URL is set, use the Railway Playwright scraper.
// Otherwise fall back to a simple fetch (limited by bot detection).
const SCRAPER_URL   = process.env.SCRAPER_URL;
const SCRAPER_TOKEN = process.env.SCRAPER_TOKEN ?? "savemyholiday-secret";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hotelName = searchParams.get("hotel") ?? "";
  const city      = searchParams.get("city") ?? "";
  const checkin   = searchParams.get("checkin") ?? "";
  const checkout  = searchParams.get("checkout") ?? "";

  if (!hotelName) return NextResponse.json({ error: "Missing hotel" }, { status: 400 });

  // ── Use Railway Playwright scraper ─────────────────────────────────────────
  if (SCRAPER_URL) {
    try {
      const params = new URLSearchParams({ hotel: hotelName, city, checkin, checkout });
      const res = await fetch(`${SCRAPER_URL}/scrape?${params}`, {
        headers: { "x-scraper-token": SCRAPER_TOKEN },
        signal: AbortSignal.timeout(55000),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: `Scraper error: ${err}` }, { status: res.status });
      }

      const data = await res.json();
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json({ error: `Scraper unreachable: ${String(e)}` }, { status: 502 });
    }
  }

  // ── Fallback: no scraper configured ────────────────────────────────────────
  return NextResponse.json({
    hotel: hotelName,
    city,
    checkin,
    checkout,
    results: [],
    lowestFound: null,
    note: "Set SCRAPER_URL env var to enable real price scraping.",
  });
}
