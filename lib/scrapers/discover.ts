import * as cheerio from "cheerio";

/**
 * Sucht das Hotel auf Booking.com und gibt die direkte Property-URL zurück.
 * Diese URL wird einmalig gespeichert und für alle späteren Price-Checks verwendet.
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
  const { hotelName, city, country, checkinDate, checkoutDate, rooms, adults } = params;

  const searchTerm = [hotelName, city, country].filter(Boolean).join(" ");
  const [ciYear, ciMonth, ciDay] = checkinDate.split("-");
  const [coYear, coMonth, coDay] = checkoutDate.split("-");

  const searchUrl =
    `https://www.booking.com/searchresults.html` +
    `?ss=${encodeURIComponent(searchTerm)}` +
    `&checkin_year=${ciYear}&checkin_month=${ciMonth}&checkin_monthday=${ciDay}` +
    `&checkout_year=${coYear}&checkout_month=${coMonth}&checkout_monthday=${coDay}` +
    `&no_rooms=${rooms}&group_adults=${adults}&lang=en-gb`;

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

    // Erstes Suchergebnis — Property-Link extrahieren
    const propertySelectors = [
      "[data-testid='property-card'] a[data-testid='title-link']",
      "[data-testid='property-card'] a[href*='/hotel/']",
      "a[href*='/hotel/']",
    ];

    for (const selector of propertySelectors) {
      const href = $(selector).first().attr("href");
      if (href) {
        // Nur den Pfad-Teil ohne Query-Parameter speichern
        const url = new URL(href.startsWith("http") ? href : `https://www.booking.com${href}`);
        return `${url.origin}${url.pathname}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}
