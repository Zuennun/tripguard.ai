import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const SCRAPER_URL   = process.env.SCRAPER_URL;
const SCRAPER_TOKEN = process.env.SCRAPER_TOKEN ?? "";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const hotelName = searchParams.get("hotel") ?? "";
  const city      = searchParams.get("city") ?? "";
  const checkin   = searchParams.get("checkin") ?? "";
  const checkout  = searchParams.get("checkout") ?? "";
  const roomType  = searchParams.get("roomType") ?? "";
  const mealPlan  = searchParams.get("mealPlan") ?? "";

  if (!hotelName) return NextResponse.json({ error: "Missing hotel" }, { status: 400 });

  if (SCRAPER_URL) {
    try {
      const params = new URLSearchParams({ hotel: hotelName, city, checkin, checkout, roomType, mealPlan });
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 55000);

      let res: Response;
      try {
        res = await fetch(`${SCRAPER_URL}/scrape?${params}`, {
          headers: { "x-scraper-token": SCRAPER_TOKEN },
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }

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
