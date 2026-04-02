type SupabaseLike = any;

export async function insertAlertCompat(params: {
  supabase: SupabaseLike;
  bookingId: string;
  priceCheckId?: string | null;
  newPrice: number;
  oldPrice: number;
  savings: number | null;
  currency: string;
  provider?: string | null;
  resultUrl?: string | null;
}) {
  const payloads = [
    {
      booking_id: params.bookingId,
      price_check_id: params.priceCheckId ?? null,
      new_price: params.newPrice,
      old_price: params.oldPrice,
      savings: params.savings,
      currency: params.currency,
      provider: params.provider ?? null,
      result_url: params.resultUrl ?? null,
    },
    {
      booking_id: params.bookingId,
      price_check_id: params.priceCheckId ?? null,
      new_price: params.newPrice,
      old_price: params.oldPrice,
      currency: params.currency,
      source: params.provider ?? null,
      booking_url: params.resultUrl ?? null,
    },
    {
      booking_id: params.bookingId,
      new_price: params.newPrice,
      old_price: params.oldPrice,
      currency: params.currency,
    },
  ];

  for (const payload of payloads) {
    const { data, error } = await params.supabase
      .from("alerts")
      .insert(payload)
      .select("id")
      .single();

    if (!error) return { id: data?.id ?? null, error: null as string | null };
  }

  return { id: null, error: "alert insert failed" };
}
