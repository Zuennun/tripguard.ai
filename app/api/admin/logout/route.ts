import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.redirect("https://savemyholiday.com/admin/login");
  res.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
  return res;
}
