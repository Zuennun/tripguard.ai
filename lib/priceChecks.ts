import { checkCurrentPrice } from "@/lib/checkPrice";

type SupabaseLike = any;

export type PriceCheckInsertResult = {
  id: string | null;
  checkedAt: string | null;
  error: string | null;
};

type PriceResult = Awaited<ReturnType<typeof checkCurrentPrice>>;

export async function insertPriceCheckCompat(params: {
  supabase: SupabaseLike;
  bookingId: string;
  bookingCurrency: string | null;
  bookingPrice: number | null;
  bookingComUrl?: string | null;
  result: PriceResult;
  durationMs?: number | null;
}): Promise<PriceCheckInsertResult> {
  const {
    supabase,
    bookingId,
    bookingCurrency,
    bookingPrice,
    bookingComUrl,
    result,
    durationMs,
  } = params;

  const payloads: Record<string, any>[] = [
    {
      booking_id: bookingId,
      found: result.found,
      price: result.price,
      currency: result.currency || bookingCurrency,
      provider: result.source || null,
      result_url: result.bookingUrl || null,
      original_price: bookingPrice ?? null,
      error: result.error,
      duration_ms: durationMs ?? null,
      http_status: result.statusCode,
    },
    {
      booking_id: bookingId,
      found: result.found,
      price: result.price,
      currency: result.currency || bookingCurrency,
      source: result.source || null,
      booking_url: result.bookingUrl || bookingComUrl || null,
      error: result.error,
    },
    {
      booking_id: bookingId,
      found: result.found,
      price: result.price,
      currency: result.currency || bookingCurrency,
      error: result.error,
    },
  ];

  let lastError: string | null = null;

  for (const payload of payloads) {
    const { data, error } = await supabase
      .from("price_checks")
      .insert(payload)
      .select("id, checked_at")
      .single();

    if (!error) {
      return {
        id: data?.id ?? null,
        checkedAt: data?.checked_at ?? null,
        error: null,
      };
    }

    lastError = error.message ?? "Unknown price_checks insert error";
  }

  return { id: null, checkedAt: null, error: lastError };
}
