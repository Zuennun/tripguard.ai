import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const SCRAPER_URL   = process.env.SCRAPER_URL;
const SCRAPER_TOKEN = process.env.SCRAPER_TOKEN ?? "";
const OPENAI_KEY    = process.env.OPENAI_API_KEY ?? "";

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

  const nights = (checkin && checkout)
    ? Math.max(1, Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;

  // Run VPS scraper + OpenAI search in parallel
  const [scraperResult, openaiResults] = await Promise.allSettled([
    SCRAPER_URL ? fetchVpsScraper({ hotelName, city, checkin, checkout, roomType, mealPlan }) : Promise.resolve(null),
    OPENAI_KEY  ? fetchOpenAiPrices({ hotelName, city, checkin, checkout, nights, roomType }) : Promise.resolve([]),
  ]);

  const vpData   = scraperResult.status === "fulfilled" ? scraperResult.value : null;
  const aiData   = openaiResults.status === "fulfilled" ? openaiResults.value : [];

  // Merge results: VPS sources + OpenAI sources
  const vpResults: any[] = vpData?.results ?? [];
  const allResults = [...vpResults, ...aiData];

  const validPrices = allResults.map((r: any) => r.lowest).filter((p: any) => p != null);
  const lowestFound = validPrices.length > 0 ? Math.min(...validPrices) : vpData?.lowestFound ?? null;

  return NextResponse.json({
    hotel: hotelName,
    city,
    checkin,
    checkout,
    roomType: roomType || null,
    mealPlan: mealPlan || null,
    nights,
    results: allResults,
    lowestFound,
    currency: "EUR",
  });
}

async function fetchVpsScraper({ hotelName, city, checkin, checkout, roomType, mealPlan }: {
  hotelName: string; city: string; checkin: string; checkout: string; roomType: string; mealPlan: string;
}) {
  const params = new URLSearchParams({ hotel: hotelName, city, checkin, checkout, roomType, mealPlan });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 50000);
  try {
    const res = await fetch(`${SCRAPER_URL}/scrape?${params}`, {
      headers: { "x-scraper-token": SCRAPER_TOKEN },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Scraper HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchOpenAiPrices({ hotelName, city, checkin, checkout, nights, roomType }: {
  hotelName: string; city: string; checkin: string; checkout: string; nights: number; roomType: string;
}): Promise<any[]> {
  const location  = city ? ` in ${city}` : "";
  const roomLine  = roomType ? `\n- Room type: "${roomType}" (find price for this specific room type if possible)` : "";
  const minTotal  = nights * 70;
  const maxTotal  = nights * 500;

  const prompt = `Search for the EXACT hotel "${hotelName}"${location}. Do NOT return other hotels.
Find the total price in EUR for a stay from ${checkin} to ${checkout} (${nights} nights, 2 adults) on multiple booking sites.
Return a JSON array ONLY:
[{"source": "Expedia", "price": 900, "url": "https://..."}, {"source": "Hotels.com", "price": 880, "url": "https://..."}, ...]
Rules:
- Only include results for the exact hotel "${hotelName}"${location}
- Price must be EUR total for all ${nights} nights (not per night), range €${minTotal}–€${maxTotal}${roomLine}
- Include: Expedia, Hotels.com, Trip.com, Agoda, HRS if found. Skip Booking.com (already scraped separately)
- Return ONLY the JSON array, no other text`;

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o",
      tools: [{ type: "web_search_preview" }],
      input: prompt,
    }),
  });

  if (!res.ok) return [{ source: "OpenAI Search", error: `HTTP ${res.status}`, lowest: null }];

  const data = await res.json();
  const text: string = (data?.output ?? [])
    .filter((o: any) => o.type === "message")
    .flatMap((o: any) => o.content)
    .filter((c: any) => c.type === "output_text")
    .map((c: any) => c.text)
    .join("") ?? "";

  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [{ source: "OpenAI Search", error: "No JSON in response", lowest: null }];

  const parsed: any[] = JSON.parse(match[0]);
  return parsed
    .filter((r) => r.price && r.price >= minTotal && r.price <= maxTotal)
    .map((r) => ({ source: r.source, lowest: Math.round(r.price), url: r.url ?? null }));
}
