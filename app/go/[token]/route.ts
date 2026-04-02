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
    .select("id, destination, clicked_at")
    .eq("token", token)
    .single();

  if (!click) return NextResponse.redirect("https://savemyholiday.com");

  // Record click timestamp (only first click)
  if (!click.clicked_at) {
    await supabase
      .from("affiliate_clicks")
      .update({ clicked_at: new Date().toISOString() })
      .eq("id", click.id);
  }

  return NextResponse.redirect(click.destination);
}
