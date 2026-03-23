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
 * TODO: Replace this placeholder with real API calls, e.g.:
 *   - Booking.com API via RapidAPI
 *   - Hotels.com API via RapidAPI
 *   - Expedia API
 *
 * The function should return the lowest price found across all platforms.
 */
export async function checkCurrentPrice(params: {
  hotelName: string;
  city: string | null;
  country: string | null;
  roomType: string | null;
  checkinDate: string;
  checkoutDate: string;
  currency: string;
}): Promise<PriceResult> {
  // ─── PLACEHOLDER ────────────────────────────────────────────────
  // Real implementation will call Booking.com / Hotels.com APIs here.
  // For now, return "not found" so no false alerts are sent.
  // ────────────────────────────────────────────────────────────────
  return {
    found: false,
    price: null,
    currency: params.currency,
    source: "",
    bookingUrl: "",
  };
}
