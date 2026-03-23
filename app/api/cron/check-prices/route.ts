export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { checkCurrentPrice } from "@/lib/checkPrice";
import { priceAlertEmail } from "@/lib/emails";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function GET(req: NextRequest) {
  // Protect the cron endpoint — Vercel sets this header automatically
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  // Fetch all active bookings with future checkout dates
  const today = new Date().toISOString().split("T")[0];
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("status", "active")
    .gte("checkout_date", today);

  if (error) {
    console.error("Supabase fetch error:", error.message);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ checked: 0, alerts: 0 });
  }

  let alertsSent = 0;

  for (const booking of bookings) {
    try {
      const result = await checkCurrentPrice({
        hotelName: booking.hotel_name,
        city: booking.city,
        country: booking.country,
        roomType: booking.room_type,
        checkinDate: booking.checkin_date,
        checkoutDate: booking.checkout_date,
        currency: booking.currency,
        rooms: booking.rooms,
        adults: booking.adults,
        bookingComUrl: booking.booking_com_url,
      });

      // Only alert if a cheaper price was found
      if (result.found && result.price !== null && booking.price !== null && result.price < booking.price) {
        const resend = getResend();
        await resend.emails.send({
          from: process.env.RESEND_FROM!,
          to: booking.email,
          subject: `💰 Cheaper price found for ${booking.hotel_name} — TripGuard`,
          html: priceAlertEmail({
            hotelName: booking.hotel_name,
            city: booking.city,
            country: booking.country,
            checkin: booking.checkin_date,
            checkout: booking.checkout_date,
            originalPrice: booking.price,
            newPrice: result.price,
            currency: booking.currency,
            source: result.source,
            bookingUrl: result.bookingUrl,
          }),
        });

        // Update lowest_found_price in Supabase
        await supabase
          .from("bookings")
          .update({
            lowest_found_price: result.price,
            last_checked_at: new Date().toISOString(),
          })
          .eq("id", booking.id);

        alertsSent++;
      } else {
        // Just update last_checked_at
        await supabase
          .from("bookings")
          .update({ last_checked_at: new Date().toISOString() })
          .eq("id", booking.id);
      }
    } catch (err: any) {
      console.error(`Error checking booking ${booking.id}:`, err.message);
    }
  }

  return NextResponse.json({ checked: bookings.length, alerts: alertsSent });
}
