# Campus Crush — User Accounts & Onboarding Profiles

## What This Is

Campus Crush is a food-date matching pilot for Melbourne university students (UniMelb, Monash, Deakin, RMIT, La Trobe), currently a Next.js landing site with a Supabase-backed waitlist at campus-crush.org. This milestone adds real user accounts: students sign in with their university Google account, complete an onboarding profile (face photo, demographics, interests, dating intention, meal availability) plus match preferences, and everything is saved to their own row in a dedicated Supabase profiles table.

## Core Value

A student can sign in with Google and submit a complete, safety-reviewed dating profile that gives the team everything needed to match them for a food date during the pilot.

## Business Context

- **Customer**: Melbourne uni students joining the food-date pilot (currently waitlist signups)
- **Revenue model**: Pre-revenue pilot; restaurant partnerships planned
- **Success metric**: Number of completed, accepted profiles with usable availability data
- **Strategy notes**: More availability selected → higher chance of being matched (surfaced in the form copy)

## Requirements

### Validated

- ✓ Marketing landing page with hero, scrapbook journey, partnerships section — existing
- ✓ Supabase-backed waitlist signup (single popup, founding-member tag) — existing
- ✓ Blog and contact pages, Resend email integration — existing

### Active

- [ ] Student can sign in with Google via Supabase Auth (no email/password)
- [ ] Sign-in restricted to the five partner universities' email domains, enforced server-side
- [ ] New user is taken to an onboarding form after first sign-in
- [ ] Profile section: face photo upload (with safety notice that non-face photos mean the account won't be accepted), age, sex, height (cm dropdown), ethnicity, interests (free-text tags), dating intention, availability (meal times B/L/D multi-select + next-14-days rolling date multi-select, with "more availability = more likely to get a date" copy)
- [ ] Preferences section: interested in (women/men/other), age range, ethnicity (multi-select), height, "match with similar interests" checkbox (unticked = no preference)
- [ ] Photo uploads go to a private Supabase Storage bucket for manual face review
- [ ] Profile + preferences saved to a dedicated `profiles` table (separate from waitlist/venues tables), one row per authenticated user
- [ ] Onboarding payment gate: founding members (matched by email against the existing `waitlist.founding_member` tag) are free; non-founding users save a card via Stripe (SetupIntent, no immediate charge) during onboarding
- [ ] After submitting, user lands on a "details submitted" confirmation, gets a confirmation email, and sees a next-steps/matching-timeline screen
- [ ] Returning user with a completed profile skips onboarding and lands on the confirmation/next-steps view

### Out of Scope

- Email/password or magic-link auth — Google-only keeps the pilot simple; every target student has a uni Google account
- Automated face detection/verification — manual review is sufficient at pilot scale
- In-app matching, browsing, or chat — matching is done manually by the team during the pilot
- Admin review dashboard — team reviews photos/profiles directly in Supabase for now
- Notifications about acceptance/rejection — handled manually via email during the pilot
- Returning-user profile editing — v1 ends at confirmation + next-steps per the MVP design; edit deferred to v2
- Charging the saved card — v1 saves a payment method via Stripe SetupIntent only; the actual per-date charge is done later/manually and deferred to v2

## Context

- Next.js 16 (App Router) + React 19 + Tailwind CSS 4, deployed via Vercel auto-deploy from `main` to campus-crush.org
- `@supabase/supabase-js` v2 already a dependency; existing tables for waitlist and venue partnerships
- **Supabase is not reachable from this environment via MCP** — all schema changes are written as SQL files in `supabase/` for the user to run in the Supabase dashboard (existing pattern: `founding-member.sql`, `venues.sql`)
- Google OAuth must be configured in the Supabase dashboard + Google Cloud Console by the user (redirect URLs, client ID/secret) — code can only assume it exists
- Uni domain restriction cannot be enforced in Google OAuth config across five institutions; enforce after sign-in (check email domain, reject/sign-out non-matching accounts)
- Free-text interests mean "match with similar interests" is a manual/fuzzy judgement by the team, not exact matching — acceptable for the pilot
- Playwright is set up for tests; dev server runs on PORT=3002 (Turbopack doesn't hot-reload globals.css — restart after CSS edits)

## Constraints

- **Tech stack**: Next.js App Router + Supabase (Auth, Storage, Postgres) — already in use, no new backend infrastructure
- **Database access**: SQL migrations delivered as files in `supabase/` for manual execution — no direct DB access from this environment
- **Security**: Photos bucket must be private; profiles table must have RLS so users can only read/write their own row
- **Safety**: Face-photo requirement and warning copy are mandatory in the onboarding form
- **Compatibility**: Must not disturb the existing landing page, waitlist, or partnerships features

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Google-only auth via Supabase Auth | Every target student has a uni Google account; least friction | — Pending |
| Uni-domain allowlist enforced server-side post-sign-in | Google OAuth config can't restrict to five external domains | — Pending |
| Private Supabase Storage bucket + manual photo review | Pilot scale makes manual review viable; avoids ML complexity | — Pending |
| Dedicated `profiles` table separate from waitlist | User's explicit requirement; clean separation of concerns | — Pending |
| Next-14-days rolling availability dates | No admin work; always relevant during pilot | — Pending |
| Free-text interest tags | User preference for expressiveness over computability | — Pending |
| Conditional payment gated on `waitlist.founding_member` | Founding members promised free; reuse the existing waitlist tag rather than a new eligibility system | — Pending |
| Stripe SetupIntent (save card, charge later) not immediate charge | Design says "nothing charged until you're set up on a date"; avoids webhooks for the pilot | — Pending |
| v1 flow follows `specs/MVP design .png` | Client-provided mockup is the source of truth for the screen flow | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-03 after initialization*
