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
  PILOT_UNIVERSITY,
  GENDERS,
  HEARD_FROM_OPTIONS,
} from "@/lib/pilot";

/**
 * `error` is something the student must fix. `notice` is information — it
 * renders calmly rather than in red, because "you already joined" is good news
 * dressed as a rejection if you style it like a failure.
 */
export type JoinPilotState = { error?: string; notice?: string };

// Pilot signups are the most engaged students we have (they paid), so they
// belong on the general mailing list too — otherwise they'd miss every
// broadcast (deadline reminders, launch announcements) sent through the
// waitlist segment. Best-effort: a hiccup here must never block a paid
// signup. `ignoreDuplicates` means an existing waitlist row — with its own
// gender/heard_from answers — is left untouched rather than overwritten
// with nulls.
async function addToWaitlist(
  db: ReturnType<typeof supabaseAdmin>,
  opts: { fullName: string; email: string; phone: string; gender: string; heardFrom: string }
) {
  try {
    const { error } = await db.from("waitlist").upsert(
      {
        name: opts.fullName,
        email: opts.email,
        phone: opts.phone,
        gender: opts.gender,
        heard_from: opts.heardFrom,
        university: PILOT_UNIVERSITY,
        founding_member: false,
      },
      { onConflict: "email", ignoreDuplicates: true }
    );
    if (error) console.error("joinPilot: waitlist upsert failed:", error);
  } catch (err) {
    console.error("joinPilot: waitlist upsert threw:", err);
  }
}

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
  const gender = String(formData.get("gender") ?? "").trim();
  const heardFrom = String(formData.get("heard_from") ?? "").trim();
  const over18 = formData.get("over_18") === "on";
  const wantsFriend = formData.get("signup_with_friend") === "on";
  const friendEmailRaw = String(formData.get("friend_email") ?? "").trim().toLowerCase();

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
  if (!GENDERS.includes(gender)) {
    return { error: "Please select a gender." };
  }
  if (!HEARD_FROM_OPTIONS.includes(heardFrom)) {
    return { error: "Please let us know how you heard about us." };
  }
  if (!over18) return { error: "You need to confirm you're over 18 to join." };

  // Honor system — not verified against the friend's own signup, just stored
  // so the team can manually pair the two of you for a group date. Still
  // re-checked server-side since a client toggle isn't enforcement.
  let friendEmail: string | null = null;
  if (wantsFriend) {
    if (!isEligibleEmail(friendEmailRaw)) {
      return {
        error:
          "Please enter your friend's UniMelb email (@student.unimelb.edu.au) so we can try to pair you up.",
      };
    }
    if (friendEmailRaw === email) {
      return { error: "That's your own email — enter your friend's instead." };
    }
    friendEmail = friendEmailRaw;
  }

  // supabaseAdmin() throws when the service-role key is absent. Catch it here
  // so a misconfigured deploy shows a human message instead of an unhandled
  // Server Action error.
  let db: ReturnType<typeof supabaseAdmin>;
  try {
    db = supabaseAdmin();
  } catch (err) {
    console.error("joinPilot: Supabase admin client unavailable:", err);
    return { error: "We couldn't save your details. Please try again soon." };
  }

  // Someone who already started: don't trip the unique constraint, just pick
  // up where they left off.
  const { data: existing } = await db
    .from("pilot_signups")
    .select("id, payment_status, square_payment_link_url")
    .eq("email", email)
    .maybeSingle();

  // Deliberately NOT a redirect to /pilot/success. That page greets the student
  // by name, so redirecting on an email match let anyone type someone else's
  // address and be shown "You're in, <their name>!" — leaking both that the
  // address is enrolled and who it belongs to. The success page is reachable
  // only with the row's UUID, which is unguessable.
  if (existing?.payment_status === "paid") {
    return {
      notice:
        "You're already signed up! This email has joined the semester 2 pilot — check your inbox for your confirmation email.",
    };
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
        gender,
        heard_from: heardFrom,
        university: PILOT_UNIVERSITY,
        friend_email: friendEmail,
        over_18_confirmed_at: new Date().toISOString(),
        amount_cents: PILOT_PRICE_CENTS,
        currency: PILOT_CURRENCY,
      })
      .select("id")
      .single();

    if (insertError?.code === "23505") {
      // A concurrent request for the same email (a double-click, or a retry
      // that raced the first attempt) won the insert a moment ago. Recover
      // by picking up that row instead of showing an error for something
      // that actually succeeded.
      const { data: raced } = await db
        .from("pilot_signups")
        .select("id, payment_status, square_payment_link_url")
        .eq("email", email)
        .maybeSingle();
      if (raced?.payment_status === "paid") {
        return {
          notice:
            "You're already signed up! This email has joined the semester 2 pilot — check your inbox for your confirmation email.",
        };
      }
      if (raced?.square_payment_link_url) {
        redirect(raced.square_payment_link_url);
      }
      signupId = raced?.id;
    } else if (insertError || !inserted) {
      console.error("joinPilot: insert failed:", insertError);
      return { error: "Something went wrong saving your details. Try again." };
    } else {
      signupId = inserted.id;
      await addToWaitlist(db, { fullName, email, phone, gender, heardFrom });
    }

    if (!signupId) {
      console.error("joinPilot: insert race unresolved for", email);
      return { error: "Something went wrong saving your details. Try again." };
    }
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
