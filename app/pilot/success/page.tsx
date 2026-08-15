import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { readPilotPaymentState } from "@/lib/square";
import { sendPilotConfirmationEmail } from "@/lib/emails/pilot-confirmation";

export const dynamic = "force-dynamic";

// `ref` is a lookup key, never proof of payment. Anyone can visit this URL —
// including someone who cancelled at Square's checkout, since cancel flows
// often reuse the same redirect. So we find the row by ref and then ask Square
// whether that order was actually paid. Square decides; the URL doesn't.
export default async function PilotSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  if (!ref) return <Shell><NotFound /></Shell>;

  // This page renders immediately after a student has been charged. Anything
  // that throws here — missing env var, Supabase down, Square unreachable —
  // must degrade to "we're confirming your payment", never to a crash page.
  // Their money is safe either way; the row can be reconciled by hand.
  try {
    return <Shell>{await Confirmed(ref)}</Shell>;
  } catch (err) {
    console.error("pilot/success render failed:", err);
    return <Shell><Confirming /></Shell>;
  }
}

async function Confirmed(ref: string) {
  const db = supabaseAdmin();
  const { data: signup, error } = await db
    .from("pilot_signups")
    .select("id, full_name, email, payment_status, square_order_id")
    .eq("id", ref)
    .maybeSingle();

  // A query error is not the same as "no such signup" — don't tell someone who
  // just paid that we can't find them because the database blipped.
  if (error) {
    console.error("pilot/success lookup failed:", error);
    return <Confirming />;
  }
  if (!signup) return <NotFound />;

  let paid = signup.payment_status === "paid";

  if (!paid && signup.square_order_id) {
    const result = await readPilotPaymentState(signup.square_order_id);
    if (result.state === "paid") {
      // Conditional update guarding a double render: `.eq("payment_status",
      // "pending")` means only one of two near-simultaneous loads matches a
      // row. `.select()` tells us which one won, and only the winner sends the
      // confirmation email — so a refresh can't email the student twice.
      const { data: claimed } = await db
        .from("pilot_signups")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
          square_payment_id: result.paymentId,
          amount_cents: result.amountCents,
          currency: result.currency,
          confirmation_email_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", signup.id)
        .eq("payment_status", "pending")
        .select("id");

      if (claimed && claimed.length > 0) {
        await sendPilotConfirmationEmail(signup.full_name, signup.email);
      }
      paid = true;
    }
  }

  return paid ? <YoureIn name={signup.full_name} /> : <Confirming />;
}

function YoureIn({ name }: { name: string }) {
  const first = name.trim().split(/\s+/)[0];
  return (
    <>
      <p style={label}>campus crush</p>
      <h1 style={heading}>You&rsquo;re in{first ? `, ${first}` : ""}!</h1>
      <p style={lead}>Welcome to the pilot program.</p>
      <p style={body}>
        You&rsquo;ve successfully joined the semester 2, 2026 pilot program —
        thanks for being one of the first!
      </p>
      <p style={body}>
        We haven&rsquo;t launched yet, but you will be the first to know.
        Here&rsquo;s what&rsquo;s waiting for you:
      </p>
      <ul style={list}>
        <li>A match based on your preferences and personality</li>
        <li>A date planned for you with freebies and discounts</li>
      </ul>
      <p style={{ ...body, fontWeight: 700, color: "var(--ink, #2B1B12)" }}>
        What&rsquo;s next:
      </p>
      <ul style={list}>
        <li>You&rsquo;ll receive a text and email when we launch</li>
        <li>Enjoy your date!</li>
      </ul>
      <p style={body}>
        <a href="mailto:hello@campus-crush.org?subject=Pilot%20feedback" style={linkStyle}>
          Give us feedback on your experience and how we can improve
        </a>
      </p>
      <Link href="/" className="neon-btn" style={{ marginTop: "0.5rem", display: "inline-block" }}>
        Back to home
      </Link>
    </>
  );
}

function Confirming() {
  return (
    <>
      <p style={label}>campus crush</p>
      <h1 style={heading}>Confirming your payment…</h1>
      <p style={body}>
        This usually takes a few seconds. Refresh this page in a moment — and if
        it still isn&rsquo;t confirmed, email{" "}
        <a href="mailto:hello@campus-crush.org" style={linkStyle}>
          hello@campus-crush.org
        </a>{" "}
        and we&rsquo;ll sort it out. If you were charged, your spot is safe.
      </p>
      <Link href="/" className="neon-btn" style={{ marginTop: "0.5rem", display: "inline-block" }}>
        Back to home
      </Link>
    </>
  );
}

function NotFound() {
  return (
    <>
      <p style={label}>campus crush</p>
      <h1 style={heading}>We couldn&rsquo;t find that signup</h1>
      <p style={body}>
        The link may be incomplete. Email{" "}
        <a href="mailto:hello@campus-crush.org" style={linkStyle}>
          hello@campus-crush.org
        </a>{" "}
        and we&rsquo;ll track it down.
      </p>
      <Link href="/" className="neon-btn" style={{ marginTop: "0.5rem", display: "inline-block" }}>
        Back to home
      </Link>
    </>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      style={{
        minHeight: "100vh",
        background: "var(--parchment, #F7EFE1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.25rem",
      }}
    >
      <div style={{ maxWidth: "34rem", width: "100%" }}>{children}</div>
    </main>
  );
}

const label: React.CSSProperties = {
  fontSize: "0.72rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  fontWeight: 700,
  color: "rgba(43,27,18,0.5)",
  margin: "0 0 0.75rem",
};
const heading: React.CSSProperties = {
  fontFamily: "'Jersey 25', 'Arial Narrow', Arial, sans-serif",
  fontSize: "clamp(2.5rem,7vw,3.5rem)",
  lineHeight: 1.05,
  color: "var(--ink, #2B1B12)",
  margin: "0 0 1rem",
};
const lead: React.CSSProperties = {
  fontSize: "1.05rem",
  fontWeight: 700,
  color: "var(--ink, #2B1B12)",
  margin: "0 0 1rem",
};
const body: React.CSSProperties = {
  fontSize: "0.95rem",
  lineHeight: 1.7,
  color: "rgba(43,27,18,0.75)",
  margin: "0 0 1rem",
};
const list: React.CSSProperties = {
  fontSize: "0.95rem",
  lineHeight: 1.8,
  color: "rgba(43,27,18,0.75)",
  margin: "0 0 1.25rem",
  paddingLeft: "1.2rem",
};
const linkStyle: React.CSSProperties = {
  color: "var(--terracotta, #C1512F)",
  textDecoration: "underline",
};
