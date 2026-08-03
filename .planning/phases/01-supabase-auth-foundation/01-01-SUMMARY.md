---
phase: 01-supabase-auth-foundation
plan: 01
subsystem: auth
tags: [supabase, ssr, nextjs-middleware, cookies, jwt, getUser]

# Dependency graph
requires: []
provides:
  - "@supabase/ssr browser client factory (lib/supabase/client.ts)"
  - "Cookie-aware async Supabase server client factory (lib/supabase/server.ts)"
  - "Session-refresh middleware helper (lib/supabase/middleware.ts) + root middleware.ts"
  - "@supabase/supabase-js bumped to ^2.111.0 to satisfy @supabase/ssr peer dependency"
affects: [01-02-profiles-and-storage-sql, 01-03-end-to-end-rls-verification, phase-02-google-oauth-signin, phase-03-onboarding-profile-form]

# Tech tracking
tech-stack:
  added: ["@supabase/ssr@0.12.4"]
  patterns:
    - "Three-client Supabase SSR setup: browser (createBrowserClient), server (async createServerClient awaiting cookies()), middleware (createServerClient from request/response cookies)"
    - "getUser() (never getSession()) for any server-side identity/authorization decision"
    - "Root middleware.ts matcher excludes _next/static, _next/image, favicon.ico, and image extensions (svg/png/jpg/jpeg/gif/webp)"

key-files:
  created:
    - lib/supabase/client.ts
    - lib/supabase/server.ts
    - lib/supabase/middleware.ts
    - middleware.ts
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Task 1 package-legitimacy checkpoint pre-approved by orchestrator per CLAUDE.md's explicit stack mandate for @supabase/ssr ^0.12.4 and @supabase/supabase-js ^2.111.0 (documented [SUS] 'too-new' false positive in 01-RESEARCH.md) — no separate human approval step was blocking"
  - "lib/supabase.ts (existing waitlist client) left byte-for-byte untouched; new SSR clients live in a sibling lib/supabase/ directory with no filesystem naming collision"

patterns-established:
  - "Pattern 1 (three-client SSR setup): all Phase 2/3 Server Components, Server Actions, Route Handlers, and Client Components must use lib/supabase/{client,server}.ts factories, never a raw @supabase/supabase-js singleton, for anything touching auth or RLS-protected data"

requirements-completed: [DATA-02, DATA-03]

# Metrics
duration: 10min
completed: 2026-08-03
status: complete
---

# Phase 1 Plan 1: Supabase SSR Client Factories + Session Middleware Summary

**Three @supabase/ssr client factories (browser, server, middleware) plus a root middleware.ts that refreshes the session cookie via getUser() on every non-static request.**

## Performance

- **Duration:** ~10 min
- **Completed:** 2026-08-03T03:17:04Z
- **Tasks:** 3 (1 checkpoint pre-approved, 2 auto)
- **Files modified:** 6 (2 created client factories, 1 middleware helper, 1 root middleware, package.json + package-lock.json)

## Accomplishments
- Installed `@supabase/ssr@^0.12.4` and explicitly bumped `@supabase/supabase-js` from `^2.108.2` to `^2.111.0` (peer dependency), confirmed via `npm ls` that both resolved to the intended versions (not a silently-satisfied in-range version) — avoids RESEARCH.md Pitfall 1.
- Created `lib/supabase/client.ts` (`createClient()` → `createBrowserClient`) and `lib/supabase/server.ts` (`async createClient()` awaiting `cookies()` → `createServerClient` with try/catch-guarded `setAll`) — the two application-facing SSR client factories.
- Created `lib/supabase/middleware.ts` (`updateSession(request)`) and root `middleware.ts`, wiring the three-client cookie contract and calling `supabase.auth.getUser()` (never `getSession()`) to re-validate the JWT and trigger the session-cookie refresh, per DATA-02/DATA-03's threat mitigation.
- `npx tsc --noEmit` and `npm run build` both exit 0; `lib/supabase.ts` (existing waitlist client) confirmed unchanged via `git diff`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Verify @supabase/ssr + @supabase/supabase-js package legitimacy before install** - pre-approved by orchestrator (no code change, no commit — see Decisions Made)
2. **Task 2: Install @supabase/ssr, bump supabase-js, and create the browser + server client factories** - `b0c15f0` (feat)
3. **Task 3: Create the session-refresh middleware helper and root middleware.ts** - `ec1fa1a` (feat)

_Note: Task 1 is a human-verify checkpoint with no file changes; it was pre-approved per the orchestrator's `<checkpoint_preauthorization>` instruction citing CLAUDE.md's explicit stack mandate, so no separate commit exists for it._

## Files Created/Modified
- `lib/supabase/client.ts` - Browser Supabase client factory (`createBrowserClient`, anon key only)
- `lib/supabase/server.ts` - Async cookie-aware server client factory for Server Components/Actions/Route Handlers
- `lib/supabase/middleware.ts` - `updateSession()` helper: builds a request/response-cookie-aware client and calls `getUser()` to refresh the session
- `middleware.ts` - Root middleware wiring `updateSession()` with a matcher excluding static/image assets
- `package.json` / `package-lock.json` - Added `@supabase/ssr@^0.12.4`, bumped `@supabase/supabase-js` to `^2.111.0`

## Decisions Made
- **Task 1 checkpoint pre-approved, not re-litigated.** The orchestrator's prompt explicitly pre-authorized proceeding past the Task 1 `checkpoint:human-verify` gate, citing CLAUDE.md's "Recommended Stack" table which mandates these exact two packages as the official, non-deprecated Supabase SSR SDKs — RESEARCH.md's `[SUS]` flags for both packages are documented as a "too-new" heuristic false positive (6–25M weekly downloads, first-party `supabase` org repos, no postinstall scripts, no deprecation flag). Recorded here per the plan's instruction to document this checkpoint's disposition in the Summary.
- No other deviations — followed RESEARCH.md Pattern 1 verbatim for all four new files.

## Deviations from Plan

None - plan executed exactly as written (Task 1's checkpoint disposition is a pre-authorized process decision, not a deviation from the plan's deliverables).

## Issues Encountered
- `npm run build` surfaced a Next.js 16 informational deprecation notice: `The "middleware" file convention is deprecated. Please use "proxy" instead.` This is a non-blocking console warning only — the build still completed with exit 0, and the plan's artifact spec explicitly requires a file named `middleware.ts` (all grep-based acceptance criteria target that name). Renaming to `proxy.ts` would be an unplanned structural change outside this plan's scope; noted here for a future phase to consider once Next.js's "proxy" convention stabilizes and the project does a broader Next.js upgrade pass. Not fixed in this plan — out of scope per the scope boundary rule (pre-existing framework-level deprecation, not caused by this plan's logic).

## User Setup Required

None - no external service configuration required this plan. (The two SQL files for `profiles` table + storage bucket ship in plan 01-02; running them in the Supabase SQL Editor is that plan's user-setup step, not this one's.)

## Next Phase Readiness
- The application-side client/middleware spine (DATA-02/DATA-03 enforcement layer) is in place and builds cleanly. Plan 01-02 can now ship the SQL-side `profiles` table + RLS and `photos` storage bucket + RLS, and plan 01-03 can run the end-to-end two-account verification against a real signed-in session using these exact client factories.
- No blockers identified for 01-02 or 01-03.

---
*Phase: 01-supabase-auth-foundation*
*Completed: 2026-08-03*

## Self-Check: PASSED

All 5 created files exist on disk; both task commit hashes (b0c15f0, ec1fa1a) verified present in `git log --oneline --all`.
