import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const maxDuration = 30;

// Browser-like headers to avoid bot detection
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Upgrade-Insecure-Requests": "1",
};

function formatDate(dateStr: string): string {
  // Convert YYYY-MM-DD to Google Hotels format
  return dateStr; // Google uses YYYY-MM-DD directly
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hotelName = searchParams.get("hotel") || "";
  const city = searchParams.get("city") || "";
  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";

  if (!hotelName) {
    return NextResponse.json({ error: "Missing hotel name" }, { status: 400 });
  }

  const results: { source: string; price: number | null; currency: string; url: string; raw: string }[] = [];

  // ── 1. Try Google Search for hotel price ─────────────────────────────────
  try {
    const query = encodeURIComponent(
      `${hotelName} ${city} hotel price ${checkin} ${checkout}`.trim()
    );
    const googleUrl = `https://www.google.com/search?q=${query}&hl=de&gl=de&num=5`;

    const res = await fetch(googleUrl, { headers: HEADERS });
    const html = await res.text();
    const $ = cheerio.load(html);

    // Look for price patterns in the page
    const pricePatterns = [
      /(\d{2,4})\s*€/g,
      /€\s*(\d{2,4})/g,
      /EUR\s*(\d{2,4})/g,
      /(\d{2,4})\s*EUR/g,
    ];

    const pricesFound: number[] = [];
    const bodyText = $("body").text();

    for (const pattern of pricePatterns) {
      let match;
      while ((match = pattern.exec(bodyText)) !== null) {
        const price = parseInt(match[1]);
        if (price >= 30 && price <= 9999) {
          pricesFound.push(price);
        }
      }
    }

    // Get the most common/lowest reasonable price
    const uniquePrices = [...new Set(pricesFound)].sort((a, b) => a - b);
    const lowestPrice = uniquePrices[0] ?? null;

    results.push({
      source: "Google Search",
      price: lowestPrice,
      currency: "EUR",
      url: googleUrl,
      raw: uniquePrices.slice(0, 5).join(", ") || "none found",
    });
  } catch (e) {
    results.push({ source: "Google Search", price: null, currency: "EUR", url: "", raw: `Error: ${e}` });
  }

  // ── 2. Try Google Hotels direct URL ──────────────────────────────────────
  try {
    const q = encodeURIComponent(`${hotelName} ${city}`);
    const googleHotelsUrl = checkin && checkout
      ? `https://www.google.com/travel/hotels?q=${q}&checkin=${checkin}&checkout=${checkout}&hl=de`
      : `https://www.google.com/travel/hotels?q=${q}&hl=de`;

    const res = await fetch(googleHotelsUrl, { headers: HEADERS });
    const html = await res.text();
    const $ = cheerio.load(html);

    const bodyText = $("body").text();
    const pricesFound: number[] = [];
    const pattern = /(\d{2,4})\s*€|€\s*(\d{2,4})/g;
    let match;
    while ((match = pattern.exec(bodyText)) !== null) {
      const price = parseInt(match[1] || match[2]);
      if (price >= 30 && price <= 9999) pricesFound.push(price);
    }

    const uniquePrices = [...new Set(pricesFound)].sort((a, b) => a - b);

    results.push({
      source: "Google Hotels",
      price: uniquePrices[0] ?? null,
      currency: "EUR",
      url: googleHotelsUrl,
      raw: uniquePrices.slice(0, 5).join(", ") || "none found",
    });
  } catch (e) {
    results.push({ source: "Google Hotels", price: null, currency: "EUR", url: "", raw: `Error: ${e}` });
  }

  // ── 3. Try Booking.com search ─────────────────────────────────────────────
  try {
    const q = encodeURIComponent(`${hotelName} ${city}`);
    const checkinParts = checkin ? checkin.split("-") : [];
    const checkoutParts = checkout ? checkout.split("-") : [];

    let bookingUrl = `https://www.booking.com/search.html?ss=${q}&lang=de`;
    if (checkinParts.length === 3) {
      bookingUrl += `&checkin_year=${checkinParts[0]}&checkin_month=${parseInt(checkinParts[1])}&checkin_monthday=${parseInt(checkinParts[2])}`;
    }
    if (checkoutParts.length === 3) {
      bookingUrl += `&checkout_year=${checkoutParts[0]}&checkout_month=${parseInt(checkoutParts[1])}&checkout_monthday=${parseInt(checkoutParts[2])}`;
    }

    const res = await fetch(bookingUrl, { headers: HEADERS });
    const html = await res.text();
    const $ = cheerio.load(html);

    const pricesFound: number[] = [];
    // Booking.com price selectors
    $("[data-testid='price-and-discounted-price'], .prco-valign-middle-helper, [class*='price']").each((_, el) => {
      const text = $(el).text();
      const match = text.match(/(\d{2,4})/);
      if (match) {
        const price = parseInt(match[1]);
        if (price >= 30 && price <= 9999) pricesFound.push(price);
      }
    });

    const uniquePrices = [...new Set(pricesFound)].sort((a, b) => a - b);

    results.push({
      source: "Booking.com",
      price: uniquePrices[0] ?? null,
      currency: "EUR",
      url: bookingUrl,
      raw: uniquePrices.slice(0, 5).join(", ") || "none found",
    });
  } catch (e) {
    results.push({ source: "Booking.com", price: null, currency: "EUR", url: "", raw: `Error: ${e}` });
  }

  return NextResponse.json({
    hotel: hotelName,
    city,
    checkin,
    checkout,
    results,
    summary: {
      lowestPrice: results.map(r => r.price).filter(Boolean).sort((a, b) => (a ?? 0) - (b ?? 0))[0] ?? null,
      sources: results.filter(r => r.price !== null).map(r => r.source),
    },
  });
}
