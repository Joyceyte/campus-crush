// Shared pilot rules. Kept in one place so the form, the server action and
// the success page can't drift apart on who's eligible or when it closes.

export const PILOT_EMAIL_SUFFIX = "@student.unimelb.edu.au";
export const PILOT_UNIVERSITY = "University of Melbourne";
export const PILOT_SPOTS = 100;

// Signups close at end of day 20 August 2026, Melbourne time (UTC+10).
export const PILOT_CLOSES_AT = new Date("2026-08-20T23:59:59+10:00");

export function pilotIsOpen(now: Date = new Date()) {
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
