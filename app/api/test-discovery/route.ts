export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "Hotel Adlon Berlin Germany";

  const endpoints = [
    `https://www.booking.com/autocomplete.html?query=${encodeURIComponent(query)}&lang=en-gb`,
    `https://www.booking.com/suggest.json?term=${encodeURIComponent(query)}&type=hotel&lang=en-gb`,
    `https://www.booking.com/searchresults.en-gb.html?ss=${encodeURIComponent(query)}&offset=0`,
  ];

  const results: any[] = [];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/json,*/*",
          "Accept-Language": "en-GB,en;q=0.9",
          "Referer": "https://www.booking.com/",
        },
        signal: AbortSignal.timeout(10000),
      });

      const text = await res.text();
      let parsed = null;
      try { parsed = JSON.parse(text); } catch {}

      // Nach hotel/ Links suchen
      const hotelLinks = [...text.matchAll(/booking\.com\/hotel\/[a-z]{2}\/[^"'&\s]+\.html/g)]
        .map(m => "https://www." + m[0]).slice(0, 3);

      results.push({ url, status: res.status, hotelLinks, parsed, raw: text.slice(0, 500) });
    } catch (err: any) {
      results.push({ url, error: err.message });
    }
  }

  return NextResponse.json({ results });
}
