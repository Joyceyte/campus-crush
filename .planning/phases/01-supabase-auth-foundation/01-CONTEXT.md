# Phase 1: Supabase Auth Foundation - Context

**Gathered:** 2026-08-03
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — smart discuss skipped)

<domain>
## Phase Boundary

The technical foundation for secure, per-user profile data exists — Supabase clients, session-refreshing middleware, and a private, RLS-protected `profiles` table and photo storage bucket are in place and verified.

Delivers:
- `@supabase/ssr`-based client wrappers (browser, server, middleware) compatible with Next.js 16 async `cookies()`
- Root `middleware.ts` that refreshes the session cookie on every request
- `supabase/*.sql` migration file(s) creating the `profiles` table keyed to `auth.users.id` with owner-only RLS — the table includes all Phase 3 onboarding fields AND payment/eligibility columns (`is_founding_member`, `payment_required`, `stripe_customer_id`, `stripe_payment_method_id`) per DATA-05
- `supabase/*.sql` creating a private photos storage bucket with per-user (`{userId}/`) owner-scoped storage RLS

Does NOT deliver: sign-in UI, OAuth flow, domain gating (Phase 2), onboarding form (Phase 3).

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Use ROADMAP success criteria, REQUIREMENTS (DATA-01..04), and CLAUDE.md stack guidance:
- `@supabase/ssr` ^0.12.4 (never deprecated auth-helpers)
- `supabase.auth.getUser()` for authorization decisions, never `getSession()`
- `(select auth.uid())` wrapped pattern in RLS policies (planner-cached)
- Private bucket + owner-scoped storage RLS + signed URLs; never public bucket for face photos
- Profiles table schema must cover all Phase 3 form fields (photo path, age, sex, height, ethnicity, interests, dating intention, meal availability, 14-day dates, match preferences) so no follow-up migration is needed mid-milestone
- **Payment/eligibility columns (DATA-05)** — the `profiles` table MUST also include, from the start: `is_founding_member boolean` (snapshot of eligibility at onboarding), `payment_required boolean`, `stripe_customer_id text` (nullable), and `stripe_payment_method_id text` (nullable). These support the Phase 3 conditional Stripe step (founding members from the `waitlist` table are free; everyone else saves a card via SetupIntent). No charge logic in Phase 1 — columns only.
- **Founding-member eligibility source:** the existing `public.waitlist` table already has a `founding_member boolean` column (see `supabase/founding-member.sql`) and an `email` column (lowercased, unique). Phase 3 will read it; Phase 1 does not modify `waitlist`. Note this dependency in the profiles SQL header comment so the reviewer understands the cross-table relationship.
- Stripe secret/publishable keys are configured manually by the user (env + dashboard), like Google OAuth — Phase 1 does not need them, but the profiles columns must exist for Phase 3.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/supabase.ts` — existing plain browser client (`createClient` from `@supabase/supabase-js`) using `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`; used by the waitlist. Must keep working (compatibility constraint).
- `supabase/founding-member.sql`, `supabase/venues.sql` — established SQL-file delivery pattern: explanatory header comment ("Run this in the Supabase SQL editor"), `create table if not exists`, `alter table … enable row level security`, named policies, `insert into storage.buckets … on conflict (id) do nothing`.

### Established Patterns
- Env vars already configured in `.env.local` and Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Next.js 16.2.9 App Router, React 19.2.4, TypeScript, Tailwind 4. `@supabase/supabase-js` ^2.108.2 (needs lockfile bump to ≥2.111.0 when adding `@supabase/ssr`).
- No `middleware.ts` exists yet — greenfield.
- Dev server: PORT=3002; Playwright configured for tests.

### Integration Points
- New SSR clients live alongside `lib/supabase.ts` (e.g. `lib/supabase/` directory with `client.ts`, `server.ts`, `middleware.ts` helpers) without breaking the waitlist import.
- Root `middleware.ts` at repo root (Next.js App Router convention).
- New SQL files join `supabase/` as e.g. `profiles.sql` (table + RLS) and photo bucket setup — user runs them manually in the Supabase dashboard (no direct DB access from this environment).

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
