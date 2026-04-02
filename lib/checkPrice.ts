export interface PriceResult {
  found: boolean;
  price: number | null;
  currency: string;
  source: string;
  bookingUrl: string;
  error: string | null;
  statusCode: number | null;
}

function normalizeScraperError(error: string | null | undefined) {
  const text = String(error || "").trim();
  if (!text) return "No price found";
  if (/bot protection detected|captcha|verify you are human|unusual traffic|access denied|security check|cloudflare/i.test(text)) {
    return "Bot protection detected";
  }
  if (/timeout|aborted/i.test(text)) {
    return "Timeout while loading hotel page";
  }
  return text;
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
  const SCRAPER_TOKEN = process.env.SCRAPER_TOKEN ?? "";

  if (!SCRAPER_URL) {
    return {
      found: false,
      price: null,
      currency: params.currency,
      source: "",
      bookingUrl: "",
      error: "SCRAPER_URL is not configured",
      statusCode: null,
    };
  }

  try {
    const searchParams = new URLSearchParams({
      hotel:    params.hotelName,
      city:     params.city ?? "",
      checkin:  params.checkinDate,
      checkout: params.checkoutDate,
      currency: params.currency,
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
      const errText = await res.text().catch(() => "");
      return {
        found: false,
        price: null,
        currency: params.currency,
        source: "",
        bookingUrl: "",
        error: normalizeScraperError(`Scraper returned ${res.status}${errText ? `: ${errText.slice(0, 240)}` : ""}`),
        statusCode: res.status,
      };
    }

    const data = await res.json();
    const price: number | null = data.lowestFound ?? null;
    const bookingResult = data.results?.find((r: any) => r.source === "Booking.com") ?? data.results?.[0] ?? null;

    if (price === null) {
      const resultError =
        bookingResult?.error ||
        data?.note ||
        data?.error ||
        "No price found";

      return {
        found: false,
        price: null,
        currency: data.currency ?? params.currency,
        source: bookingResult?.source ?? "",
        bookingUrl: bookingResult?.url ?? "",
        error: normalizeScraperError(resultError),
        statusCode: res.status,
      };
    }

    return {
      found: true,
      price,
      currency: data.currency ?? params.currency,
      source: bookingResult?.source ?? "",
      bookingUrl: bookingResult?.url ?? "",
      error: null,
      statusCode: res.status,
    };
  } catch (err: any) {
    return {
      found: false,
      price: null,
      currency: params.currency,
      source: "",
      bookingUrl: "",
      error: normalizeScraperError(err?.message ?? "Unknown scraper error"),
      statusCode: null,
    };
  }
}
