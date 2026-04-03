import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.redirect("https://www.rebookandsave.com/admin/login");
  res.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
  return res;
}
