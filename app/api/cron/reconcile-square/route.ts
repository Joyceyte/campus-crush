import { NextRequest, NextResponse } from "next/server";
import { sweepOrphanedPilotPayments } from "@/lib/pilot-reconcile";

export const dynamic = "force-dynamic";

// Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically on
// scheduled invocations. Rejecting anything else keeps this route (which
// writes paid pilot_signups rows) from being triggerable by a public GET.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await sweepOrphanedPilotPayments();
  console.log("square reconcile sweep:", result.scanned, "scanned,", result.reconciled, "reconciled");
  return NextResponse.json(result);
}
