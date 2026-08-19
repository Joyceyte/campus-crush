// Reconciles Square payments made through the standalone "campus crush
// pilot" Payment Link (set up directly in Square, outside this app) against
// pilot_signups. Those payments never pass through createPilotPaymentLink(),
// so nothing here ever points back to a pilot_signups row on its own — this
// is what closes that gap, called from both the webhook and the sweep below.
//
// Production only: reconciling sandbox test payments against a real
// student's data table would be actively wrong, so this always talks to
// Square's production API regardless of SQUARE_ENVIRONMENT.
import { supabaseAdmin } from "@/lib/supabase-admin";

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN ?? "";
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID ?? "";
const SQUARE_BASE = "https://connect.squareup.com";
const SQUARE_VERSION = "2025-06-18";

const PILOT_ITEM_NAME = "campus crush pilot";
const PILOT_AMOUNT_CENTS = 500;
const PILOT_CURRENCY = "AUD";

// Payments with no "University email" note fall back to the receipt email —
// fine for a real buyer, wrong when that receipt email belongs to the team
// testing the Payment Link itself (confirmed happening once already: a
// founder's own test purchase got reconciled as a real signup). Excluded
// outright rather than silently included.
const EXCLUDED_EMAILS = new Set(["hujoyce04@gmail.com"]);

async function squareGet(path: string) {
  const res = await fetch(`${SQUARE_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
      "Square-Version": SQUARE_VERSION,
    },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

// Square captured this order's raw phone as "+61" + a leading 0 + the9-digit
// mobile (e.g. "+610412345678") rather than proper E.164 ("+61412345678") —
// a quirk of however the Payment Link's shipping-address field was filled
// in. Only that specific shape is corrected; anything else (including
// legitimate non-AU numbers) passes through untouched.
function cleanPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  const m = digits.match(/^\+610(\d{9})$/);
  return m ? `+61${m[1]}` : digits;
}

// The Payment Link's checkout asks two custom questions — "University
// email" and "How did you hear about us?" — which Square stuffs into the
// line item's free-text note, pipe-separated.
function parseNote(note: string | undefined) {
  const uniMatch = note?.match(/University email:\s*([^|]+)/i);
  const heardMatch = note?.match(/How did you hear about us\?:\s*(.+)$/i);
  return {
    uniEmail: uniMatch ? uniMatch[1].trim().toLowerCase() : null,
    heard: heardMatch ? heardMatch[1].trim() : null,
  };
}

export type ReconcileResult =
  | { status: "reconciled"; email: string }
  | { status: "already-known" }
  | { status: "not-pilot-payment" }
  | { status: "incomplete" }
  | { status: "error" };

/**
 * Reconciles one Square order against pilot_signups. Idempotent — safe to
 * call more than once for the same order (webhooks can redeliver, and the
 * sweep's window can overlap a previous run).
 */
export async function reconcilePilotOrder(
  orderId: string,
  paymentId: string
): Promise<ReconcileResult> {
  const db = supabaseAdmin();

  const { data: existing } = await db
    .from("pilot_signups")
    .select("id")
    .eq("square_order_id", orderId)
    .maybeSingle();
  if (existing) return { status: "already-known" };

  const { status, json } = await squareGet(`/v2/orders/${orderId}`);
  if (status !== 200 || !json.order) {
    console.error("reconcilePilotOrder: order fetch failed:", orderId, status, json.errors);
    return { status: "error" };
  }
  const order = json.order;
  const lineItem = order.line_items?.[0];
  const isPilotPayment =
    order.total_money?.amount === PILOT_AMOUNT_CENTS &&
    order.total_money?.currency === PILOT_CURRENCY &&
    lineItem?.name?.toLowerCase() === PILOT_ITEM_NAME;
  if (!isPilotPayment) return { status: "not-pilot-payment" };

  const recipient =
    order.fulfillments?.[0]?.shipment_details?.recipient ??
    order.fulfillments?.[0]?.pickup_details?.recipient;
  const { uniEmail, heard } = parseNote(lineItem?.note);
  const email = uniEmail ?? recipient?.email_address ?? null;
  const name = recipient?.display_name ?? "Unknown";
  const phone = cleanPhone(recipient?.phone_number);

  if (email && EXCLUDED_EMAILS.has(email)) {
    return { status: "not-pilot-payment" };
  }

  if (!email || !phone) {
    // Paid but we can't identify them well enough to record a usable row —
    // needs a human to look at the order in the Square dashboard. Logged,
    // not silently dropped.
    console.error("reconcilePilotOrder: incomplete buyer info, needs manual review:", orderId, {
      email,
      phone,
    });
    return { status: "incomplete" };
  }

  const paidAt = order.created_at ?? new Date().toISOString();
  const university = email.endsWith("@student.monash.edu")
    ? "Monash University"
    : "University of Melbourne";

  const { error: insertError } = await db.from("pilot_signups").insert({
    full_name: name,
    email,
    phone,
    university,
    // The Payment Link checkout has no "I'm over 18" checkbox like the
    // app's own form does — this timestamp is the closest honest proxy,
    // not a real attestation.
    over_18_confirmed_at: paidAt,
    payment_status: "paid",
    square_order_id: orderId,
    square_payment_id: paymentId,
    amount_cents: PILOT_AMOUNT_CENTS,
    currency: PILOT_CURRENCY,
    paid_at: paidAt,
  });
  // A duplicate email means they already have a pilot_signups row from the
  // app's own flow (e.g. started there, then also paid via the link) —
  // leave that row alone rather than erroring the whole reconciliation.
  if (insertError && insertError.code !== "23505") {
    console.error("reconcilePilotOrder: pilot_signups insert failed:", orderId, insertError);
    return { status: "error" };
  }

  // Best-effort, matching join-pilot.ts's addToWaitlist: never let a
  // mailing-list hiccup affect the payment record above.
  try {
    const { error } = await db.from("waitlist").upsert(
      { name, email, phone, university, heard_from: heard, founding_member: false },
      { onConflict: "email", ignoreDuplicates: true }
    );
    if (error) console.error("reconcilePilotOrder: waitlist upsert failed:", orderId, error);
  } catch (err) {
    console.error("reconcilePilotOrder: waitlist upsert threw:", orderId, err);
  }

  return { status: "reconciled", email };
}

/**
 * Safety-net sweep: scans recent completed $5 AUD payments and reconciles
 * any that a webhook delivery missed. `sinceDays` bounds the Square API
 * call so a routine run stays cheap.
 */
export async function sweepOrphanedPilotPayments(sinceDays = 7) {
  const beginTime = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();
  const { status, json } = await squareGet(
    `/v2/payments?location_id=${SQUARE_LOCATION_ID}&begin_time=${beginTime}&sort_order=ASC`
  );
  if (status !== 200) {
    console.error("sweepOrphanedPilotPayments: list payments failed:", status, json.errors);
    return { scanned: 0, reconciled: 0, results: [] as ReconcileResult[] };
  }

  const candidates = (json.payments ?? []).filter(
    (p: { status: string; amount_money?: { amount: number; currency: string } }) =>
      p.status === "COMPLETED" &&
      p.amount_money?.amount === PILOT_AMOUNT_CENTS &&
      p.amount_money?.currency === PILOT_CURRENCY
  );

  const results: ReconcileResult[] = [];
  for (const p of candidates as { id: string; order_id: string }[]) {
    results.push(await reconcilePilotOrder(p.order_id, p.id));
  }

  return {
    scanned: candidates.length,
    reconciled: results.filter((r) => r.status === "reconciled").length,
    results,
  };
}
