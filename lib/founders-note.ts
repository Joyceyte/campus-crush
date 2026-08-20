// Shared with FoundersNote (the popup itself) and anywhere a signup actually
// completes (WaitlistModal, the pilot success page) so the popup knows not to
// come back for someone who already joined.

const DISMISSED_AT_KEY = "cc-founders-note-dismissed-at";
const SIGNED_UP_KEY = "cc-signed-up";

// How long to leave someone alone after they close the note without signing
// up, before it's fair to show it again.
export const FOUNDERS_NOTE_SNOOZE_DAYS = 5;

export function markSignedUp() {
  try {
    window.localStorage.setItem(SIGNED_UP_KEY, "1");
  } catch {
    // Private browsing or storage disabled — nothing to persist, and the
    // note reappearing for this visitor isn't worth breaking the page over.
  }
}

export function recordFoundersNoteDismissal() {
  try {
    window.localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
  } catch {
    // See above.
  }
}

export function shouldShowFoundersNote(): boolean {
  try {
    if (window.localStorage.getItem(SIGNED_UP_KEY) === "1") return false;
    const dismissedAt = window.localStorage.getItem(DISMISSED_AT_KEY);
    if (!dismissedAt) return true;
    const elapsedMs = Date.now() - Number(dismissedAt);
    return elapsedMs >= FOUNDERS_NOTE_SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    // Storage unavailable — show it, same as a first-ever visit.
    return true;
  }
}
