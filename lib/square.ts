// Square REST helpers. Deliberately raw `fetch` rather than the Square SDK —
// we call four endpoints, and the SDK's surface has churned across major
// versions (Client/checkoutApi vs SquareClient/checkout.paymentLinks).
//
// Server-only: only import this from Server Actions and Server Components.
// The access token must never reach the browser, and none of these env vars
// are NEXT_PUBLIC_, so a client import would fail at runtime rather than leak.

const SQUARE_VERSION = "2025-06-18";

// Production naming is SQUARE_*; the sandbox credentials in .env.local are
// still under their original SANDBOX_* names. Accept either so switching to
// production is an env change, not a code change.
const ACCESS_TOKEN =
  process.env.SQUARE_ACCESS_TOKEN ?? process.env.SANDBOX_ACCESS_TOKEN ?? "";
const LOCATION_ID =
  process.env.SQUARE_LOCATION_ID ?? process.env.SANDBOX_LOCATION_ID ?? "";

// Defaults to sandbox: going live has to be a deliberate act, not an accident.
const IS_PRODUCTION = process.env.SQUARE_ENVIRONMENT === "production";
const BASE = IS_PRODUCTION
  ? "https://connect.squareup.com"
  : "https://connect.squareupsandbox.com";

export const PILOT_PRICE_CENTS = 500; // A$5.00
export const PILOT_CURRENCY = "AUD";

export function squareConfigured() {
  return Boolean(ACCESS_TOKEN && LOCATION_ID);
}

async function square<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<{ status: number; json: T }> {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Square-Version": SQUARE_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as T;
  return { status: res.status, json };
}

type PaymentLinkResponse = {
  payment_link?: { id: string; url: string; order_id: string };
  errors?: unknown;
};

/**
 * Mints a hosted checkout link for one student.
 *
 * `signupId` is used three ways: as the order's reference_id (so the payment
 * can be matched back to this student), as the idempotency key (so a
 * double-click can't create two links), and in the redirect URL.
 */
export async function createPilotPaymentLink(opts: {
  signupId: string;
  email: string;
  siteUrl: string;
}) {
  const { status, json } = await square<PaymentLinkResponse>(
    "POST",
    "/v2/online-checkout/payment-links",
    {
      idempotency_key: opts.signupId,
      order: {
        location_id: LOCATION_ID,
        reference_id: opts.signupId,
        line_items: [
          {
            name: "Campus Crush Pilot — Semester 2, 2026",
            quantity: "1",
            base_price_money: {
              amount: PILOT_PRICE_CENTS,
              currency: PILOT_CURRENCY,
            },
          },
        ],
      },
      checkout_options: {
        redirect_url: `${opts.siteUrl}/pilot/success?ref=${opts.signupId}`,
        ask_for_shipping_address: false,
      },
      pre_populated_data: { buyer_email: opts.email },
      description:
        "Secures your spot in the semester 2, 2026 Campus Crush pilot as one of the first users who will be matched for dates at one of our venues. If you do not receive a match during the pilot, you will get a full refund.",
    }
  );

  if (status !== 200 || !json.payment_link) {
    console.error("Square createPaymentLink failed:", status, json.errors);
    return null;
  }
  return json.payment_link;
}

type OrderResponse = {
  order?: {
    id: string;
    state: string;
    reference_id?: string;
    total_money?: { amount: number; currency: string };
    tenders?: { id: string; payment_id?: string }[];
  };
};

type PaymentResponse = {
  payment?: { id: string; status: string; order_id?: string };
};

export type PilotPaymentState =
  | { state: "paid"; paymentId: string; amountCents: number; currency: string }
  | { state: "unpaid" }
  | { state: "unknown" };

/**
 * Asks Square whether an order was actually paid.
 *
 * Note it reads the PAYMENT's status, not the order's. A completed payment
 * leaves the order at state=OPEN — order state tracks fulfilment, not money —
 * so keying off order state would mark nobody as paid. Verified against the
 * sandbox on 2026-08-15.
 */
export async function readPilotPaymentState(
  orderId: string
): Promise<PilotPaymentState> {
  const order = await square<OrderResponse>("GET", `/v2/orders/${orderId}`);
  if (order.status !== 200 || !order.json.order) return { state: "unknown" };

  const tender = order.json.order.tenders?.[0];
  const paymentId = tender?.payment_id ?? tender?.id;
  if (!paymentId) return { state: "unpaid" };

  const payment = await square<PaymentResponse>(
    "GET",
    `/v2/payments/${paymentId}`
  );
  if (payment.status !== 200 || !payment.json.payment) return { state: "unknown" };

  if (payment.json.payment.status !== "COMPLETED") return { state: "unpaid" };

  return {
    state: "paid",
    paymentId: payment.json.payment.id,
    amountCents: order.json.order.total_money?.amount ?? PILOT_PRICE_CENTS,
    currency: order.json.order.total_money?.currency ?? PILOT_CURRENCY,
  };
}
