// Shared pilot rules. Kept in one place so the form, the server action and
// the success page can't drift apart on who's eligible or when it closes.

export const PILOT_EMAIL_SUFFIX = "@student.unimelb.edu.au";
export const PILOT_UNIVERSITY = "University of Melbourne";
export const GENDERS = ["male", "female", "non-binary", "other"];
export const SEXUALITIES = [
  "straight",
  "gay",
  "lesbian",
  "bisexual",
  "pansexual",
  "asexual",
  "other",
];
export const HEARD_FROM_OPTIONS = [
  "instagram",
  "tiktok",
  "friend",
  "poster",
  "campus-event",
  "other",
];
export const STUDY_LEVELS = ["undergrad", "honours", "masters", "phd", "other"];

// Matches the existing "I confirm I am over 18" checkbox on both forms.
export const MIN_AGE = 18;
export const MAX_AGE = 100;

export function isValidAge(age: number): boolean {
  return Number.isInteger(age) && age >= MIN_AGE && age <= MAX_AGE;
}

/**
 * Resolves a "pick one, or type your own" select. When the raw value is
 * "other", the typed-in text becomes the actual stored value instead of the
 * literal word "other" — so no separate "_other" column is ever needed, the
 * field just holds whatever the student actually said. `error` is true when
 * the raw value isn't a valid option at all, or is "other" with nothing
 * typed in to replace it.
 */
export function resolveOtherField(
  rawValue: string,
  otherText: string,
  validOptions: readonly string[]
): { value: string; error: boolean } {
  if (!validOptions.includes(rawValue)) return { value: "", error: true };
  if (rawValue !== "other") return { value: rawValue, error: false };
  const trimmed = otherText.trim();
  return trimmed ? { value: trimmed, error: false } : { value: "", error: true };
}

// Signups close at end of day 1 September 2026, Melbourne time (UTC+10).
export const PILOT_CLOSES_AT = new Date("2026-09-01T23:59:59+10:00");

// Paused 19 Aug 2026: the actual pilot launch date is unconfirmed, so
// signups stay open past PILOT_CLOSES_AT until this is flipped back to
// false. Kept as an explicit toggle rather than deleting the cutoff logic,
// so re-enabling it later is a one-line change.
const CUTOFF_PAUSED = true;

export function pilotIsOpen(now: Date = new Date()) {
  if (CUTOFF_PAUSED) return true;
  return now <= PILOT_CLOSES_AT;
}

export function isEligibleEmail(email: string) {
  return email.trim().toLowerCase().endsWith(PILOT_EMAIL_SUFFIX);
}

/**
 * Normalises an Australian mobile number to E.164 so the launch SMS has
 * something dialable. Accepts 04xx xxx xxx, +61 4xx, and 61 4xx forms.
 * Returns null when it can't confidently produce a valid number — better to
 * reject at the form than to bank a number we can't text.
 */
export function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  let rest: string;

  if (digits.startsWith("+61")) rest = digits.slice(3);
  else if (digits.startsWith("61") && digits.length >= 11) rest = digits.slice(2);
  else if (digits.startsWith("0")) rest = digits.slice(1);
  else rest = digits;

  // Australian mobiles are 9 digits after the country code and start with 4.
  if (!/^4\d{8}$/.test(rest)) return null;
  return `+61${rest}`;
}
