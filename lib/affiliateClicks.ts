import crypto from "crypto";

type SupabaseLike = any;

export async function createAffiliateClickCompat(params: {
  supabase: SupabaseLike;
  bookingId: string;
  alertId?: string | null;
  destination: string;
  provider?: string | null;
}) {
  const token = crypto.randomBytes(16).toString("hex");
  const payloads = [
    {
      booking_id: params.bookingId,
      alert_id: params.alertId ?? null,
      token,
      destination: params.destination,
      provider: params.provider ?? null,
    },
    {
      booking_id: params.bookingId,
      alert_id: params.alertId ?? null,
      token,
      destination: params.destination,
    },
  ];

  for (const payload of payloads) {
    const { error } = await params.supabase.from("affiliate_clicks").insert(payload);
    if (!error) {
      return { token, error: null as string | null };
    }
  }

  return { token, error: "affiliate_click insert failed" };
}
