import { scrapeBookingCom } from "./scrapers/booking";

export interface PriceResult {
  found: boolean;
  price: number | null;
  currency: string;
  source: string;
  bookingUrl: string;
}

/**
 * Checks the current price for a hotel booking.
 *
 * Toggle scraping:  SCRAPING_ENABLED=true  in Vercel env vars
 * Toggle API:       SCRAPING_ENABLED=false  → Placeholder (kein Geld ausgeben)
 *
 * Später: weitere Scraper / APIs hier eintragen (Hotels.com, Expedia …)
 */
export async function checkCurrentPrice(params: {
  hotelName: string;
  city: string | null;
  country: string | null;
  roomType: string | null;
  checkinDate: string;
  checkoutDate: string;
  currency: string;
  rooms?: number;
  adults?: number;
}): Promise<PriceResult> {
  const scrapingEnabled = process.env.SCRAPING_ENABLED === "true";

  if (!scrapingEnabled) {
    // Scraping aus — kein Alert wird gesendet
    return { found: false, price: null, currency: params.currency, source: "", bookingUrl: "" };
  }

  // ─── Booking.com scrapen ──────────────────────────────────────────
  const bookingResult = await scrapeBookingCom({
    hotelName: params.hotelName,
    city: params.city,
    checkinDate: params.checkinDate,
    checkoutDate: params.checkoutDate,
    rooms: params.rooms ?? 1,
    adults: params.adults ?? 2,
    currency: params.currency,
  });

  if (bookingResult.found && bookingResult.price !== null) {
    return {
      found: true,
      price: bookingResult.price,
      currency: bookingResult.currency,
      source: "Booking.com",
      bookingUrl: bookingResult.bookingUrl,
    };
  }

  // ─── Hier weitere Scraper/APIs ergänzen ──────────────────────────
  // const hotelsResult = await scrapeHotelsCom({ ... });
  // const expediaResult = await scrapeExpedia({ ... });

  return { found: false, price: null, currency: params.currency, source: "", bookingUrl: "" };
}
