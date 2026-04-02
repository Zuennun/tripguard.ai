export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { runPriceChecks } from "@/lib/runPriceChecks";

function isAdmin() {
  return cookies().get("admin_session")?.value === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reqBody = await req.json().catch(() => ({}));
    const mode = reqBody?.mode === "failed_only" ? "failed_only" : "all";
    const summary = await runPriceChecks({ trigger: "admin", mode });
    return NextResponse.json({ ok: true, summary });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Manual run failed" },
      { status: 500 }
    );
  }
}
