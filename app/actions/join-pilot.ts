"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  createPilotPaymentLink,
  squareConfigured,
  PILOT_PRICE_CENTS,
  PILOT_CURRENCY,
} from "@/lib/square";
import {
  isEligibleEmail,
  normalisePhone,
  pilotIsOpen,
  PILOT_SPOTS,
  PILOT_UNIVERSITY,
} from "@/lib/pilot";

export type JoinPilotState = { error?: string };

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export async function joinPilot(
  _prev: JoinPilotState,
  formData: FormData
): Promise<JoinPilotState> {
  // Every rule is re-checked here. The form does the same checks for a fast,
  // friendly UX, but a Server Action is a public endpoint — client validation
  // is presentation, not enforcement.
  if (!pilotIsOpen()) {
    return { error: "Signups for the semester 2 pilot have closed." };
  }
  if (!squareConfigured()) {
    console.error("joinPilot: Square credentials missing");
    return { error: "Payments are temporarily unavailable. Please try again soon." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const over18 = formData.get("over_18") === "on";

  if (!fullName) return { error: "Please enter your name." };
  if (!isEligibleEmail(email)) {
    return {
      error:
        "The pilot is UniMelb-only this semester — please use your @student.unimelb.edu.au address.",
    };
  }
  const phone = normalisePhone(phoneRaw);
  if (!phone) {
    return { error: "Please enter a valid Australian mobile number, e.g. 0412 345 678." };
  }
  if (!over18) return { error: "You need to confirm you're over 18 to join." };

  const db = supabaseAdmin();

  // Cap check. A couple of in-flight payments can still slip past this; the
  // refund promise in the confirmation email covers that case, which is much
  // cheaper than real reservation logic for 100 spots.
  const { count, error: countError } = await db
    .from("pilot_signups")
    .select("id", { count: "exact", head: true })
    .eq("payment_status", "paid");
  if (countError) {
    console.error("joinPilot: cap count failed:", countError);
  } else if ((count ?? 0) >= PILOT_SPOTS) {
    return { error: "All 100 pilot spots have been taken." };
  }

  // Someone who already started: don't trip the unique constraint, just pick
  // up where they left off.
  const { data: existing } = await db
    .from("pilot_signups")
    .select("id, payment_status, square_payment_link_url")
    .eq("email", email)
    .maybeSingle();

  if (existing?.payment_status === "paid") {
    redirect(`/pilot/success?ref=${existing.id}`);
  }
  if (existing?.square_payment_link_url) {
    redirect(existing.square_payment_link_url);
  }

  let signupId = existing?.id as string | undefined;

  if (!signupId) {
    const { data: inserted, error: insertError } = await db
      .from("pilot_signups")
      .insert({
        full_name: fullName,
        email,
        phone,
        university: PILOT_UNIVERSITY,
        over_18_confirmed_at: new Date().toISOString(),
        amount_cents: PILOT_PRICE_CENTS,
        currency: PILOT_CURRENCY,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.error("joinPilot: insert failed:", insertError);
      return { error: "Something went wrong saving your details. Try again." };
    }
    signupId = inserted.id;
  }

  const link = await createPilotPaymentLink({
    signupId: signupId!,
    email,
    siteUrl: siteUrl(),
  });

  if (!link) {
    return { error: "We couldn't start the payment. Please try again." };
  }

  // Storing order_id is what makes the payment recoverable: it's the handle we
  // use to ask Square whether this student actually paid.
  const { error: updateError } = await db
    .from("pilot_signups")
    .update({
      square_payment_link_id: link.id,
      square_payment_link_url: link.url,
      square_order_id: link.order_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", signupId!);

  if (updateError) {
    console.error("joinPilot: link update failed:", updateError);
    return { error: "Something went wrong. Please try again." };
  }

  // redirect() throws to unwind — it must sit outside any try/catch.
  redirect(link.url);
}
