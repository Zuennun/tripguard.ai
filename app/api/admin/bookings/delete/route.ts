export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  if (cookies().get("admin_session")?.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("bookings")
      .update({ status: "deleted", updated_at: new Date().toISOString() })
      .eq("id", bookingId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Delete failed" }, { status: 500 });
  }
}
