---
phase: 01-supabase-auth-foundation
plan: 02
subsystem: database
tags: [postgres, supabase, rls, storage, sql]

# Dependency graph
requires:
  - phase: 01-supabase-auth-foundation (plan 01)
    provides: "@supabase/ssr client wrappers + middleware session refresh (parallel, not a hard dependency for this plan)"
provides:
  - "public.profiles table keyed to auth.users(id), wide enough for every Phase 3 onboarding field"
  - "Owner-only RLS (select/insert/update) on public.profiles using the planner-cached (select auth.uid()) = id form"
  - "Four DATA-05 payment/eligibility columns on profiles (is_founding_member, payment_required, stripe_customer_id, stripe_payment_method_id)"
  - "Private 'photos' storage bucket with four owner-scoped storage.objects RLS policies keyed on the {userId}/ folder prefix"
affects: [phase-3-onboarding, phase-3-payments, plan-01-03-manual-execution]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Owner-only RLS via (select auth.uid()) = id (planner-cached initPlan form)"
    - "Per-user storage RLS via (storage.foldername(name))[1] matched against (select auth.uid())::text"
    - "SQL files shipped to supabase/ for manual execution in the Supabase SQL editor (no direct DB access from this environment)"

key-files:
  created:
    - supabase/profiles.sql
    - supabase/photos-storage.sql
  modified: []

key-decisions:
  - "profiles.id is uuid primary key references auth.users(id) on delete cascade (not gen_random_uuid()) — deliberate deviation from the venues.sql table-creation pattern, required by DATA-01"
  - "photos bucket created with public = false (private) — deliberate deviation from venues.sql's public = true bucket, required by DATA-03 and CLAUDE.md's 'never public bucket for face photos' rule"
  - "Four DATA-05 payment/eligibility columns (is_founding_member, payment_required, stripe_customer_id, stripe_payment_method_id) added to the wide profiles schema now, all nullable, so no follow-up migration is needed when Phase 3 wires up Stripe"

patterns-established:
  - "Owner-only RLS pattern: exactly one select/insert/update policy per table, each wrapping auth.uid() in a (select ...) subquery"
  - "Per-user storage path convention: objects live under {userId}/filename so storage.foldername(name)[1] resolves to the owning uid"

requirements-completed: [DATA-01, DATA-02, DATA-03, DATA-04, DATA-05]

# Metrics
duration: 8min
completed: 2026-08-03
status: complete
---

# Phase 01 Plan 02: Profiles Table + Private Photo Bucket Summary

**Wide `public.profiles` table (keyed to `auth.users.id`, owner-only RLS, plus the four DATA-05 Stripe/eligibility columns) and a private `photos` storage bucket with four owner-scoped `storage.objects` policies, shipped as two runnable `.sql` files.**

## Performance

- **Duration:** ~8 min
- **Completed:** 2026-08-03
- **Tasks:** 2/2
- **Files modified:** 2 (both new)

## Accomplishments
- `supabase/profiles.sql`: dedicated, wide `public.profiles` table keyed to `auth.users(id) on delete cascade`, covering every Phase 3 onboarding field (photo path, demographics, interests, dating intention, meal availability, 14-day availability, match preferences) plus the four DATA-05 payment/eligibility columns, with exactly three owner-only RLS policies (select/insert/update) using the planner-cached `(select auth.uid()) = id` form.
- `supabase/photos-storage.sql`: private `photos` storage bucket (`public = false`) with four owner-scoped `storage.objects` policies (insert/select/update/delete), each guarded by `bucket_id = 'photos'` and matching `(storage.foldername(name))[1]` against `(select auth.uid())::text`.
- Both files are idempotent (`create table if not exists`, `on conflict (id) do nothing`) and match the existing `venues.sql`/`founding-member.sql` header-comment + manual-execution convention.

## Task Commits

Each task was committed atomically:

1. **Task 1: Write supabase/profiles.sql** - `f2885fa` (feat)
2. **Task 2: Write supabase/photos-storage.sql** - `b2cdcb5` (feat)

**Plan metadata:** committed alongside this summary (see final commit)

## Files Created/Modified
- `supabase/profiles.sql` - Dedicated wide `profiles` table + owner-only RLS + DATA-05 payment columns
- `supabase/photos-storage.sql` - Private `photos` bucket + four owner-scoped storage RLS policies

## Decisions Made
- Deviated from `venues.sql`'s `gen_random_uuid()` primary key: `profiles.id` references `auth.users(id) on delete cascade`, per DATA-01.
- Deviated from `venues.sql`'s public bucket (`public = true`): `photos` bucket is `public = false`, per DATA-03 and CLAUDE.md.
- Added the four DATA-05 payment/eligibility columns (all nullable, populated server-side in Phase 3) on top of the RESEARCH.md DDL, per the plan's Task 1 instruction and CONTEXT.md's Claude's Discretion note.

## Deviations from Plan

None - plan executed exactly as written. The four DATA-05 payment columns were explicitly called for in the plan's Task 1 `<action>` (not a deviation — a planned layer-in on top of the RESEARCH.md base DDL).

## Issues Encountered

None.

## User Setup Required

None this plan — both `.sql` files are written but not yet applied. Manual execution against the live Supabase project (via the SQL editor) happens in plan 01-03, along with the two-account RLS verification test and the public-URL-unreachable proof for the photos bucket.

## Next Phase Readiness
- `supabase/profiles.sql` and `supabase/photos-storage.sql` are ready for a human to paste into the Supabase SQL editor in plan 01-03.
- No follow-up migration will be needed when Phase 3 builds the onboarding form or wires up Stripe — every field and payment column already exists in the schema.
- Neither `supabase/venues.sql`, `supabase/founding-member.sql`, nor `lib/supabase.ts` were touched.

---
*Phase: 01-supabase-auth-foundation*
*Completed: 2026-08-03*

## Self-Check: PASSED
- FOUND: supabase/profiles.sql
- FOUND: supabase/photos-storage.sql
- FOUND: f2885fa (Task 1 commit)
- FOUND: b2cdcb5 (Task 2 commit)
