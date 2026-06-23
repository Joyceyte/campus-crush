import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Must be an address on a domain you've verified in Resend.
// For quick testing without a verified domain, use "onboarding@resend.dev".
export const WELCOME_FROM = "Campus Crush <hello@campus-crush.org>";
