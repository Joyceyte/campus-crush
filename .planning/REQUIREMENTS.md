# Requirements: Campus Crush — User Accounts & Onboarding Profiles

**Defined:** 2026-08-03
**Updated:** 2026-08-03 — re-scoped to follow `specs/MVP design .png`: added conditional Stripe payment gated on waitlist founding-member status; end-of-flow is confirmation + next-steps timeline (profile edit deferred to v2).
**Core Value:** A student can sign in with Google and submit a complete, safety-reviewed dating profile that gives the team everything needed to match them for a food date during the pilot.
**Design reference:** `specs/MVP design .png` — 5-screen flow: landing → Google login → onboarding form (I am / I'm looking for / Availability + face photo + conditional payment) → "details submitted" confirmation → next-steps/matching-timeline.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can sign in with their Google account via Supabase Auth (no email/password option)
- [ ] **AUTH-02**: Sign-in is rejected server-side unless the Google account email matches an allowed university domain (UniMelb, Monash, Deakin, RMIT, La Trobe), with a friendly "use your uni account" error page
- [ ] **AUTH-03**: User session persists across page loads and browser refresh (middleware session refresh via @supabase/ssr)
- [ ] **AUTH-04**: User can sign out from any authenticated page
- [ ] **AUTH-05**: OAuth callback works on both localhost (dev) and campus-crush.org (production redirect URLs documented in a go-live checklist)

### Database & Security

- [ ] **DATA-01**: A dedicated `profiles` table (separate from waitlist/venues) stores one row per authenticated user, keyed to `auth.users.id`
- [ ] **DATA-02**: `profiles` has RLS enabled; a user can read and write only their own row (verified with a two-account test)
- [ ] **DATA-03**: A private Supabase Storage bucket stores profile photos under `{userId}/`, with owner-scoped storage RLS; photos are never publicly accessible
- [ ] **DATA-04**: All schema changes are delivered as SQL files in `supabase/` for manual execution in the Supabase dashboard
- [ ] **DATA-05**: The `profiles` table includes payment/eligibility fields so no mid-milestone migration is needed: `is_founding_member` (snapshot of eligibility at onboarding), `payment_required` (boolean), `stripe_customer_id`, and `stripe_payment_method_id` (saved via SetupIntent, nullable for founding members)

### Onboarding Form

- [ ] **FORM-01**: New signed-in user without a profile is routed to the onboarding form; user with a completed profile is routed to their confirmation/edit view
- [ ] **FORM-02**: User can upload a face photo, with the safety notice that accounts whose photo doesn't clearly show their face will not be accepted
- [ ] **FORM-03**: User can enter profile basics: age, sex, height (cm dropdown), ethnicity
- [ ] **FORM-04**: User can enter free-text interest tags and select a dating intention
- [ ] **FORM-05**: User can select meal-time availability (Breakfast / Lunch / Dinner multi-select) and available dates from the next 14 rolling days (multi-select), with copy noting more availability = more likely to get a date
- [ ] **FORM-06**: User can set match preferences: interested in (women/men/other), age range, ethnicity (multi-select), height, and a "match with similar interests" checkbox (unticked = no preference)
- [ ] **FORM-07**: Form validates required fields (photo, age, sex, availability at minimum) with clear inline errors before submission
- [ ] **FORM-08**: Submitting saves photo + profile + preferences atomically to the user's own `profiles` row via a server action

### Payment (conditional, founding-member gated)

- [ ] **PAY-01**: At onboarding, the app determines payment eligibility server-side by matching the authenticated user's email (lowercased) against the existing `waitlist` table. A user with a `waitlist` row where `founding_member = true` is free; a user who is not a founding member, or is not on the waitlist at all, must provide payment.
- [ ] **PAY-02**: Non-founding users see the pricing explainer (first-100-free vs "$5 per date attended, money-back guarantee if the other person cancels/no-shows, nothing charged until you're set up on a date") and a Stripe payment element to save a card during onboarding. Founding members skip the payment step entirely and go straight to submit.
- [ ] **PAY-03**: Saving payment creates/reuses a Stripe customer and stores a reusable payment method via a SetupIntent (no immediate charge — card is charged later, manually, only when a date is set up). The user's `is_founding_member`, `payment_required`, `stripe_customer_id`, and `stripe_payment_method_id` are recorded on their `profiles` row. Stripe API keys are configured manually by the user (dashboard + env), like Google OAuth.

### Post-Signup

- [ ] **POST-01**: After submitting, the user lands on a confirmation screen ("your details are submitted") and a confirmation + next-steps email is sent to their university email
- [ ] **POST-02**: The user sees a next-steps screen explaining the matching timeline (a potential match is emailed with profile/photo/date-time; the user has a window to confirm or skip; successful matches are notified) — mirroring the pilot-dates copy in the MVP design

## v2 Requirements

### Moderation & Matching

- **MODR-01**: Admin review dashboard for approving/rejecting profile photos
- **MODR-02**: Automated client-side face-detection hint before photo submission
- **MODR-03**: Acceptance/rejection notification emails
- **MTCH-01**: In-app match display and date confirmation

### Profile & Billing (deferred from v1)

- **EDIT-01**: Returning user can view and edit their saved profile in a pre-filled form (was v1 POST-02; deferred when v1 end-of-flow became confirmation + next-steps per the MVP design)
- **PAY-04**: Actual per-date charge capture (charge the saved payment method when a date is set up) + money-back/refund handling — v1 only saves the card via SetupIntent

## Out of Scope

| Feature | Reason |
|---------|--------|
| Email/password or magic-link auth | Google-only keeps pilot simple; all target students have uni Google accounts |
| Automated face verification | Manual review viable at pilot scale; avoids ML complexity |
| In-app matching, browsing, chat | Team matches manually during pilot |
| Admin dashboard | Team reviews photos/profiles directly in Supabase dashboard |
| Draft auto-save mid-form | Single-sitting form is acceptable for pilot; row-existence = completion signal keeps routing simple |
| Profile edit view (v1) | MVP design ends the flow at confirmation + next-steps; edit deferred to v2 (EDIT-01) |
| Charging the saved card (v1) | v1 saves a payment method via SetupIntent only; actual per-date charge deferred to v2 (PAY-04) |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 1 | Pending |
| DATA-05 | Phase 1 | Pending |
| FORM-01 | Phase 2 | Pending |
| FORM-02 | Phase 3 | Pending |
| FORM-03 | Phase 3 | Pending |
| FORM-04 | Phase 3 | Pending |
| FORM-05 | Phase 3 | Pending |
| FORM-06 | Phase 3 | Pending |
| FORM-07 | Phase 3 | Pending |
| FORM-08 | Phase 3 | Pending |
| PAY-01 | Phase 3 | Pending |
| PAY-02 | Phase 3 | Pending |
| PAY-03 | Phase 3 | Pending |
| POST-01 | Phase 4 | Pending |
| POST-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-03*
*Last updated: 2026-08-03 after roadmap creation (4 phases, full coverage)*
