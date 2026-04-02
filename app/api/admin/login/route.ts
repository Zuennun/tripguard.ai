import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", process.env.ADMIN_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
