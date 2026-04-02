import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createManageToken(bookingId: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const manageToken = generateToken();
  const manageExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("booking_tokens").insert({
    booking_id: bookingId,
    token: manageToken,
    purpose: "manage",
    expires_at: manageExpiry,
  });

  if (error) {
    console.error("booking_tokens insert failed:", error.code, error.message);
    throw new Error(`Token creation failed: ${error.message}`);
  }

  return manageToken;
}

export async function resolveToken(
  token: string,
  purpose: "confirm" | "manage"
): Promise<{ bookingId: string; tokenId: string } | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("booking_tokens")
    .select("id, booking_id, used_at")
    .eq("token", token)
    .eq("purpose", purpose)
    .single();

  if (!data) return null;
  // Confirm tokens are single-use; manage tokens are reusable
  if (purpose === "confirm" && data.used_at) return null;

  return { bookingId: data.booking_id, tokenId: data.id };
}

export async function markTokenUsed(tokenId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("booking_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", tokenId);
}
