import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { reconcilePilotOrder } from "@/lib/pilot-reconcile";

export const dynamic = "force-dynamic";

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://campus-crush.org"
  );
}

// Square signs (notification URL + raw request body) with the webhook
// signature key from the Developer Dashboard. The URL must match byte-for-
// byte what's registered there, and the body must be the raw, unparsed
// text — parsing first and re-serializing would produce a different string
// and always fail verification.
function verifySignature(rawBody: string, signature: string | null): boolean {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key || !signature) return false;

  const expected = crypto
    .createHmac("sha256", key)
    .update(siteUrl() + "/api/webhooks/square" + rawBody)
    .digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-square-hmacsha256-signature");

  if (!verifySignature(rawBody, signature)) {
    console.error("square webhook: signature verification failed");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  // payment.created fires on authorization; payment.updated fires on every
  // status change. Listening to both and checking status here (rather than
  // trusting the event name) is Square's own recommended pattern, and it's
  // what makes reconcilePilotOrder's idempotency actually matter.
  if (event.type === "payment.created" || event.type === "payment.updated") {
    const payment = event.data?.object?.payment;
    if (payment?.status === "COMPLETED" && payment.order_id) {
      const result = await reconcilePilotOrder(payment.order_id, payment.id);
      console.log("square webhook: reconciled", payment.order_id, result.status);
    }
  }

  return NextResponse.json({ ok: true });
}
