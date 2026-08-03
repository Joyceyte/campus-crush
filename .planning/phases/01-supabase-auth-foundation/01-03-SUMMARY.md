---
phase: 01-supabase-auth-foundation
plan: 03
type: execute
status: deferred
completed_tasks: 0
total_tasks: 2
---

# Plan 01-03 Summary — Apply schema & verify (DEFERRED)

**Status: DEFERRED to the user / carried into Phase 2.** This plan is two human-only checkpoints (this environment has no Supabase DB access — no MCP, no `supabase db push`, no connection string). Per the user's decision (2026-08-03), building continued to Phase 2 rather than blocking on the manual apply.

## What is ready
- `supabase/profiles.sql` and `supabase/photos-storage.sql` are written, committed (plan 01-02), and grep-verified (RLS enabled, 3 owner-only profile policies, 4 owner-scoped storage policies, `(select auth.uid()) = id` form, private bucket `public=false`, all 4 DATA-05 payment columns).

## Outstanding manual steps (user)
1. **Apply** `supabase/profiles.sql` then `supabase/photos-storage.sql` in the Supabase dashboard SQL editor.
2. **Confirm** (query provided to the user): `profiles` RLS enabled, the 4 payment columns present, `storage.buckets` row for `photos` has `public = false`.
3. **Two-account RLS proof** — deferred to the end of Phase 2. Rationale: `profiles.id` has a FK to `auth.users(id)`, so a genuine cross-user test needs two real signed-in accounts, which do not exist until Google sign-in (Phase 2) is built. Impersonating non-existent UUIDs would fail the FK and prove nothing.

## Verification carried forward
- **DATA-02** (two-account owner-only RLS proof) → verify at end of Phase 2 with two real Google accounts.
- **DATA-03** (photo bucket unreachable via public URL) → verify once a photo is uploaded (Phase 3), or immediately via the Storage UI public-URL check after apply.
- **DATA-05** (payment columns present) → confirmable now via the provided query.

**Blocker recorded in STATE.md:** apply Phase 1 SQL + run the two-account RLS proof before go-live.
