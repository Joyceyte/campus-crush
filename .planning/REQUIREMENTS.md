# Requirements: Campus Crush — User Accounts & Onboarding Profiles

**Defined:** 2026-08-03
**Core Value:** A student can sign in with Google and submit a complete, safety-reviewed dating profile that gives the team everything needed to match them for a food date during the pilot.

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

### Onboarding Form

- [ ] **FORM-01**: New signed-in user without a profile is routed to the onboarding form; user with a completed profile is routed to their confirmation/edit view
- [ ] **FORM-02**: User can upload a face photo, with the safety notice that accounts whose photo doesn't clearly show their face will not be accepted
- [ ] **FORM-03**: User can enter profile basics: age, sex, height (cm dropdown), ethnicity
- [ ] **FORM-04**: User can enter free-text interest tags and select a dating intention
- [ ] **FORM-05**: User can select meal-time availability (Breakfast / Lunch / Dinner multi-select) and available dates from the next 14 rolling days (multi-select), with copy noting more availability = more likely to get a date
- [ ] **FORM-06**: User can set match preferences: interested in (women/men/other), age range, ethnicity (multi-select), height, and a "match with similar interests" checkbox (unticked = no preference)
- [ ] **FORM-07**: Form validates required fields (photo, age, sex, availability at minimum) with clear inline errors before submission
- [ ] **FORM-08**: Submitting saves photo + profile + preferences atomically to the user's own `profiles` row via a server action

### Post-Signup

- [ ] **POST-01**: After submitting, user lands on a confirmation page ("you're in — we'll match you soon")
- [ ] **POST-02**: User can return later to view and edit their saved profile (same form, pre-filled)

## v2 Requirements

### Moderation & Matching

- **MODR-01**: Admin review dashboard for approving/rejecting profile photos
- **MODR-02**: Automated client-side face-detection hint before photo submission
- **MODR-03**: Acceptance/rejection notification emails
- **MTCH-01**: In-app match display and date confirmation

## Out of Scope

| Feature | Reason |
|---------|--------|
| Email/password or magic-link auth | Google-only keeps pilot simple; all target students have uni Google accounts |
| Automated face verification | Manual review viable at pilot scale; avoids ML complexity |
| In-app matching, browsing, chat | Team matches manually during pilot |
| Admin dashboard | Team reviews photos/profiles directly in Supabase dashboard |
| Draft auto-save mid-form | Single-sitting form is acceptable for pilot; row-existence = completion signal keeps routing simple |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| (populated during roadmap creation) | | |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 0
- Unmapped: 20 ⚠️ (roadmap pending)

---
*Requirements defined: 2026-08-03*
*Last updated: 2026-08-03 after initial definition*
