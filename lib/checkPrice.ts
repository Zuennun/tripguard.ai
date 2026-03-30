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
  mealPlan: string | null;
  checkinDate: string;
  checkoutDate: string;
  currency: string;
  rooms?: number;
  adults?: number;
  bookingComUrl?: string | null;
}): Promise<PriceResult> {
  const SCRAPER_URL   = process.env.SCRAPER_URL;
  const SCRAPER_TOKEN = process.env.SCRAPER_TOKEN ?? "savemyholiday-secret";

  if (!SCRAPER_URL) {
    return { found: false, price: null, currency: params.currency, source: "", bookingUrl: "" };
  }

  try {
    const searchParams = new URLSearchParams({
      hotel:    params.hotelName,
      city:     params.city ?? "",
      checkin:  params.checkinDate,
      checkout: params.checkoutDate,
    });
    if (params.roomType) searchParams.set("roomType", params.roomType);
    if (params.mealPlan) searchParams.set("mealPlan", params.mealPlan);
    if (params.bookingComUrl) searchParams.set("bookingUrl", params.bookingComUrl);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55000);

    let res: Response;
    try {
      res = await fetch(`${SCRAPER_URL}/scrape?${searchParams}`, {
        headers: { "x-scraper-token": SCRAPER_TOKEN },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      return { found: false, price: null, currency: params.currency, source: "", bookingUrl: "" };
    }

    const data = await res.json();
    const price: number | null = data.lowestFound ?? null;

    if (price === null) {
      return { found: false, price: null, currency: params.currency, source: "", bookingUrl: "" };
    }

    const bookingResult = data.results?.find((r: any) => r.source === "Booking.com");

    return {
      found: true,
      price,
      currency: "EUR",
      source: bookingResult ? "Booking.com" : "Google Hotels",
      bookingUrl: bookingResult?.url ?? "",
    };
  } catch {
    return { found: false, price: null, currency: params.currency, source: "", bookingUrl: "" };
  }
}
