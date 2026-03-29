import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

const HEADERS: Record<string, string> = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8",
  "Cache-Control": "no-cache",
};

function extractPrices(text: string): number[] {
  const prices: number[] = [];
  const patterns = [
    /(\d{2,4})\s*€/g,
    /€\s*(\d{2,4})/g,
    /EUR\s*(\d{2,4})/g,
    /(\d{2,4})\s*EUR/g,
  ];
  for (const pattern of patterns) {
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      const p = parseInt(m[1] ?? "0", 10);
      if (p >= 40 && p <= 9999) prices.push(p);
    }
  }
  return Array.from(new Set(prices)).sort((a, b) => a - b);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

type ScrapeResult =
  | { source: string; status: number; prices: number[]; lowest: number | null }
  | { source: string; error: string };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hotelName = searchParams.get("hotel") ?? "";
  const city      = searchParams.get("city") ?? "";
  const checkin   = searchParams.get("checkin") ?? "";
  const checkout  = searchParams.get("checkout") ?? "";

  if (!hotelName) return NextResponse.json({ error: "Missing hotel" }, { status: 400 });

  const results: ScrapeResult[] = [];

  // ── Google Search ──────────────────────────────────────────────────────────
  try {
    const q   = encodeURIComponent(`${hotelName} ${city} hotel preis ${checkin}`);
    const url = `https://www.google.com/search?q=${q}&hl=de&gl=de&num=10`;
    const res = await fetch(url, { headers: HEADERS });
    const text = stripHtml(await res.text());
    const prices = extractPrices(text);
    results.push({ source: "Google Search", status: res.status, prices: prices.slice(0, 8), lowest: prices[0] ?? null });
  } catch (e) {
    results.push({ source: "Google Search", error: String(e) });
  }

  // ── Google Hotels ──────────────────────────────────────────────────────────
  try {
    const q   = encodeURIComponent(`${hotelName} ${city}`);
    const url = `https://www.google.com/travel/hotels?q=${q}&checkin=${checkin}&checkout=${checkout}&hl=de`;
    const res = await fetch(url, { headers: HEADERS });
    const text = stripHtml(await res.text());
    const prices = extractPrices(text);
    results.push({ source: "Google Hotels", status: res.status, prices: prices.slice(0, 8), lowest: prices[0] ?? null });
  } catch (e) {
    results.push({ source: "Google Hotels", error: String(e) });
  }

  // ── Booking.com ────────────────────────────────────────────────────────────
  try {
    const q = encodeURIComponent(`${hotelName} ${city}`);
    const ciParts = checkin.split("-");
    const coParts = checkout.split("-");
    const ciQuery = ciParts.length === 3
      ? `&checkin_year=${ciParts[0]}&checkin_month=${parseInt(ciParts[1] ?? "1", 10)}&checkin_monthday=${parseInt(ciParts[2] ?? "1", 10)}`
      : "";
    const coQuery = coParts.length === 3
      ? `&checkout_year=${coParts[0]}&checkout_month=${parseInt(coParts[1] ?? "1", 10)}&checkout_monthday=${parseInt(coParts[2] ?? "1", 10)}`
      : "";
    const url = `https://www.booking.com/search.html?ss=${q}&lang=de${ciQuery}${coQuery}`;
    const res = await fetch(url, { headers: HEADERS });
    const text = stripHtml(await res.text());
    const prices = extractPrices(text);
    results.push({ source: "Booking.com", status: res.status, prices: prices.slice(0, 8), lowest: prices[0] ?? null });
  } catch (e) {
    results.push({ source: "Booking.com", error: String(e) });
  }

  const allPrices = results.flatMap(r => "prices" in r ? r.prices : []);
  const lowest = allPrices.length ? Math.min(...allPrices) : null;

  return NextResponse.json({ hotel: hotelName, city, checkin, checkout, results, lowestFound: lowest });
}
