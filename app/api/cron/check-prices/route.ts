export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { runPriceChecks } from "@/lib/runPriceChecks";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runPriceChecks({ trigger: "cron" });
    return NextResponse.json(summary);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Cron run failed" }, { status: 500 });
  }
}
