# Project Research Summary

**Project:** Campus Crush — user accounts & onboarding milestone
**Domain:** Supabase Auth (Google OAuth) + profile onboarding + private photo storage, added to an existing Next.js 16 App Router marketing site, for a manual-matching university food-date pilot
**Researched:** 2026-08-03
**Confidence:** MEDIUM

## Executive Summary

This milestone bolts a real auth-and-profile system onto an otherwise-static Next.js marketing site: Google sign-in restricted to five university email domains, a multi-step onboarding form (profile, preferences, availability), a private face-photo upload, and returning-user routing between "resume onboarding" and "view/edit profile." All four research passes converge on the modern, actively-maintained `@supabase/ssr` package (never the deprecated `auth-helpers-nextjs`) as the integration layer, with three distinct Supabase client instances (browser, server, middleware) and `getUser()` — never `getSession()` — as the only trustworthy server-side authorization check. Because Campus Crush is explicitly a manual-matching pilot (no in-app swipe/browse), the feature scope is deliberately narrower than a real dating app: one required face photo (not a gallery), free-text chip interests (not a taxonomy), and no automated verification — all consistent with the architecture and pitfalls research.

The single highest-leverage risk across all four documents is data exposure: Row Level Security on `profiles` and `storage.objects` is off by default in Supabase, fails *silently* (empty results, not errors) when misconfigured, and a real CVE (CVE-2025-48757, May 2025) shows this exact failure mode has already leaked sensitive data from 170+ production apps. Given `profiles` will hold face photos, ethnicity, and dating-intention-adjacent fields for university students, RLS correctness is the non-negotiable center of this milestone and must be verified with two real (non-service-role) user accounts, not assumed from a table-owner test.

The second load-bearing risk is the university-domain allowlist, which cannot be enforced at the Google OAuth provider level (Google's domain restriction only supports one Workspace org, not five unrelated universities). STACK.md and PITFALLS.md recommend a database-level "Before User Created" Postgres hook/trigger as the real, unbypassable gate (a client- or route-handler-only check can be worked around via direct API calls with a valid non-partner session). ARCHITECTURE.md instead recommends enforcing the check in `app/auth/callback/route.ts` immediately after `exchangeCodeForSession`, for a friendlier in-app error page and simpler debugging (a DB trigger can only raise a generic 500-style GoTrue error). The reconciled recommendation for this project: enforce in the callback route as the primary UX-friendly gate (immediate `signOut()` + friendly redirect on domain mismatch), and add the Postgres "Before User Created" hook as defense-in-depth so the check can never be bypassed by hitting the Supabase API directly — see "Gaps to Address" below for how the roadmap should sequence this.

## Key Findings

### Recommended Stack

Add `@supabase/ssr` (`^0.12.4`) as the only new runtime dependency; the project's existing `@supabase/supabase-js` (`^2.108.2`) already satisfies its peer-dependency range and just needs a lockfile bump. No form library, state manager, or file-uploader package is needed — native `<form>` + Server Actions handle the multi-step onboarding form and single photo upload at this scale. All schema/RLS/storage-policy changes ship as `.sql` files in `supabase/` (matching the existing `founding-member.sql`/`venues.sql` pattern) for the user to run manually in the Supabase dashboard, since this environment has no direct DB access.

**Core technologies:**
- `@supabase/ssr` (^0.12.4): cookie-based Supabase client for Server Components/Route Handlers/Server Actions/Middleware — the modern replacement for the deprecated `auth-helpers-nextjs` family
- `@supabase/supabase-js` (already present): underlying auth/storage/postgrest client — no role change, just a version bump
- Next.js `middleware.ts`: refreshes the session cookie on every request (Server Components can't mutate cookies) — skipping this is the #1 cause of random-logout bugs across every source reviewed

### Expected Features

Campus Crush's onboarding is architecturally simpler than Tinder/Hinge/Bumble because matching is manual and off-platform — no swipe/browse/discovery surface exists or should be built. Competitor patterns are useful for form UX and photo-guidance conventions only.

**Must have (table stakes):**
- Auth gate before onboarding, server-enforced domain allowlist (not just client-side)
- Multi-step form with visible progress, back/forward navigation, inline validation
- Single required face photo with explicit "no hats/sunglasses/group shots" guidance copy
- Auto-save/resume across steps (cuts abandonment up to 30% per research); returning-user routing (complete → confirmation/edit, incomplete → resume)
- Confirmation page after submit; profile editing reusing onboarding components
- Preferences section (interested-in, age range, ethnicity multi-select, height, "match similar interests")

**Should have (competitive/differentiator):**
- Availability-specific completion-incentive copy ("more availability = more matches") tied directly to the pilot's success metric
- Chip/tag free-text interest input (not a fixed taxonomy)
- Rolling 14-day availability calendar with B/L/D multi-select — the most novel UI surface in the milestone, closer to a scheduling tool than any dating-app pattern; flag for its own UI-SPEC

**Defer (v2+):**
- Multi-photo gallery, automated face/liveness verification, structured interest taxonomy, in-app match notifications, admin review dashboard — all explicitly out of scope per PROJECT.md and inconsistent with the manual-review-at-pilot-scale model

Note: ARCHITECTURE.md recommends *against* a separate `profile_status` field, using profile-row existence itself as the routing signal (simpler schema, no trigger to maintain) since the form is submitted as one atomic unit rather than progressively saved — this is a lighter-weight take on FEATURES.md's suggested `profile_status` enum and should be resolved during phase planning (see Gaps).

### Architecture Approach

The existing marketing site (`/`, `/blog`, `/contact`, waitlist/venues API routes) stays untouched, using the existing `lib/supabase.ts` anon-key singleton. New auth/profile code is additive: three flat `lib/supabase-{browser,server,middleware}.ts` files (not a `lib/supabase/` folder, to avoid module-resolution ambiguity with the existing `supabase.ts`), a root `middleware.ts` for cheap session refresh + signed-in gating, `app/auth/callback/route.ts` as the single PKCE-exchange-and-domain-check enforcement point, and an `app/(protected)/` route group wrapping `onboarding/` and `profile/` pages behind a shared `layout.tsx` that re-verifies `getUser()`.

**Major components:**
1. `middleware.ts` + `lib/supabase-middleware.ts` — refreshes the session cookie and does a cheap "signed in or not" redirect; explicitly not the authorization boundary and never queries `profiles`
2. `app/auth/callback/route.ts` — exchanges the OAuth code, checks the email against `lib/uni-domains.ts` (shared with the existing waitlist route), signs out and redirects on mismatch
3. `app/(protected)/onboarding/` and `app/(protected)/profile/` — Server Components that branch on profile-row existence to route between onboarding and confirmation/edit views; `actions.ts` re-derives `user.id` server-side (never trusts client input) and handles the photo upload + profile upsert in one Server Action
4. `supabase/profiles.sql` and `supabase/profile-photos-storage.sql` — table, RLS policies, private bucket, and storage.objects policies, delivered as manually-run SQL files matching the existing pattern

### Critical Pitfalls

1. **RLS fails silently and is off by default** — an empty result looks identical whether it means "no data" or "no access"; a missing INSERT policy or an accidentally-open SELECT policy (the exact CVE-2025-48757 pattern, 170+ apps affected) can go unnoticed until support tickets pile up or data leaks. Enable RLS in the same migration that creates `profiles`, test all four CRUD ops with two distinct real user JWTs, never just the service-role key.
2. **`getSession()` used for authorization** — reads an unverified cookie; use `getUser()` (or `getClaims()`) everywhere a page, route, or write is gated.
3. **Domain allowlist enforced only client-side or only in app code** — bypassable via direct Supabase REST/JS API calls with a valid non-partner-domain session, since Google can't restrict OAuth to five unrelated institution domains. Needs a database-level gate, not just a friendly redirect.
4. **Private photo bucket misconfigured, or `getPublicUrl()` used on a private bucket** — either silently breaks manual review (403s) or, worse, if the bucket is accidentally public, makes every student's face photo world-readable. Verify `public: false` explicitly; use `createSignedUrl()` server-side only.
5. **Production OAuth redirect/Site URL never updated** — this app auto-deploys to production on every push to `main`, so a localhost-only-tested redirect config breaks sign-in live with no staging gate to catch it; must be an explicit go-live checklist item in both Google Cloud Console and the Supabase dashboard.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Supabase Auth Foundation (clients + middleware + schema)
**Rationale:** Nothing else can be built or tested without the three Supabase client wrappers, and RLS is the highest-cost-to-fix-later piece — get it right before any write-path code exists.
**Delivers:** `lib/supabase-browser.ts`, `lib/supabase-server.ts`, `lib/supabase-middleware.ts`, root `middleware.ts`, `supabase/profiles.sql` (table + RLS, all 4 CRUD policies, `(select auth.uid())` wrapped), `supabase/profile-photos-storage.sql` (private bucket + storage.objects RLS)
**Addresses:** Auth gate table-stakes feature; underpins every downstream feature
**Avoids:** Pitfall 1 (`getSession()` misuse), Pitfall 2 (middleware cookie-drop), Pitfall 4 (silent RLS failure/CVE-2025-48757 pattern), Pitfall 5 (unwrapped `auth.uid()`)

### Phase 2: Google Sign-In + Domain-Gated Callback
**Rationale:** Depends on Phase 1's clients; is the second-highest-risk surface (domain bypass) and should be built and hardened before any onboarding UI exists to gate.
**Delivers:** Sign-in entry point, `app/auth/callback/route.ts` with `exchangeCodeForSession` + `lib/uni-domains.ts` allowlist check + friendly rejection page; recommend layering in the Postgres "Before User Created" hook here too as defense-in-depth (see Gaps)
**Addresses:** Server-enforced domain allowlist (table stakes, safety/business requirement)
**Avoids:** Pitfall 3 (PKCE double-consumption/route mismatch), Pitfall 6 (client-only domain check), Pitfall 8 (prod redirect/Site URL not updated — flag as this phase's go-live checklist item)

### Phase 3: Protected Routing (onboarding vs. profile states)
**Rationale:** Depends on Phase 1 (table must exist) and Phase 2 (need a way to arrive signed in); establishes the three routing states (signed out / no profile / has profile) as independently testable before the real form exists.
**Delivers:** `app/(protected)/layout.tsx` (auth re-check), stub `onboarding/page.tsx` and `profile/page.tsx` with redirect logic based on profile-row existence
**Addresses:** Returning-user routing table-stakes feature
**Uses:** ARCHITECTURE.md's Pattern 3 (profile-row existence as the routing signal)

### Phase 4: Onboarding Form + Photo Upload
**Rationale:** Depends on Phases 1–3; this is the actual value proposition of the milestone and the largest UI surface, including the novel 14-day availability picker.
**Delivers:** Multi-step `OnboardingForm.tsx` (profile/availability/preferences sections), `actions.ts` Server Action combining photo upload + profile upsert, `next.config` `serverActions.bodySizeLimit` raise (easy-to-miss required config)
**Addresses:** Multi-step form, photo upload + safety copy, chip interests, availability picker, auto-save/resume, preferences section
**Avoids:** Pitfall 7 (public bucket/`getPublicUrl()` misuse), Anti-Pattern 1 (trusting client-submitted user id)

### Phase 5: Confirmation & Profile Edit View
**Rationale:** Depends on Phase 4 (reuses the same form component in edit mode); last because it needs a real submitted profile to edit against.
**Delivers:** Confirmation page copy, `profile/page.tsx` edit mode pre-filled from the saved row, signed-URL photo display (`createSignedUrl`, generated fresh server-side, never cached)
**Addresses:** Confirmation state, profile editing

### Phase Ordering Rationale

- Dependency-driven: clients → schema/RLS → auth callback → routing skeleton → form → edit view mirrors ARCHITECTURE.md's "Suggested Build Order" almost exactly, and each phase is independently verifiable (auth plumbing with a fake/no session, routing with an empty table, form/edit with real submitted data).
- Security-critical pieces (RLS, domain allowlist) are front-loaded into Phases 1–2 rather than bolted on later, per PITFALLS.md's guidance that RLS and domain-gate fixes are far more expensive after real user data exists.
- FEATURES.md's chip-input and availability-picker components have no shared state and can be parallelized within Phase 4 if the roadmapper wants to split it into sub-plans.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Domain-gated callback):** Needs an explicit decision on the callback-route-vs-DB-hook tension (see Gaps below) before implementation — this determines whether a Postgres "Before User Created" hook SQL file is authored in Phase 1 or Phase 2, and whether the callback route is the sole gate or a secondary UX layer.
- **Phase 4 (Onboarding form + availability picker):** The 14-day rolling availability grid has no direct competitor precedent (closer to Calendly than any dating app); FEATURES.md flags it as warranting its own UI-SPEC.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Auth foundation):** `@supabase/ssr` client setup is Supabase's own well-documented, stable pattern.
- **Phase 3 (Protected routing):** Standard Server Component redirect-based routing, not dating-specific.
- **Phase 5 (Confirmation/edit):** Reuses Phase 4's form component; signed-URL pattern is well-documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Core `@supabase/ssr` patterns cross-checked against official Supabase docs + npm registry data (HIGH-confidence primary source for versions); no context7/MCP docs access this pass |
| Features | MEDIUM | Dating-app UX conventions well-sourced from multiple independent guides; matching-specific internals (Tinder/Hinge/Bumble proprietary) inferred, not verified |
| Architecture | MEDIUM | `@supabase/ssr` App Router pattern is stable/documented; project-specific file layout is an opinionated recommendation, not verified against this exact codebase running |
| Pitfalls | MEDIUM | Cross-checked against Supabase's own docs/discussions and a real CVE (CVE-2025-48757); no official Context7 docs queried this pass |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Domain-allowlist enforcement layer (callback route vs. DB hook) is unresolved between documents.** STACK.md and PITFALLS.md want a Postgres "Before User Created" hook/trigger as the real, unbypassable gate (a client- or single-route check can be worked around via direct API calls with a valid non-partner session). ARCHITECTURE.md wants callback-route-only enforcement for a friendlier UX (a DB trigger can only raise a generic error, not a nice redirect) and explicitly argues against a trigger on cost/UX grounds. **Recommended resolution for roadmap:** implement the callback-route check first (Phase 2, ships the friendly UX and the safety requirement immediately), and treat the DB-level hook as a fast-follow hardening task in the same phase or immediately after — the roadmapper should decide whether it's in-scope for the initial milestone or explicitly deferred with a documented risk acceptance (a rejected account's `auth.users` row is created either way; the real risk is a non-partner account reaching the `profiles` table, which RLS should independently prevent since the row is never created if the callback signs out immediately — verify this reasoning holds before deferring the trigger).
- **`profile_status` field vs. row-existence-as-signal is unresolved.** FEATURES.md assumes an explicit `not_started`/`in_progress`/`complete` field to support auto-save/resume; ARCHITECTURE.md recommends against a status field, treating profile-row existence as sufficient and explicitly scoping out draft-saving ("a user who abandons the form mid-fill loses their input on that visit — acceptable"). This directly affects whether auto-save/resume (a P1 table-stakes feature per FEATURES.md) is buildable as designed. Flag for `/gsd-discuss-phase` on Phase 4: confirm with the user whether cross-session draft persistence is actually required, since it changes the schema.
- **`serverActions.bodySizeLimit` config change** is a required but easy-to-miss `next.config` edit for the photo upload — explicitly called out in ARCHITECTURE.md as a build-order dependency; ensure Phase 4's plan includes it as an explicit step, not an assumption.

## Sources

### Primary (HIGH confidence)
- https://registry.npmjs.org/@supabase/ssr — version and peer-dependency data
- https://registry.npmjs.org/@supabase/supabase-js — version data
- https://registry.npmjs.org/@supabase/auth-helpers-nextjs — deprecation confirmation
- Project-local: `.planning/PROJECT.md`, `lib/supabase.ts`, `app/api/waitlist/route.ts`, `app/api/venues/route.ts`, `package.json`, existing `supabase/*.sql` files

### Secondary (MEDIUM confidence)
- https://supabase.com/docs/guides/auth/server-side/nextjs — official Server-Side Auth setup guide
- https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook — official hook docs
- https://supabase.com/docs/guides/storage/security/access-control — Storage RLS/access control
- https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv — `(select auth.uid())` pattern
- https://supabase.com/docs/guides/troubleshooting/how-to-migrate-from-supabase-auth-helpers-to-ssr-package-5NRunM
- https://vibeappscanner.com/supabase-row-level-security — CVE-2025-48757 breakdown
- https://dev.to/jordan_sterchele/why-your-supabase-data-is-exposed-and-you-dont-know-it-25fh
- Multiple independent dating-app UX sources (UX Design Institute, Appcues, DatingPro, FormAssembly, Growform, Material Design 3 chips guidance) — see FEATURES.md for full list

### Tertiary (LOW confidence)
- Community blog posts on middleware cookie-forwarding and PKCE double-fire issues — consistent across ≥3 independent sources, treated as corroborating

---
*Research completed: 2026-08-03*
*Ready for roadmap: yes*
