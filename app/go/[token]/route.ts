export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/tokens";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;
  if (!token) return NextResponse.redirect("https://savemyholiday.com");

  const supabase = getSupabaseAdmin();
  const { data: click } = await supabase
    .from("affiliate_clicks")
    .select("id, destination, clicked_at, click_count")
    .eq("token", token)
    .single();

  if (!click) return NextResponse.redirect("https://savemyholiday.com");
  if (
    !click.destination ||
    !(
      click.destination.startsWith("https://www.booking.com/") ||
      click.destination.startsWith("https://booking.com/")
    )
  ) {
    return NextResponse.json({ error: "Invalid destination" }, { status: 400 });
  }

  await supabase
    .from("affiliate_clicks")
    .update({
      clicked_at: new Date().toISOString(),
      click_count: (click.click_count ?? 0) + 1,
    })
    .eq("id", click.id);

  return NextResponse.redirect(click.destination);
}
