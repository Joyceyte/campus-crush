# Phase 1: Supabase Auth Foundation - Research

**Researched:** 2026-08-03
**Domain:** Supabase Auth (SSR cookie-based sessions) + Postgres RLS + Storage RLS on Next.js App Router
**Confidence:** HIGH

## Summary

This phase is pure infrastructure: no UI, no OAuth flow, no onboarding form. It delivers three things — (1) `@supabase/ssr`-based browser/server/middleware client wrappers plus a root `middleware.ts` that refreshes the session cookie, (2) a `public.profiles` table keyed to `auth.users.id` with owner-only RLS, wide enough to hold every Phase 3 onboarding field so no later migration is needed, and (3) a private, per-user-scoped Storage bucket for face photos with matching `storage.objects` RLS. Everything ships as `.sql` files in `supabase/` per the project's existing manual-execution pattern (`founding-member.sql`, `venues.sql`) — there is no direct DB access from this environment.

The current project dependency (`@supabase/supabase-js@^2.108.2`) predates `@supabase/ssr`'s peer requirement (`^2.111.0`); both need a version bump. The deprecated `@supabase/auth-helpers-nextjs` family must not be used. The single highest-leverage correctness rule for this phase is: use `supabase.auth.getUser()` (never `getSession()`) anywhere a security decision is made server-side, because only `getUser()` round-trips to the Auth server to verify the JWT.

**Primary recommendation:** Add `@supabase/ssr@^0.12.4` alongside the existing `@supabase/supabase-js` (bumped to `^2.111.0`), create `lib/supabase/{client,server,middleware}.ts` following the standard three-client SSR pattern, add a root `middleware.ts` that calls the shared `updateSession()` helper, and ship two new SQL files (`supabase/profiles.sql`, `supabase/photos-storage.sql`) using the `(select auth.uid())`-wrapped RLS pattern throughout.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Supabase browser client (`lib/supabase/client.ts`) | Browser / Client | — | Used by future Client Components (sign-in button, form) for reads gated by RLS; no secrets exposed (anon key only) |
| Supabase server client (`lib/supabase/server.ts`) | Frontend Server (SSR) | — | Server Components, Server Actions, Route Handlers need a cookie-aware client to call `getUser()` and query `profiles`/storage with the user's own JWT |
| Session-refresh middleware (`middleware.ts`) | Frontend Server (SSR) | — | Only middleware can rewrite response cookies before a Server Component renders; this is the sole place token refresh can happen in the App Router |
| `profiles` table + RLS | Database / Storage | API / Backend | Postgres owns persistence and access control (RLS); the "API" in this stack is PostgREST via the Supabase client, not a hand-written backend |
| Photo storage bucket + RLS | Database / Storage | Frontend Server (SSR) | Storage objects and their RLS live in Postgres (`storage.objects`); reads/writes should be proxied through server-side code (Route Handler/Server Action) so the private bucket is never hit directly from an untrusted client path |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | `^0.12.4` [VERIFIED: npm registry] | Cookie-based Supabase client factory for Next.js SSR (browser/server/middleware) | Official replacement for the deprecated `@supabase/auth-helpers-*` family; only supported way to run Supabase Auth sessions in the App Router today |
| `@supabase/supabase-js` | `^2.111.0` [VERIFIED: npm registry] | Core Supabase client (`auth`, `storage`, `postgrest`) | Already a project dependency (`^2.108.2`); must be bumped to satisfy `@supabase/ssr`'s declared peer dependency (`^2.111.0`) [VERIFIED: npm registry] |
| Next.js Middleware (`middleware.ts`) | built into Next 16.2.9 (already installed) | Refreshes the session cookie on every request | Server Components cannot mutate cookies — skipping this is the most common cause of "randomly logged out" bugs across every SSR auth guide reviewed [CITED: supabase.com/docs/guides/auth/server-side/nextjs] |

### Supporting
None required for this phase. No form library, no uploader library — Phase 1 ships zero UI. (Native `<input type="file">` + Server Action upload and native form handling are called out in CLAUDE.md for Phase 3, not this phase.)

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `supabase.auth.getUser()` for server-side identity checks | `supabase.auth.getClaims()` | `getClaims()` can verify the JWT locally via WebCrypto (no network round-trip) *if* the project uses asymmetric (RSA/ECC) signing keys — new projects created after May 2025 default to this, but this project's key type is unconfirmed [ASSUMED]. `getUser()` is the safe default this phase; revisit `getClaims()` later once the project's JWT signing-key type is confirmed. |
| `text[]` columns for multi-select fields (interests, meal availability, available dates, preference-ethnicity) | `jsonb` column(s) | `jsonb` is more flexible for variable/nested shapes but adds parse overhead and loses simple `= ANY()` / `&&` array-operator queries; for flat multi-select lists at this scale, `text[]` is simpler and standard [CITED: supabase.com/docs/guides/database/json + community sources]. |
| Owner-only RLS via `(select auth.uid()) = id` | Postgres Row Security via a security-definer function | Unnecessary indirection for a simple one-row-per-user table; adds a function to audit for no benefit at this scale. |

**Installation:**
```bash
npm install @supabase/ssr@^0.12.4
npm install @supabase/supabase-js@^2.111.0
```

**Version verification:** Confirmed directly against the npm registry (`npm view <pkg> version`):
- `@supabase/ssr` → `0.12.4`, published 2026-07-28, peer dependency `@supabase/supabase-js@^2.111.0` [VERIFIED: npm registry]
- `@supabase/supabase-js` → `2.111.0`, published 2026-07-28 [VERIFIED: npm registry]
- `@supabase/auth-helpers-nextjs` → latest dist-tag `0.15.0`, flagged `deprecated: "Package no longer supported."` [VERIFIED: npm registry] — confirms this family must not be introduced.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `@supabase/ssr` | npm | latest version published 6 days before this research (2026-07-28); package itself has existed for years as the documented SSR solution | 6.27M/week | github.com/supabase/ssr | SUS (heuristic: "too-new") | **Approved** — see note below |
| `@supabase/supabase-js` | npm | latest version published 2026-07-28; package is Supabase's primary, multi-year-old JS SDK | 24.87M/week | github.com/supabase/supabase-js | SUS (heuristic: "too-new") | **Approved** — see note below |

**Note on the SUS verdicts:** The `package-legitimacy check` seam flagged both packages `too-new` because their *latest patch version* was published within the last ~6 days of this research date, not because the packages themselves are new or unvetted. Both have 6–25 million weekly downloads, long-lived first-party GitHub repos under the `supabase` org, no `deprecated` flag, and no `postinstall` script — the opposite profile of a slopsquat. This reads as a false positive of the "too-new" heuristic against a fast-shipping, actively-maintained official SDK rather than a genuine legitimacy risk. Per protocol, the planner should still add a lightweight `checkpoint:human-verify` before the `npm install` step (a quick "does `npm view @supabase/ssr` still resolve to the supabase org repo" glance is sufficient — no extended review warranted given the evidence above).

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** `@supabase/ssr`, `@supabase/supabase-js` (both — false-positive "too-new", approved with lightweight checkpoint per note above)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
No locked "Decisions" section exists for this phase — it is a pure infrastructure phase and CONTEXT.md places all implementation choices under Claude's Discretion (see below).

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Use ROADMAP success criteria, REQUIREMENTS (DATA-01..04), and CLAUDE.md stack guidance:
- `@supabase/ssr` ^0.12.4 (never deprecated auth-helpers)
- `supabase.auth.getUser()` for authorization decisions, never `getSession()`
- `(select auth.uid())` wrapped pattern in RLS policies (planner-cached)
- Private bucket + owner-scoped storage RLS + signed URLs; never public bucket for face photos
- Profiles table schema must cover all Phase 3 form fields (photo path, age, sex, height, ethnicity, interests, dating intention, meal availability, 14-day dates, match preferences) so no follow-up migration is needed mid-milestone

### Deferred Ideas (OUT OF SCOPE)
None.

### Existing Code Insights (also from CONTEXT.md, carried forward for the planner)
- `lib/supabase.ts` — existing plain browser client (`createClient` from `@supabase/supabase-js`) using `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`; used by the waitlist. Must keep working (compatibility constraint) — new SSR clients live alongside it (e.g. `lib/supabase/` directory), not replacing it.
- `supabase/founding-member.sql`, `supabase/venues.sql` — established SQL-file delivery pattern: explanatory header comment ("Run this in the Supabase SQL editor"), `create table if not exists`, `alter table … enable row level security`, named policies, `insert into storage.buckets … on conflict (id) do nothing`.
- Env vars already configured in `.env.local` and Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Next.js 16.2.9 App Router, React 19.2.4, TypeScript, Tailwind 4. No `middleware.ts` exists yet — greenfield.
- Dev server: `PORT=3002`; Playwright configured for tests.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | A dedicated `profiles` table (separate from waitlist/venues) stores one row per authenticated user, keyed to `auth.users.id` | See `supabase/profiles.sql` pattern in Code Examples — `id uuid primary key references auth.users(id) on delete cascade`, wide schema covering all Phase 3 fields |
| DATA-02 | `profiles` has RLS enabled; a user can read and write only their own row (verified with a two-account test) | See RLS Pattern in Architecture Patterns — `(select auth.uid()) = id` policies for select/insert/update, verified by the two-account manual test procedure below |
| DATA-03 | A private Supabase Storage bucket stores profile photos under `{userId}/`, with owner-scoped storage RLS; photos are never publicly accessible | See Storage RLS Pattern — `insert into storage.buckets (..., public) values (..., false)`, policies using `(storage.foldername(name))[1] = (select auth.uid())::text` |
| DATA-04 | All schema changes are delivered as SQL files in `supabase/` for manual execution in the Supabase dashboard | Matches existing `founding-member.sql`/`venues.sql` pattern; two new files: `supabase/profiles.sql`, `supabase/photos-storage.sql` |
</phase_requirements>

## Architecture Patterns

### System Architecture Diagram

```
Browser request (page load / navigation)
        │
        ▼
middleware.ts  ──────────────────────────────┐
  createServerClient(cookies from request)   │  refreshes session cookie
  await supabase.auth.getUser()              │  (writes Set-Cookie on response)
        │                                    │
        ▼                                    │
Next.js routing (Server Component / Route Handler / Server Action)
        │
        ▼
lib/supabase/server.ts createClient()  ── uses SAME refreshed cookies
        │
        ├──► supabase.auth.getUser()  ──► Supabase Auth server (JWT verified)
        │
        ├──► supabase.from('profiles').select()/.upsert()
        │        │
        │        ▼
        │     Postgres RLS: (select auth.uid()) = id
        │        → allows only the owning row through
        │
        └──► supabase.storage.from('photos').createSignedUrl(`${userId}/face.jpg`)
                 │
                 ▼
              storage.objects RLS: (storage.foldername(name))[1] = (select auth.uid())::text
                 → signed URL only issued/usable for the caller's own folder

Client Components (browser)
        │
        ▼
lib/supabase/client.ts createBrowserClient()  ── anon key, RLS-scoped reads only
```

A reader can trace: request → middleware refreshes cookie → server client re-uses cookie → `getUser()` verifies identity → `profiles`/`storage.objects` RLS scopes every query to that identity → browser client only ever sees what RLS already allows.

### Recommended Project Structure
```
lib/
├── supabase.ts             # existing plain client — untouched, waitlist keeps using it
└── supabase/
    ├── client.ts            # createBrowserClient() — for Client Components
    ├── server.ts            # createServerClient() — for Server Components/Actions/Route Handlers (awaits cookies())
    └── middleware.ts         # updateSession(request) helper used by root middleware.ts
middleware.ts                # root — calls updateSession(), exports matcher config
supabase/
├── founding-member.sql      # existing
├── venues.sql               # existing
├── profiles.sql             # NEW — table + RLS
└── photos-storage.sql       # NEW — bucket + storage RLS
```

### Pattern 1: Three-client SSR setup
**What:** Separate `createBrowserClient` (browser), `createServerClient` (server, cookie-aware), and a middleware-specific `createServerClient` instance built from the middleware's request/response cookies.
**When to use:** Always, for any Supabase Auth + Next.js App Router integration — this is not optional, it is the only supported shape.
**Example:**
```typescript
// lib/supabase/client.ts
// Source: https://supabase.com/docs/guides/auth/server-side/creating-a-client [CITED]
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// lib/supabase/server.ts
// Source: https://supabase.com/docs/guides/auth/server-side/creating-a-client [CITED]
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies(); // Next 15/16: cookies() is async

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — safe to ignore
            // because middleware refreshes the session on every request.
          }
        },
      },
    }
  );
}
```

```typescript
// lib/supabase/middleware.ts
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs [CITED]
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: do not remove — getUser() re-validates the token
  // and triggers the refresh that populates supabaseResponse's cookies.
  await supabase.auth.getUser();

  return supabaseResponse;
}
```

```typescript
// middleware.ts (repo root)
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs [CITED]
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### Pattern 2: Owner-only RLS on `profiles`
**What:** Enable RLS, then add one policy per operation, each wrapping `auth.uid()` in a `select` so Postgres caches it per statement instead of re-evaluating per row.
**When to use:** Every table where a user should only see/modify their own row.
**Example:**
```sql
-- Source: https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv [CITED]
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
```

### Pattern 3: Per-user Storage RLS
**What:** Private bucket + policies matching the first path segment against the caller's UID.
**When to use:** Any Storage bucket holding user-owned files where paths follow a `{userId}/filename` convention.
**Example:**
```sql
-- Source: https://supabase.com/docs/guides/storage/security/access-control [CITED]
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy "Users can upload own photo"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can view own photo"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can replace own photo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
```

### Anti-Patterns to Avoid
- **Using `getSession()` for any server-side authorization decision:** It reads the JWT from the cookie without verifying its signature — a tampered/expired token can pass. Always use `getUser()` server-side [CITED: github.com/orgs/supabase/discussions/28983].
- **Unwrapped `auth.uid() = id` in RLS policies:** Forces Postgres to re-evaluate the function per row instead of once per statement (`initPlan`). Always wrap as `(select auth.uid())` [CITED: supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv].
- **Public bucket for face photos:** Even an "unguessable path" bucket is a privacy risk for identity photos — URLs leak via referrers, screenshots, logs. Private bucket + signed URL only.
- **Enabling RLS with zero policies:** `alter table ... enable row level security` with no policies locks the table completely — including from its owner via the anon/authenticated roles. Every table needs explicit select/insert/update policies before it's usable.
- **Conflating `profiles` with a generic users table:** PROJECT.md/CLAUDE.md explicitly require a dedicated table separate from `waitlist`/`venues`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT verification | A custom decode-and-check-expiry function | `supabase.auth.getUser()` (or `getClaims()` once asymmetric keys are confirmed) | Verifying JWT signatures correctly (including key rotation, `jwks.json` caching) is exactly the kind of thing that's easy to get subtly wrong; Supabase's SDK already does it |
| Session cookie refresh | Manual `Set-Cookie` logic in each route | `@supabase/ssr`'s `createServerClient` + `updateSession()` in middleware | The three-client cookie-passing contract (`getAll`/`setAll`) is fiddly to get right across Server Components (read-only) vs Route Handlers/Actions vs middleware (read-write) |
| Time-limited private file access | A custom signed-token scheme for photo URLs | `supabase.storage.from(bucket).createSignedUrl(path, expiresIn)` | Storage already implements expiring, tamper-proof signed URLs; reinventing this risks a longer-lived or forgeable link |
| Per-user file path scoping | App-level checks before calling storage APIs | `storage.objects` RLS keyed on `(storage.foldername(name))[1]` | App-level-only checks can be bypassed if any code path calls the storage API directly; RLS is the enforcement backstop regardless of caller |

**Key insight:** Every "don't hand-roll" here maps to the same principle — Supabase Auth + RLS already occupies the security-critical surface for this phase (identity verification, session lifecycle, and per-row/per-object access control). Anything hand-rolled on top duplicates security-sensitive logic that's easy to get wrong and hard to audit.

## Common Pitfalls

### Pitfall 1: Peer dependency mismatch silently breaks the session cookie shape
**What goes wrong:** `@supabase/supabase-js` stays on `^2.108.2` (currently installed) while `@supabase/ssr` expects `^2.111.0`; npm may resolve a version in between that technically satisfies both ranges but wasn't the one tested together, or auth behaves inconsistently.
**Why it happens:** The project's existing `package.json` range is wide enough to be silently satisfied without a real upgrade.
**How to avoid:** Explicitly run `npm install @supabase/supabase-js@^2.111.0` alongside adding `@supabase/ssr`, and check the lockfile diff shows the bump.
**Warning signs:** `npm ls @supabase/supabase-js` shows a version below `2.111.0` after installing `@supabase/ssr`.

### Pitfall 2: RLS enabled but no INSERT policy — profile creation silently fails
**What goes wrong:** Only a `select`/`update` policy is added (common when copy-pasting from a read-focused example), so the first `insert` a new user's Server Action performs into `profiles` is rejected by RLS with a generic permission error.
**Why it happens:** DATA-02's phrasing ("read and write") is easy to under-scope to just select+update, forgetting insert is also "write."
**How to avoid:** Explicitly add insert, select, and update policies (delete only if the product needs it — not required by these requirements). Test the two-account scenario for all three operations, not just read.
**Warning signs:** `new row violates row-level security policy for table "profiles"` on first save.

### Pitfall 3: Storage path convention drift breaks the RLS match
**What goes wrong:** Code uploads to `photos/{userId}-face.jpg` (flat name) instead of `{userId}/face.jpg` (folder prefix), so `(storage.foldername(name))[1]` returns null/empty and every storage RLS check fails.
**Why it happens:** `storage.foldername()` only returns something meaningful when the object key actually contains a `/` path separator.
**How to avoid:** Enforce the `{userId}/filename` convention in the upload code path (Server Action) as the single source of truth for object keys; write it once, don't let call sites construct paths ad hoc.
**Warning signs:** Uploads succeed (if insert policy differs) but reads/signed URLs 403, or all storage policies appear to always deny.

### Pitfall 4: `cookies()` used synchronously
**What goes wrong:** Next.js 15+/16 made `cookies()` and `headers()` async; a server client factory that calls `cookies()` without `await` throws a runtime error or silently returns a Promise instead of a cookie store.
**Why it happens:** Many older tutorials (pre-Next-15) show synchronous `cookies()` usage.
**How to avoid:** Always `const cookieStore = await cookies()` inside an `async function createClient()` [CITED: supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth].
**Warning signs:** TypeScript error on `cookieStore.getAll` (Promise has no such method), or a runtime `cookies() should be awaited` warning in the Next.js dev server.

## Code Examples

Verified/cited patterns are all inline in **Architecture Patterns** above (three-client setup, RLS policies, storage RLS). Full `profiles` table DDL for the wide Phase-3-ready schema:

```sql
-- supabase/profiles.sql
-- Run this in the Supabase SQL editor.
-- Dedicated profiles table (separate from waitlist/venues), one row per
-- authenticated user. Schema is deliberately wide: it anticipates every
-- Phase 3 onboarding field so no mid-milestone follow-up migration is
-- needed. Photo is stored as a storage OBJECT PATH, never a public URL
-- (reads go through createSignedUrl at read time).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  -- Profile basics (FORM-02/03/04)
  photo_path text,                          -- e.g. '{userId}/face.jpg' in the 'photos' bucket
  age int,
  sex text,
  height_cm int,
  ethnicity text,
  interests text[] not null default '{}',   -- free-text tags
  dating_intention text,

  -- Availability (FORM-05)
  meal_availability text[] not null default '{}',   -- subset of {'breakfast','lunch','dinner'}
  available_dates date[] not null default '{}',      -- rolling 14-day multi-select

  -- Match preferences (FORM-06)
  pref_interested_in text[] not null default '{}',  -- subset of {'women','men','other'}
  pref_age_min int,
  pref_age_max int,
  pref_ethnicity text[] not null default '{}',       -- multi-select
  pref_height_cm int,
  pref_similar_interests boolean not null default false, -- unticked = no preference

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
```

```sql
-- supabase/photos-storage.sql
-- Run this in the Supabase SQL editor.
-- Private bucket for face photos. Objects must be uploaded under
-- '{userId}/...' so storage.foldername(name)[1] matches auth.uid().

insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy "Users can upload own photo"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can view own photo"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can replace own photo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own photo"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
```

**Two-account verification procedure** (to satisfy DATA-02's "verified with a two-account test"):
1. Sign in as User A (via a temporary test route or the Supabase dashboard's SQL editor using `set local role authenticated; set local "request.jwt.claims" = '{"sub":"<user-a-uuid>"}';`), insert/select/update a row for `id = <user-a-uuid>` — should succeed.
2. Still as User A, attempt to select/update a row where `id = <user-b-uuid>` — should return zero rows / be rejected.
3. Repeat as User B against User A's row.
4. Repeat the same read/write/cross-read pattern against `storage.objects` using each user's own vs. the other's `{userId}/` path.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | `auth-helpers-nextjs` is deprecated (npm: "Package no longer supported", latest dist-tag `0.15.0`) [VERIFIED: npm registry] | Do not add `auth-helpers-*` to this project under any circumstance; it also has an incompatible cookie shape if mixed with `@supabase/ssr`. |
| `supabase.auth.getSession()` for server auth checks | `supabase.auth.getUser()` (or `getClaims()` on asymmetric-key projects) | Long-standing guidance, reinforced by Supabase's own troubleshooting docs and multiple GitHub discussions [CITED] | `getSession()` must never be trusted for authorization decisions server-side. |
| Symmetric-only JWT verification (always a network call) | Asymmetric JWT signing keys + local `getClaims()` verification | Rolled out progressively; new Supabase projects since May 2025 default to RSA asymmetric keys [CITED: supabase.com/changelog/29289-supabase-auth-asymmetric-keys-support-in-2025] | Not assumed for this project — confirm key type before adopting `getClaims()` in a later phase; `getUser()` remains correct regardless of key type. |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`/`-react`/`-shared`: officially deprecated, registry-flagged; replaced entirely by `@supabase/ssr`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The Supabase project's JWT signing key is symmetric (not asymmetric/RSA), so `getClaims()` would still require a network round-trip and offers no advantage over `getUser()` this phase | Alternatives Considered, State of the Art | Low — even if wrong, `getUser()` remains a correct (if slightly slower) choice; no functional break, only a missed perf optimization to revisit later |
| A2 | `text[]` columns are an acceptable schema choice for `interests`, `meal_availability`, `available_dates`, `pref_interested_in`, `pref_ethnicity` (vs. `jsonb` or normalized child tables) | Code Examples (`profiles.sql`) | Low-medium — if the team later needs per-tag metadata or complex nested preference logic, a migration to `jsonb`/child tables would be needed; acceptable tradeoff for pilot scale per CLAUDE.md's "no over-engineering" stance |
| A3 | A single `photos` bucket (rather than one bucket per purpose) is sufficient, scoped entirely by the `{userId}/` path convention | Code Examples (`photos-storage.sql`) | Low — matches DATA-03's exact wording ("A private Supabase Storage bucket"), singular |

## Open Questions

1. **Does the Supabase project already have any `profiles`-adjacent objects (e.g. an old attempt, a view, a trigger) that could collide with `create table if not exists public.profiles`?**
   - What we know: This environment cannot query the live Supabase project (no MCP/direct DB access).
   - What's unclear: Whether the SQL Editor run will hit any pre-existing object with the same name.
   - Recommendation: Use `create table if not exists` (already the project's established pattern) so a re-run is idempotent; ask the user to confirm no conflicting `profiles` table/view exists before running, since this can't be verified from code.

2. **What is the project's current JWT signing key type (symmetric HS256 vs asymmetric RS256/ECC)?**
   - What we know: New Supabase projects since May 2025 default to asymmetric; this project's creation date/config is unknown from this environment.
   - What's unclear: Whether `getClaims()` could be adopted now instead of `getUser()` for a performance win.
   - Recommendation: Not blocking for this phase — `getUser()` is correct regardless. Revisit in a later phase if middleware latency becomes a measured problem.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@supabase/ssr` (npm registry) | Client wrappers, middleware | ✓ | 0.12.4 | — |
| `@supabase/supabase-js` (npm registry) | Core client, storage/auth calls | ✓ | 2.111.0 | — |
| Supabase project (live, reachable) | Running the shipped `.sql` files | ✗ (no MCP/direct DB access from this environment) | — | User manually runs `supabase/profiles.sql` and `supabase/photos-storage.sql` in the Supabase SQL Editor, per the existing `founding-member.sql`/`venues.sql` pattern — this is the established, intended workflow, not a gap |
| Supabase CLI (local) | Not required this phase | ✓ | 2.104.0 (installed locally) | Not used — schema ships as manually-run SQL files, not CLI migrations, per project convention |
| Node.js | Build/dev | ✓ | v24.11.1 | — |
| npm | Package install | ✓ | 11.6.2 | — |

**Missing dependencies with no fallback:**
- None. The one "missing" item (direct Supabase reachability) has a documented, already-adopted fallback (manual SQL execution) that matches project convention — not a blocker.

**Missing dependencies with fallback:**
- Live Supabase project access → manual SQL Editor execution of the two new `.sql` files (see above).

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | Yes | `@supabase/ssr` cookie-based session management; `supabase.auth.getUser()` for server-side identity verification (never `getSession()`) |
| V3 Session Management | Yes | Middleware-refreshed httpOnly session cookies via `createServerClient`'s `getAll`/`setAll` cookie handlers — never hand-rolled cookie/token logic |
| V4 Access Control | Yes | Postgres RLS on `public.profiles` and `storage.objects`, `(select auth.uid())`-wrapped, verified with the two-account test procedure above |
| V5 Input Validation | No (this phase) | No user-facing input exists yet (no UI/forms this phase) — applicable starting Phase 2/3 |
| V6 Cryptography | Yes (indirect) | JWT signing/verification is entirely delegated to Supabase Auth — never hand-roll JWT decode/verify logic in application code |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Broken access control via missing/incomplete RLS policy (e.g. select-only, no insert policy) | Elevation of Privilege | Explicit select/insert/update policies on both `profiles` and `storage.objects`, each verified by the two-account test in Code Examples |
| IDOR on another user's `profiles` row or photo path | Information Disclosure / Tampering | `(select auth.uid()) = id` on `profiles`; `(storage.foldername(name))[1] = (select auth.uid())::text` on storage — enforced at the database layer, not just app logic |
| JWT spoofing/replay via trusting an unverified session read | Spoofing | `getUser()` (server-verified) instead of `getSession()` (cookie-trusting) everywhere a security decision is made |
| Public exposure of private face photos via a public bucket or leaked long-lived URL | Information Disclosure | Bucket created with `public = false`; all reads via time-limited `createSignedUrl()`, issued server-side only |
| Privilege escalation via unwrapped `auth.uid()` causing inconsistent policy evaluation under load | (indirect — availability/perf, not a direct security bypass) | `(select auth.uid())` wrapping is a performance best practice, not a security requirement, but is included since it's the currently-documented correct pattern and costs nothing extra to apply from the start |

## Sources

### Primary (HIGH confidence)
- npm registry direct query (`npm view @supabase/ssr version` / `peerDependencies`, `npm view @supabase/supabase-js version`, `npm view @supabase/auth-helpers-nextjs deprecated`) — version numbers, peer dependency, deprecation status

### Secondary (MEDIUM confidence — WebSearch results cross-referencing official supabase.com/docs and github.com/orgs/supabase pages)
- https://supabase.com/docs/guides/auth/server-side/nextjs — official Setting up Server-Side Auth for Next.js
- https://supabase.com/docs/guides/auth/server-side/creating-a-client — official client creation guide (browser/server/middleware split)
- https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv — official `(select auth.uid())` initPlan pattern
- https://supabase.com/docs/guides/storage/security/access-control — official Storage RLS/access-control docs
- https://supabase.com/docs/guides/storage/schema/helper-functions — `storage.foldername()` helper function reference
- https://supabase.com/docs/guides/storage/serving/downloads — `createSignedUrl` usage
- https://github.com/orgs/supabase/discussions/28983 — `getUser()` vs `getSession()` security/performance tradeoff discussion (official Supabase org discussion)
- https://supabase.com/docs/reference/javascript/auth-getclaims — official `getClaims()` reference
- https://supabase.com/changelog/29289-supabase-auth-asymmetric-keys-support-in-2025 — official changelog, asymmetric key rollout timeline
- https://supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth — official Next.js 16 async-`cookies()` compatibility guide
- https://supabase.com/docs/guides/database/json — official arrays vs jsonb guidance

### Tertiary (LOW confidence — community sources, used only as corroboration alongside official sources above, never as sole source)
- dev.to / Medium articles on `@supabase/ssr` setup and Storage RLS folder patterns — consistent across multiple independent posts, all pointing back to the same official docs

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — package versions and peer dependencies confirmed directly against the npm registry; deprecation of `auth-helpers-nextjs` confirmed the same way
- Architecture: HIGH — three-client SSR pattern, RLS wrapping pattern, and storage folder-RLS pattern all cross-checked against official Supabase docs via multiple independent WebSearch results pointing to the same canonical pages
- Pitfalls: MEDIUM-HIGH — sourced from official docs plus corroborating community posts; the "no insert policy" and "path convention drift" pitfalls are inferred from the RLS/storage mechanics themselves (first-principles, consistent with the docs) rather than directly cited from a single source

**Research date:** 2026-08-03
**Valid until:** 2026-09-02 (30 days — Supabase SDKs ship frequently; re-verify package versions if planning is delayed)
