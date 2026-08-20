import { resend } from "@/lib/resend";

// Same segment the campus-crush-broadcast skill's `sync` command targets.
// Previously that script's manual sync was the *only* way a new Supabase
// waitlist row ever reached this segment, so it silently drifted out of
// date between runs. Calling this at signup time keeps the two in sync
// automatically, without needing anyone to remember to re-run sync.
const WAITLIST_SEGMENT_ID = "191cb508-6f66-4153-b078-7be7d17d0abb";

/**
 * Adds an email to the Resend segment used for broadcast sends. Never
 * throws — a mailing-list hiccup must never block a signup or a payment.
 * Looks the contact up first because Resend contacts are unique per email
 * account-wide: creating one that already exists (even in a different
 * segment) fails, so an existing contact gets added to this segment instead
 * of re-created.
 */
export async function addToWaitlistSegment(email: string, firstName?: string) {
  try {
    const { data: existing } = await resend.contacts.get({ email });
    if (existing?.id) {
      const { error } = await resend.contacts.segments.add({
        contactId: existing.id,
        segmentId: WAITLIST_SEGMENT_ID,
      });
      if (error) console.error("addToWaitlistSegment: segments.add failed:", email, error);
      return;
    }

    const { error } = await resend.contacts.create({
      email,
      firstName,
      segments: [{ id: WAITLIST_SEGMENT_ID }],
    });
    if (error) console.error("addToWaitlistSegment: create failed:", email, error);
  } catch (err) {
    console.error("addToWaitlistSegment threw:", email, err);
  }
}
