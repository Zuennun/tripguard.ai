/**
 * Findet die Booking.com Property-URL.
 * 1. Versuch: Booking.com Autocomplete JSON
 * 2. Fallback: OpenAI Web Search
 */
export async function discoverHotelUrl(params: {
  hotelName: string;
  city: string | null;
  country: string | null;
  checkinDate: string;
  checkoutDate: string;
  rooms: number;
  adults: number;
}): Promise<string | null> {
  const { hotelName, city, country } = params;

  // ── 1. Booking.com Autocomplete ───────────────────────────────────────────
  const autocompleteUrl = await discoverViaAutocomplete(hotelName, city, country);
  if (autocompleteUrl) return autocompleteUrl;

  // ── 2. OpenAI Web Search Fallback ─────────────────────────────────────────
  if (process.env.OPENAI_API_KEY) {
    return discoverViaOpenAI(hotelName, city, country);
  }

  return null;
}

async function discoverViaAutocomplete(
  hotelName: string,
  city: string | null,
  country: string | null
): Promise<string | null> {
  const query = [hotelName, city, country].filter(Boolean).join(" ");
  const url = `https://accommodations.booking.com/autocomplete.json` +
    `?query=${encodeURIComponent(query)}&language=en-gb`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Referer": "https://www.booking.com/",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const results: any[] = Array.isArray(data) ? data : (data?.results ?? []);

    for (const item of results) {
      const type = item?.type ?? item?.result_type ?? "";
      if (type && !["hotel", "property", "accommodation"].some(t => type.toLowerCase().includes(t))) {
        continue;
      }
      const urlSlug = item?.url ?? item?.slug ?? item?.hotel_url ?? item?.deep_link ?? null;
      if (urlSlug) {
        const full = urlSlug.startsWith("http")
          ? urlSlug
          : `https://www.booking.com${urlSlug.startsWith("/") ? "" : "/hotel/"}${urlSlug}`;
        try {
          const parsed = new URL(full);
          return `${parsed.origin}${parsed.pathname}`;
        } catch {
          return full.split("?")[0];
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function discoverViaOpenAI(
  hotelName: string,
  city: string | null,
  country: string | null
): Promise<string | null> {
  const location = [city, country].filter(Boolean).join(", ");
  const query = `Find the exact Booking.com hotel page URL for "${hotelName}"${location ? ` in ${location}` : ""}. Return only the URL in the format https://www.booking.com/hotel/XX/hotel-name.html — nothing else.`;

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-search-preview",
        tools: [{ type: "web_search_preview" }],
        input: query,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) return null;
    const data = await res.json();

    // Extract text from response
    const text: string = data?.output
      ?.filter((o: any) => o.type === "message")
      ?.flatMap((o: any) => o.content)
      ?.filter((c: any) => c.type === "output_text")
      ?.map((c: any) => c.text)
      ?.join("") ?? "";

    // Extract booking.com URL from text
    const match = text.match(/https:\/\/www\.booking\.com\/hotel\/[a-z]{2}\/[^\s"'<>]+\.html/);
    return match ? match[0].split("?")[0] : null;
  } catch (err: any) {
    console.error("OpenAI discovery error:", err.message);
    return null;
  }
}
