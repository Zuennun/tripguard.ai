import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

const HEADERS = {
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
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const p = parseInt(m[1]);
      if (p >= 40 && p <= 9999) prices.push(p);
    }
  }
  return [...new Set(prices)].sort((a, b) => a - b);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hotelName  = searchParams.get("hotel") ?? "";
  const city       = searchParams.get("city") ?? "";
  const checkin    = searchParams.get("checkin") ?? "";
  const checkout   = searchParams.get("checkout") ?? "";

  if (!hotelName) return NextResponse.json({ error: "Missing hotel" }, { status: 400 });

  const results = [];

  // ── Google Search ──────────────────────────────────────────────────────────
  try {
    const q = encodeURIComponent(`${hotelName} ${city} hotel preis ${checkin}`);
    const url = `https://www.google.com/search?q=${q}&hl=de&gl=de&num=10`;
    const res  = await fetch(url, { headers: HEADERS });
    const text = stripHtml(await res.text());
    const prices = extractPrices(text);
    results.push({ source: "Google Search", status: res.status, prices: prices.slice(0, 8), lowest: prices[0] ?? null });
  } catch (e: unknown) {
    results.push({ source: "Google Search", error: String(e) });
  }

  // ── Google Hotels ──────────────────────────────────────────────────────────
  try {
    const q = encodeURIComponent(`${hotelName} ${city}`);
    const url = `https://www.google.com/travel/hotels?q=${q}&checkin=${checkin}&checkout=${checkout}&hl=de`;
    const res  = await fetch(url, { headers: HEADERS });
    const text = stripHtml(await res.text());
    const prices = extractPrices(text);
    results.push({ source: "Google Hotels", status: res.status, prices: prices.slice(0, 8), lowest: prices[0] ?? null });
  } catch (e: unknown) {
    results.push({ source: "Google Hotels", error: String(e) });
  }

  // ── Booking.com ────────────────────────────────────────────────────────────
  try {
    const q = encodeURIComponent(`${hotelName} ${city}`);
    const [cy, cm, cd] = checkin.split("-");
    const [oy, om, od] = checkout.split("-");
    const url = `https://www.booking.com/search.html?ss=${q}&lang=de`
      + (cy ? `&checkin_year=${cy}&checkin_month=${parseInt(cm)}&checkin_monthday=${parseInt(cd)}` : "")
      + (oy ? `&checkout_year=${oy}&checkout_month=${parseInt(om)}&checkout_monthday=${parseInt(od)}` : "");
    const res  = await fetch(url, { headers: HEADERS });
    const text = stripHtml(await res.text());
    const prices = extractPrices(text);
    results.push({ source: "Booking.com", status: res.status, prices: prices.slice(0, 8), lowest: prices[0] ?? null });
  } catch (e: unknown) {
    results.push({ source: "Booking.com", error: String(e) });
  }

  const allPrices = results.flatMap(r => ("prices" in r ? r.prices ?? [] : []));
  const lowest = allPrices.length ? Math.min(...allPrices) : null;

  return NextResponse.json({ hotel: hotelName, city, checkin, checkout, results, lowestFound: lowest });
}
