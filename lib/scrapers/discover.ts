import * as cheerio from "cheerio";

/**
 * Findet die Booking.com Property-URL via DuckDuckGo-Suche.
 * DuckDuckGo hat eine einfache HTML-Version — kein JS-Problem.
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

  const searchTerm = `site:booking.com ${[hotelName, city, country].filter(Boolean).join(" ")}`;
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchTerm)}`;

  try {
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.5",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);

    // DuckDuckGo HTML-Links durchsuchen
    let foundUrl: string | null = null;

    $("a[href]").each((_, el) => {
      if (foundUrl) return;
      const href = $(el).attr("href") || "";

      // Direkter booking.com Hotel-Link
      if (href.includes("booking.com/hotel/")) {
        try {
          // DuckDuckGo wrappet Links manchmal in Redirects
          const url = href.startsWith("http") ? new URL(href) : null;
          if (url && url.hostname.includes("booking.com")) {
            foundUrl = `${url.origin}${url.pathname}`;
            return;
          }
          // Manchmal ist die URL im href direkt
          const match = href.match(/https?:\/\/[a-z.]*booking\.com\/hotel\/[^&?#"]+/);
          if (match) foundUrl = match[0];
        } catch {
          const match = href.match(/https?:\/\/[a-z.]*booking\.com\/hotel\/[^&?#"]+/);
          if (match) foundUrl = match[0];
        }
      }
    });

    return foundUrl;
  } catch {
    return null;
  }
}
