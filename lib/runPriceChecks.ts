import { Resend } from "resend";
import { checkCurrentPrice } from "@/lib/checkPrice";
import { comparePrices } from "@/lib/priceComparison";
import { founderPriceReviewEmail } from "@/lib/emails";
import { insertPriceCheckCompat } from "@/lib/priceChecks";
import { getSupabaseAdmin } from "@/lib/tokens";
import { createJobRunCompat, finishJobRunCompat } from "@/lib/jobRuns";

const MIN_SAVINGS_AMOUNT = 5;
const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL ?? process.env.FOUNDER_ALERT_EMAIL ?? "";

export async function runPriceChecks(params?: {
  trigger?: "cron" | "admin";
  mode?: "all" | "failed_only";
}) {
  const trigger = params?.trigger ?? "cron";
  const mode = params?.mode ?? "all";
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split("T")[0];
  const startedAt = Date.now();
  const jobRunId = await createJobRunCompat({
    supabase,
    job:
      trigger === "admin"
        ? mode === "failed_only"
          ? "manual-retry-failed"
          : "manual-price-check"
        : "cron-price-check",
  });

  try {
    await supabase
      .from("bookings")
      .update({ status: "expired" })
      .eq("status", "active")
      .lt("checkout_date", today);

    const { data: activeBookings, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "active")
      .or(`checkout_date.gte.${today},checkout_date.is.null`);

    if (error) {
      throw new Error(`Failed to fetch bookings: ${error.message}`);
    }

    let bookings = activeBookings ?? [];
    if (mode === "failed_only") {
      bookings = bookings.filter((booking: any) => booking.lowest_found_price == null);
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const summary = {
      checked: 0,
      found: 0,
      comparable: 0,
      cheaper: 0,
      alerts: 0,
      errors: 0,
    };

    const BATCH_SIZE = 5;

    for (let i = 0; i < bookings.length; i += BATCH_SIZE) {
      const batch = bookings.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(async (booking) => {
          let priceCheckId: string | null = null;

          try {
            const result = await checkCurrentPrice({
              hotelName: booking.hotel_name,
              city: booking.city,
              country: booking.country,
              roomType: booking.room_type,
              mealPlan: booking.meal_plan,
              checkinDate: booking.checkin_date,
              checkoutDate: booking.checkout_date,
              currency: booking.currency,
              rooms: booking.rooms,
              adults: booking.adults,
              bookingComUrl: booking.booking_com_url,
            });

            summary.checked += 1;
            if (result.found) summary.found += 1;

            const priceCheck = await insertPriceCheckCompat({
              supabase,
              bookingId: booking.id,
              bookingCurrency: booking.currency,
              bookingPrice: booking.price ?? null,
              bookingComUrl: booking.booking_com_url,
              result,
            });

            priceCheckId = priceCheck.id;

            const comparison = await comparePrices({
              bookingPrice: booking.price,
              bookingCurrency: booking.currency,
              foundPrice: result.price,
              foundCurrency: result.currency,
            });

            if (comparison.comparable) summary.comparable += 1;
            if (comparison.cheaper) summary.cheaper += 1;

            const isWorthAlerting = result.found
              && result.price !== null
              && comparison.comparable
              && comparison.cheaper
              && (comparison.savings ?? 0) >= MIN_SAVINGS_AMOUNT;

            if (!isWorthAlerting) {
              const updates: Record<string, any> = {
                last_checked_at: new Date().toISOString(),
              };
              if (comparison.comparable && comparison.normalizedFoundPrice != null) {
                updates.lowest_found_price = comparison.normalizedFoundPrice;
              }
              if (!booking.booking_com_url && result.bookingUrl) {
                updates.booking_com_url = result.bookingUrl;
              }
              await supabase.from("bookings").update(updates).eq("id", booking.id);
              return;
            }

            const { data: existingAlert } = await supabase
              .from("alerts")
              .select("id")
              .eq("booking_id", booking.id)
              .eq("new_price", comparison.normalizedFoundPrice)
              .maybeSingle();

            if (existingAlert) {
              await supabase.from("bookings").update({ last_checked_at: new Date().toISOString() }).eq("id", booking.id);
              return;
            }

            const nowIso = new Date().toISOString();
            const updates: Record<string, any> = {
              lowest_found_price: comparison.normalizedFoundPrice,
              booking_com_url: booking.booking_com_url || result.bookingUrl || null,
              last_checked_at: nowIso,
            };

            const lastFounderPingAge =
              booking.last_alert_sent_at
                ? Date.now() - new Date(booking.last_alert_sent_at).getTime()
                : Number.POSITIVE_INFINITY;
            const shouldNotifyFounder = Boolean(ADMIN_ALERT_EMAIL) && lastFounderPingAge > 24 * 60 * 60 * 1000;

            if (shouldNotifyFounder) {
              const { data: manageTokenRow } = await supabase
                .from("booking_tokens")
                .select("token")
                .eq("booking_id", booking.id)
                .eq("purpose", "manage")
                .single();

              const manageUrl = manageTokenRow
                ? `https://www.rebookandsave.com/manage/${manageTokenRow.token}`
                : "https://www.rebookandsave.com/admin";

              const locale = (booking.locale ?? "de") as "de" | "en";
              const subject = locale === "de"
                ? `🟠 Founder Review: günstigerer Preis für ${booking.hotel_name}`
                : `🟠 Founder review: cheaper price for ${booking.hotel_name}`;

              await resend.emails.send({
                from: process.env.RESEND_FROM!,
                to: ADMIN_ALERT_EMAIL,
                subject,
                html: founderPriceReviewEmail({
                  hotelName: booking.hotel_name,
                  city: booking.city,
                  country: booking.country,
                  checkin: booking.checkin_date,
                  checkout: booking.checkout_date,
                  originalPrice: booking.price,
                  newPrice: comparison.normalizedFoundPrice!,
                  currency: booking.currency,
                  source: result.cheapestSource || result.source || "Booking.com",
                  resultUrl: result.cheapestUrl || result.bookingUrl || null,
                  manageUrl,
                  locale,
                }),
              });

              updates.last_alert_sent_at = nowIso;
            }

            await supabase.from("bookings").update(updates).eq("id", booking.id);
          } catch (err: any) {
            summary.errors += 1;
            console.error(`Error checking booking ${booking.id}:`, err.message);
            if (booking.id) {
              try {
                await insertPriceCheckCompat({
                  supabase,
                  bookingId: booking.id,
                  bookingCurrency: booking.currency,
                  bookingPrice: booking.price ?? null,
                  bookingComUrl: booking.booking_com_url,
                  result: {
                    found: false,
                    price: null,
                    currency: booking.currency,
                    source: "",
                    bookingUrl: "",
                    cheapestSource: "",
                    cheapestUrl: "",
                    error: err.message?.slice(0, 500) ?? "unknown error",
                    statusCode: null,
                  },
                });
              } catch {}
            }
          }
        })
      );
    }

    await finishJobRunCompat({
      supabase,
      id: jobRunId,
      status: "success",
      bookingsChecked: summary.checked,
      alertsSent: summary.alerts,
      foundCount: summary.found,
      durationMs: Date.now() - startedAt,
      error: null,
    });

    return summary;
  } catch (err: any) {
    await finishJobRunCompat({
      supabase,
      id: jobRunId,
      status: "error",
      bookingsChecked: 0,
      alertsSent: 0,
      foundCount: 0,
      durationMs: Date.now() - startedAt,
      error: err?.message ?? "unknown error",
    });
    throw err;
  }
}
