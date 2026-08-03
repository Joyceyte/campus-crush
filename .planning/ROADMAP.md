# Roadmap: Campus Crush — User Accounts & Onboarding Profiles

## Overview

This milestone bolts a real auth-and-profile system onto the existing Next.js marketing site. It starts with the invisible-but-highest-risk foundation (Supabase clients, session middleware, RLS-protected `profiles` table, private photo bucket), then builds the visible sign-in flow with a server-enforced university-domain gate and the routing logic that sends students to the right screen. With auth solid, the milestone delivers the actual value proposition — a multi-step onboarding form covering profile, interests, availability, and match preferences, with a required face photo — and closes with the confirmation and edit experience so a student always has a place to land after submitting and can update their answers later.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Supabase Auth Foundation** - Session-refreshing clients, middleware, and an RLS-protected profiles table + private photo bucket exist and are verified
- [ ] **Phase 2: Google Sign-In, Domain Gate & Protected Routing** - Students sign in with their uni Google account, non-partner emails are rejected, and users land on the right onboarding/profile screen
- [ ] **Phase 3: Onboarding Form & Photo Upload** - New students complete a full profile — face photo, demographics, interests, availability, preferences — in one sitting
- [ ] **Phase 4: Confirmation & Profile Edit** - Students see confirmation after submitting and can return anytime to view and update their saved profile

## Phase Details

### Phase 1: Supabase Auth Foundation
**Goal**: The technical foundation for secure, per-user profile data exists — Supabase clients, session-refreshing middleware, and a private, RLS-protected `profiles` table and photo storage bucket are in place and verified.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. The `profiles` table exists in Supabase, keyed to `auth.users.id`, with RLS enabled — a two-account test confirms a user can read and write only their own row
  2. A private Supabase Storage bucket exists for profile photos, scoped per-user (`{userId}/`), and is confirmed unreachable via public URL
  3. Supabase browser/server/middleware client wrappers and a root `middleware.ts` are in place, refreshing the session cookie on every request
  4. All schema, RLS, and storage changes exist as runnable `.sql` files in `supabase/`, matching the existing manual-execution pattern (`founding-member.sql`, `venues.sql`)
**Plans**: TBD

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
**Plans**: TBD
**UI hint**: yes

### Phase 3: Onboarding Form & Photo Upload
**Goal**: A new student can complete a full onboarding profile in one sitting — face photo, demographics, interests, dating intention, availability, and match preferences — with clear validation and safety copy, saved atomically to their profile.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: FORM-02, FORM-03, FORM-04, FORM-05, FORM-06, FORM-07, FORM-08
**Success Criteria** (what must be TRUE):
  1. User can upload a required face photo (with the safety notice that non-face photos won't be accepted) and enter profile basics: age, sex, height (cm dropdown), ethnicity
  2. User can enter free-text interest tags, select a dating intention, and select meal-time (B/L/D) plus rolling 14-day availability, with "more availability = more likely to get a date" copy
  3. User can set match preferences: interested in (women/men/other), age range, ethnicity (multi-select), height, and a "match with similar interests" checkbox (unticked = no preference)
  4. Required fields (photo, age, sex, availability) show clear inline errors before submission; submitting saves photo + profile + preferences atomically to the user's own `profiles` row via a server action
**Plans**: TBD
**UI hint**: yes

### Phase 4: Confirmation & Profile Edit
**Goal**: After completing onboarding, a student sees confirmation that they're in the pilot, and can return anytime to view and update their saved profile.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: POST-01, POST-02
**Success Criteria** (what must be TRUE):
  1. After submitting the onboarding form, the user lands on a confirmation page ("you're in — we'll match you soon")
  2. A returning user sees their saved profile pre-filled in the same form and can edit and re-save any field
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Supabase Auth Foundation | 0/TBD | Not started | - |
| 2. Google Sign-In, Domain Gate & Protected Routing | 0/TBD | Not started | - |
| 3. Onboarding Form & Photo Upload | 0/TBD | Not started | - |
| 4. Confirmation & Profile Edit | 0/TBD | Not started | - |
