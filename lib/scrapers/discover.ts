/**
 * Findet die Booking.com Property-URL über das interne Autocomplete-JSON-Endpoint.
 * Kein JS-Rendering nötig — gibt direkt strukturierte Daten zurück.
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

    // Erstes Hotel-Ergebnis finden
    const results: any[] = Array.isArray(data) ? data : (data?.results ?? []);

    for (const item of results) {
      // Nur Hotel-Typen (kein Stadtnamen, keine Regionen)
      const type = item?.type ?? item?.result_type ?? "";
      if (type && !["hotel", "property", "accommodation"].some(t => type.toLowerCase().includes(t))) {
        continue;
      }

      // URL aus verschiedenen Feldern extrahieren
      const urlSlug =
        item?.url ?? item?.slug ?? item?.hotel_url ?? item?.deep_link ?? null;

      if (urlSlug) {
        const full = urlSlug.startsWith("http")
          ? urlSlug
          : `https://www.booking.com${urlSlug.startsWith("/") ? "" : "/hotel/"}${urlSlug}`;
        // Nur den Pfad ohne Query-Parameter zurückgeben
        try {
          const parsed = new URL(full);
          return `${parsed.origin}${parsed.pathname}`;
        } catch {
          return full.split("?")[0];
        }
      }
    }

    return null;
  } catch (err: any) {
    console.error("Discovery error:", err.message);
    return null;
  }
}
