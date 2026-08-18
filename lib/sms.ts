// Twilio REST helpers. Raw `fetch` rather than the Twilio SDK, same reasoning
// as lib/square.ts — sending a message is one endpoint, not worth a dependency
// whose surface changes across major versions.
//
// Server-only: the auth token must never reach the browser. Nothing here is
// NEXT_PUBLIC_, so a client import fails at runtime rather than leaking it.

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? "";
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? "";
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER ?? "";

export function smsConfigured() {
  return Boolean(ACCOUNT_SID && AUTH_TOKEN && FROM_NUMBER);
}

export type SendSmsResult =
  | { ok: true; sid: string }
  | { ok: false; error: string };

/**
 * Sends a single SMS via Twilio.
 *
 * `to` must already be E.164 (lib/pilot.ts's normalisePhone produces this —
 * both the waitlist and pilot signup phone numbers are stored in that form).
 */
export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
  if (!smsConfigured()) {
    return { ok: false, error: "SMS is not configured (missing Twilio env vars)." };
  }

  const auth = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: FROM_NUMBER, Body: body }),
    }
  );

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("Twilio sendSms failed:", res.status, json);
    return { ok: false, error: json.message ?? `Twilio error (${res.status})` };
  }

  return { ok: true, sid: json.sid };
}
