import { scrapeBookingCom } from "./scrapers/booking";

export interface PriceResult {
  found: boolean;
  price: number | null;
  currency: string;
  source: string;
  bookingUrl: string;
}

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
  bookingComUrl?: string | null;
}): Promise<PriceResult> {
  const scrapingEnabled = process.env.SCRAPING_ENABLED === "true";
  if (!scrapingEnabled) {
    return { found: false, price: null, currency: params.currency, source: "", bookingUrl: "" };
  }

  // Nur tracken wenn eine Property-URL bekannt ist
  if (!params.bookingComUrl) {
    return { found: false, price: null, currency: params.currency, source: "", bookingUrl: "" };
  }

  const result = await scrapeBookingCom({
    propertyUrl: params.bookingComUrl,
    checkinDate: params.checkinDate,
    checkoutDate: params.checkoutDate,
    rooms: params.rooms ?? 1,
    adults: params.adults ?? 2,
    currency: params.currency,
  });

  if (result.found && result.price !== null) {
    return {
      found: true,
      price: result.price,
      currency: result.currency,
      source: "Booking.com",
      bookingUrl: result.bookingUrl,
    };
  }

  // Hier weitere Plattformen ergänzen (Hotels.com, Expedia …)

  return { found: false, price: null, currency: params.currency, source: "", bookingUrl: "" };
}
