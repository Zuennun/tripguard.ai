export const dynamic = "force-dynamic";

// One-time backfill: generates manage tokens for bookings that have none.
// Protected by CRON_SECRET. Run once after v3 migration to fix existing bookings.

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, generateToken } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Find all bookings that have no manage token
  const { data: existingTokens } = await supabase
    .from("booking_tokens")
    .select("booking_id")
    .eq("purpose", "manage");

  const alreadyHasToken = new Set((existingTokens ?? []).map(r => r.booking_id));

  const { data: allBookings, error } = await supabase
    .from("bookings")
    .select("id, status");

  const bookings = (allBookings ?? []).filter(b => !alreadyHasToken.has(b.id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ message: "No bookings need backfilling", count: 0 });
  }

  const manageExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const rows = bookings.map(b => ({
    booking_id: b.id,
    token: generateToken(),
    purpose: "manage",
    expires_at: manageExpiry,
  }));

  const { error: insertError } = await supabase.from("booking_tokens").insert(rows);
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ message: "Tokens backfilled", count: bookings.length });
}
