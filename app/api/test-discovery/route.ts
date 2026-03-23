export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "Hotel Adlon Berlin Germany";

  const url = `https://accommodations.booking.com/autocomplete.json?query=${encodeURIComponent(query)}&language=en-gb`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Referer": "https://www.booking.com/",
      },
      signal: AbortSignal.timeout(10000),
    });

    const status = res.status;
    const text = await res.text();

    let parsed = null;
    try { parsed = JSON.parse(text); } catch {}

    return NextResponse.json({ status, raw: text.slice(0, 2000), parsed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
