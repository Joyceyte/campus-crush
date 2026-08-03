# Roadmap: Campus Crush — User Accounts & Onboarding Profiles

## Overview

This milestone bolts a real auth-and-profile system onto the existing Next.js marketing site, following the flow in `specs/MVP design .png` (landing → Google login → onboarding form → confirmation → next-steps). It starts with the invisible-but-highest-risk foundation (Supabase clients, session middleware, RLS-protected `profiles` table with payment/eligibility columns, private photo bucket), then builds the visible sign-in flow with a server-enforced university-domain gate and the routing logic that sends students to the right screen. With auth solid, the milestone delivers the value proposition — a multi-step onboarding form covering profile, interests, availability, and match preferences with a required face photo, plus a conditional Stripe payment step (founding members from the existing waitlist are free; everyone else saves a card via SetupIntent) — and closes with a submission confirmation and a next-steps/matching-timeline screen so a student always has a place to land after submitting. (Returning-user profile editing is deferred to v2.)

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Supabase Auth Foundation** - Session-refreshing clients, middleware, and an RLS-protected profiles table (incl. payment/eligibility columns) + private photo bucket exist and are verified
- [ ] **Phase 2: Google Sign-In, Domain Gate & Protected Routing** - Students sign in with their uni Google account, non-partner emails are rejected, and users land on the right onboarding/confirmation screen
- [ ] **Phase 3: Onboarding Form, Photo & Payment** - New students complete a full profile — face photo, demographics, interests, availability, preferences — in one sitting, with a conditional Stripe card-save step for non-founding-members
- [ ] **Phase 4: Confirmation & Next Steps** - Students see a "details submitted" confirmation, get a confirmation email, and see the matching-timeline next-steps screen

## Phase Details

### Phase 1: Supabase Auth Foundation

**Goal**: The technical foundation for secure, per-user profile data exists — Supabase clients, session-refreshing middleware, and a private, RLS-protected `profiles` table and photo storage bucket are in place and verified.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05
**Success Criteria** (what must be TRUE):

  1. The `profiles` table exists in Supabase, keyed to `auth.users.id`, with RLS enabled — a two-account test confirms a user can read and write only their own row
  2. A private Supabase Storage bucket exists for profile photos, scoped per-user (`{userId}/`), and is confirmed unreachable via public URL
  3. Supabase browser/server/middleware client wrappers and a root `middleware.ts` are in place, refreshing the session cookie on every request
  4. All schema, RLS, and storage changes exist as runnable `.sql` files in `supabase/`, matching the existing manual-execution pattern (`founding-member.sql`, `venues.sql`)
  5. The `profiles` table includes payment/eligibility columns (`is_founding_member`, `payment_required`, `stripe_customer_id`, `stripe_payment_method_id`) so the Phase 3 payment step needs no follow-up migration

**Plans**: 3 plans
**Wave 1**

- [ ] 01-01-PLAN.md — SSR client factories (browser/server/middleware) + root middleware session refresh
- [ ] 01-02-PLAN.md — profiles.sql (wide schema + DATA-05 payment columns, owner-only RLS) + photos-storage.sql (private bucket + storage RLS)

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 01-03-PLAN.md — Apply SQL in Supabase + two-account RLS / private-bucket / DATA-05 verification (manual checkpoint)

### Phase 2: Google Sign-In, Domain Gate & Protected Routing

**Goal**: A student can sign in with their university Google account, gets rejected server-side if they use a non-partner email, stays signed in across sessions, can sign out anytime, and lands on the correct onboarding/profile screen for their account state.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, FORM-01
**Success Criteria** (what must be TRUE):

  1. Student can sign in with Google, both in local dev and in production (campus-crush.org), and returns to the app authenticated
  2. Sign-in with a non-partner-university email is rejected server-side with a friendly "use your uni account" error page
  3. Session persists across page reloads and browser restarts, and the user can sign out from any authenticated page
  4. A new signed-in user without a saved profile is routed to onboarding; a user with a completed profile is routed to the confirmation/edit view

**Plans**: 3 plans
**UI hint**: yes

**Wave 1**

- [ ] 02-01-PLAN.md — `/login` screen + Google OAuth sign-in button + `lib/uni-domains.ts` single-source-of-truth domain list

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 02-02-PLAN.md — `/auth/callback` PKCE exchange + server-side domain gate, `lib/auth/guard.ts`, protected `(authed)` shell, `/onboarding` + `/confirmation` placeholders, sign-out

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 02-03-PLAN.md — `profiles` domain-guard SQL + go-live checklist (AUTH-05) + manual Google OAuth config, SQL apply, and the carried-forward DATA-02 / DATA-03 proofs

### Phase 3: Onboarding Form, Photo & Payment

**Goal**: A new student can complete a full onboarding profile in one sitting — face photo, demographics, interests, dating intention, availability, and match preferences — and, if they are not a founding member, save a card via Stripe, with clear validation and safety copy, saved atomically to their profile.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: FORM-02, FORM-03, FORM-04, FORM-05, FORM-06, FORM-07, FORM-08, PAY-01, PAY-02, PAY-03
**Success Criteria** (what must be TRUE):

  1. User can upload a required face photo (with the safety notice that non-face photos won't be accepted) and enter profile basics: age, sex, height (cm dropdown), ethnicity
  2. User can enter free-text interest tags, select a dating intention, and select meal-time (B/L/D) plus rolling 14-day availability, with "more availability = more likely to get a date" copy
  3. User can set match preferences: interested in (women/men/other), age range, ethnicity (multi-select), height, and a "match with similar interests" checkbox (unticked = no preference)
  4. Eligibility is determined server-side by matching the user's email against the `waitlist` table: founding members skip payment; non-founding users see the pricing explainer and a Stripe payment element and save a card (SetupIntent, no immediate charge)
  5. Required fields (photo, age, sex, availability, and — for non-founding users — a saved payment method) show clear inline errors before submission; submitting saves photo + profile + preferences + payment state atomically to the user's own `profiles` row via a server action

**Plans**: TBD
**UI hint**: yes

### Phase 4: Confirmation & Next Steps

**Goal**: After completing onboarding, a student sees a "details submitted" confirmation, receives a confirmation email to their university address, and sees a next-steps screen explaining the matching timeline.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: POST-01, POST-02
**Success Criteria** (what must be TRUE):

  1. After submitting the onboarding form, the user lands on a confirmation screen ("your details are submitted") and a confirmation + next-steps email is sent to their university email
  2. The user sees a next-steps screen explaining the matching timeline (potential match emailed with profile/photo/date-time; confirm-or-skip window; successful matches notified), mirroring the MVP design copy

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Supabase Auth Foundation | 0/3 | Not started | - |
| 2. Google Sign-In, Domain Gate & Protected Routing | 0/3 | Not started | - |
| 3. Onboarding Form, Photo & Payment | 0/TBD | Not started | - |
| 4. Confirmation & Next Steps | 0/TBD | Not started | - |
